// Adaptador para a Netlify: usa o mesmo código da função da Vercel (api/aero.ts).
import { processarAero } from '../../api/aero';

export default async (req: Request) => {
  let corpo: unknown = undefined;
  if (req.method === 'POST') {
    try {
      corpo = await req.json();
    } catch {
      corpo = undefined;
    }
  }
  const ip = req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
  const r = await processarAero({ metodo: req.method, corpo, ip });
  return new Response(JSON.stringify(r.dados), {
    status: r.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

export const config = { path: '/api/aero' };
