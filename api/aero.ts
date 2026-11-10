/**
 * Função do chat "Aero" (único código de servidor do site).
 *
 * - Vercel: este arquivo vira a rota /api/aero automaticamente.
 * - npm run dev: o vite.config.ts chama processarAero() direto.
 * - Netlify: netlify/functions/aero.mts reaproveita processarAero().
 *
 * A chave da IA fica SÓ na variável de ambiente AI_API_KEY (nunca no front-end).
 * Opcional: AI_MODEL para trocar o modelo (padrão abaixo).
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MODELO_PADRAO = 'claude-opus-5-5';
// Modelos que aceitam o "fallback" automático do servidor quando recusam um pedido.
const MODELOS_COM_FALLBACK = new Set(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-fable-5-2']);

const LIMITE_DIARIO = 30;
const MAX_CARACTERES = 500;
const MAX_PALAVRAS_RESPOSTA = 260;
const MAX_MENSAGENS_HISTORICO = 12;

const INSTRUCAO_SISTEMA = `Você é o Aero, assistente do site Imigração EUA sem Travar. Responda em português do Brasil, de forma curta, clara e amigável, com exemplos em inglês. Ajude com: (1) o site (como usar, treinar as 30 perguntas, os 3 níveis, áudios, frases de resgate, checklist, bônus, Cartão e Gerador); (2) inglês (traduzir frases nos dois sentidos, explicar palavras e expressões, ensinar como se fala com pronúncia escrita em português e sílaba forte em MAIÚSCULAS, dúvidas de inglês de viagem, aeroporto e imigração); (3) correção (diga se a resposta em inglês está correta e mostre uma versão melhor e curta, explicando o ajuste em uma frase); (4) treino (se pedirem 'treinar com o oficial', faça UMA pergunta por vez, em inglês, espere a resposta, diga se entendeu bem e dê uma dica); (5) ajudar o aluno a dizer a SUA verdade em inglês, com frases simples. Se o aluno quiser dizer algo que não é verdade, não ajude a construir essa resposta; diga que o melhor é falar a verdade e ofereça ajuda para dizê-la em inglês. Não dê orientação jurídica nem de visto, não garanta aprovação e não invente regras de entrada nos EUA; para regras oficiais, indique cbp.gov e o consulado. Respostas curtas (até ~150 palavras), com 1 ou 2 exemplos, terminando com uma pergunta se quer treinar mais. Para suporte ou pagamento, indique contato.partiueua2027@gmail.com. Assuntos sem relação com o site ou com inglês: diga gentilmente que só ajuda com isso.`;

type Papel = 'user' | 'assistant';
interface Mensagem {
  role: Papel;
  content: string;
}
interface Entrada {
  metodo: string;
  corpo: unknown;
  ip: string;
}
interface Saida {
  status: number;
  dados: Record<string, unknown>;
}

// ---------- Limite por IP (memória da função; zera quando a função reinicia) ----------
const usoPorIp = new Map<string, { dia: string; total: number }>();
function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function consumirLimite(ip: string): boolean {
  const dia = hoje();
  const atual = usoPorIp.get(ip);
  if (!atual || atual.dia !== dia) {
    if (usoPorIp.size > 5000) usoPorIp.clear();
    usoPorIp.set(ip, { dia, total: 1 });
    return true;
  }
  if (atual.total >= LIMITE_DIARIO) return false;
  atual.total += 1;
  return true;
}

// ---------- Contexto: as 3 perguntas mais parecidas com a dúvida ----------
interface Resposta {
  nivel?: number;
  en: string;
  pt?: string;
}
interface Pergunta {
  codigo: string;
  bloco?: string;
  pt: string;
  en: string;
  dica?: string;
  cenarios?: Record<string, Resposta[]>;
}

let cachePerguntas: Pergunta[] | null = null;
function carregarPerguntas(): Pergunta[] {
  if (cachePerguntas) return cachePerguntas;
  try {
    const texto = readFileSync(join(process.cwd(), 'content', 'perguntas.json'), 'utf8');
    const dados = JSON.parse(texto);
    cachePerguntas = Array.isArray(dados) ? dados : [];
  } catch {
    cachePerguntas = [];
  }
  return cachePerguntas;
}

const PALAVRAS_VAZIAS = new Set(
  'a o as os de da do das dos e em no na nos nas um uma para por com que se eu me meu minha voce como the is are you your to of and in on for do i my it what this'.split(' '),
);
function palavras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2 && !PALAVRAS_VAZIAS.has(p));
}

function contextoRelevante(duvida: string): string {
  const perguntas = carregarPerguntas();
  if (!perguntas.length) return '';
  const alvo = new Set(palavras(duvida));
  const pontuadas = perguntas.map((p, i) => {
    const respostas = Object.values(p.cenarios ?? {})
      .flat()
      .map((r) => `${r.en} ${r.pt ?? ''}`)
      .join(' ');
    const doc = palavras(`${p.codigo} ${p.pt} ${p.en} ${p.dica ?? ''} ${respostas}`);
    let pontos = 0;
    for (const w of doc) if (alvo.has(w)) pontos += 1;
    if (duvida.toUpperCase().includes(p.codigo)) pontos += 10;
    return { p, pontos, i };
  });
  pontuadas.sort((a, b) => b.pontos - a.pontos || a.i - b.i);
  return pontuadas
    .slice(0, 3)
    .map(({ p }) => {
      const linhas = [`${p.codigo}: "${p.en}" (${p.pt})`];
      for (const [cenario, lista] of Object.entries(p.cenarios ?? {})) {
        for (const r of lista) {
          linhas.push(`  - ${cenario === 'unico' ? '' : cenario + ', '}nível ${r.nivel ?? '?'}: ${r.en}`);
        }
      }
      if (p.dica) linhas.push(`  Dica: ${p.dica}`);
      return linhas.join('\n');
    })
    .join('\n');
}

// ---------- Validação das mensagens ----------
function validarMensagens(corpo: unknown): Mensagem[] | null {
  if (!corpo || typeof corpo !== 'object') return null;
  const lista = (corpo as { mensagens?: unknown }).mensagens;
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const limpas: Mensagem[] = [];
  for (const item of lista.slice(-MAX_MENSAGENS_HISTORICO)) {
    if (!item || typeof item !== 'object') return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const texto = content.trim();
    if (!texto) continue;
    if (role === 'user' && texto.length > MAX_CARACTERES) return null;
    limpas.push({ role, content: texto.slice(0, 2500) });
  }
  // Começa com o aluno e alterna os papéis.
  while (limpas.length && limpas[0].role !== 'user') limpas.shift();
  const alternadas: Mensagem[] = [];
  for (const m of limpas) {
    const ultima = alternadas[alternadas.length - 1];
    if (ultima && ultima.role === m.role) ultima.content += '\n' + m.content;
    else alternadas.push({ ...m });
  }
  if (!alternadas.length || alternadas[alternadas.length - 1].role !== 'user') return null;
  return alternadas;
}

function limitarPalavras(texto: string): string {
  const partes = texto.split(/(\s+)/);
  let contagem = 0;
  let saida = '';
  for (const parte of partes) {
    if (parte.trim()) contagem += 1;
    if (contagem > MAX_PALAVRAS_RESPOSTA) return saida.trimEnd() + '…';
    saida += parte;
  }
  return saida;
}

// ---------- Processamento principal ----------
export async function processarAero({ metodo, corpo, ip }: Entrada): Promise<Saida> {
  const chave = process.env.AI_API_KEY;

  if (metodo === 'GET') {
    return { status: 200, dados: { disponivel: Boolean(chave), limiteDiario: LIMITE_DIARIO } };
  }
  if (metodo !== 'POST') {
    return { status: 405, dados: { erro: 'metodo_nao_permitido' } };
  }
  if (!chave) {
    return { status: 503, dados: { erro: 'indisponivel', mensagem: 'O Aero está indisponível no momento.' } };
  }

  const mensagens = validarMensagens(corpo);
  if (!mensagens) {
    return { status: 400, dados: { erro: 'mensagem_invalida', mensagem: `Escreva uma mensagem de até ${MAX_CARACTERES} caracteres.` } };
  }

  if (!consumirLimite(ip || 'desconhecido')) {
    return {
      status: 429,
      dados: { erro: 'limite', mensagem: `Você chegou ao limite de ${LIMITE_DIARIO} mensagens por hoje. Volte amanhã para continuar treinando!` },
    };
  }

  const ultimaDuvida = mensagens[mensagens.length - 1].content;
  const contexto = contextoRelevante(ultimaDuvida);
  const sistema = contexto
    ? `${INSTRUCAO_SISTEMA}\n\nTrechos do conteúdo do site (use se forem úteis; os dados dos exemplos são fictícios):\n${contexto}`
    : INSTRUCAO_SISTEMA;

  const modelo = process.env.AI_MODEL || MODELO_PADRAO;
  const cliente = new Anthropic({ apiKey: chave, maxRetries: 1, timeout: 25_000 });

  try {
    const resposta = await cliente.beta.messages.create({
      model: modelo,
      max_tokens: 2000,
      system: sistema,
      messages: mensagens,
      output_config: { effort: 'low' },
      ...(MODELOS_COM_FALLBACK.has(modelo) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    });

    if (resposta.stop_reason === 'refusal') {
      return {
        status: 200,
        dados: { resposta: 'Desculpe, não consigo ajudar com isso. Posso ajudar com o site ou com o seu inglês para a viagem. Quer treinar uma pergunta?' },
      };
    }

    let texto = '';
    for (const bloco of resposta.content) {
      if (bloco.type === 'text') texto += bloco.text;
    }
    texto = texto.trim();
    if (!texto) {
      return { status: 502, dados: { erro: 'vazio', mensagem: 'Não consegui responder agora. Tente de novo em instantes.' } };
    }
    return { status: 200, dados: { resposta: limitarPalavras(texto) } };
  } catch (erro) {
    if (erro instanceof Anthropic.AuthenticationError || erro instanceof Anthropic.PermissionDeniedError) {
      console.error('[aero] chave inválida ou sem permissão');
      return { status: 503, dados: { erro: 'indisponivel', mensagem: 'O Aero está indisponível no momento.' } };
    }
    if (erro instanceof Anthropic.RateLimitError) {
      return { status: 429, dados: { erro: 'ocupado', mensagem: 'O Aero está com muitas conversas agora. Tente de novo em um minuto.' } };
    }
    if (erro instanceof Anthropic.APIError) {
      console.error('[aero] erro da API', erro.status, erro.message);
    } else {
      console.error('[aero] erro inesperado', erro);
    }
    return { status: 502, dados: { erro: 'falha', mensagem: 'Não consegui responder agora. Tente de novo em instantes.' } };
  }
}

// ---------- Formato da Vercel (Node.js) ----------
interface RequisicaoVercel {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}
interface RespostaVercel {
  status(codigo: number): RespostaVercel;
  json(dados: unknown): void;
  setHeader(nome: string, valor: string): void;
}

export default async function handler(req: RequisicaoVercel, res: RespostaVercel) {
  const encaminhado = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(encaminhado) ? encaminhado[0] : encaminhado)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'desconhecido';
  let corpo = req.body;
  if (typeof corpo === 'string') {
    try {
      corpo = JSON.parse(corpo);
    } catch {
      corpo = undefined;
    }
  }
  const r = await processarAero({ metodo: req.method ?? 'GET', corpo, ip });
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.dados);
}
