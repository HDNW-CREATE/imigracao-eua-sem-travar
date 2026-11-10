import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Lista os arquivos de /public/audio e /public/pdf.
 * O site usa essa lista para saber se um mp3 existe (senão usa a voz do navegador)
 * e quais PDFs estão disponíveis na página de Downloads.
 */
function arquivosPublicos(): Plugin {
  const ID = 'virtual:arquivos-publicos';
  const RESOLVIDO = '\0' + ID;
  const listar = (pasta: string, ext: string) => {
    const dir = resolve(process.cwd(), 'public', pasta);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((f) => f.toLowerCase().endsWith(ext));
  };
  return {
    name: 'arquivos-publicos',
    resolveId(id) {
      if (id === ID) return RESOLVIDO;
    },
    load(id) {
      if (id !== RESOLVIDO) return;
      const dados = { audio: listar('audio', '.mp3'), pdf: listar('pdf', '.pdf') };
      return `export default ${JSON.stringify(dados)};`;
    },
    configureServer(server: ViteDevServer) {
      const recarregar = (arquivo: string) => {
        if (!/[\\/]public[\\/](audio|pdf)[\\/]/.test(arquivo)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVIDO);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', recarregar);
      server.watcher.on('unlink', recarregar);
    },
  };
}

/**
 * Faz a rota /api/aero funcionar também no "npm run dev",
 * usando o mesmo código da função da Vercel (api/aero.ts).
 */
function apiLocal(): Plugin {
  return {
    name: 'api-aero-local',
    configureServer(server) {
      server.middlewares.use('/api/aero', async (req, res) => {
        try {
          let corpo: unknown = undefined;
          if (req.method === 'POST') {
            const partes: Buffer[] = [];
            for await (const parte of req) partes.push(parte as Buffer);
            const texto = Buffer.concat(partes).toString('utf8');
            try {
              corpo = texto ? JSON.parse(texto) : undefined;
            } catch {
              corpo = undefined;
            }
          }
          const mod = await server.ssrLoadModule('/api/aero.ts');
          const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'local';
          const resposta = await mod.processarAero({ metodo: req.method ?? 'GET', corpo, ip });
          res.statusCode = resposta.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(resposta.dados));
        } catch (erro) {
          console.error('[api/aero]', erro);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ erro: 'falha_interna' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Carrega o .env local para a função do chat (a chave nunca vai para o front-end).
  const env = loadEnv(mode, process.cwd(), '');
  if (env.AI_API_KEY && !process.env.AI_API_KEY) process.env.AI_API_KEY = env.AI_API_KEY;
  if (env.AI_MODEL && !process.env.AI_MODEL) process.env.AI_MODEL = env.AI_MODEL;

  return {
    plugins: [react(), tailwindcss(), arquivosPublicos(), apiLocal()],
    resolve: {
      alias: { '@content': resolve(process.cwd(), 'content') },
    },
  };
});
