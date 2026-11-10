// Todo o conteúdo vem dos arquivos JSON da pasta /content.
import perguntasJson from '@content/perguntas.json';
import resgateJson from '@content/resgate.json';
import checklistJson from '@content/checklist.json';
import pronunciaJson from '@content/pronuncia.json';
import deslizesJson from '@content/deslizes.json';
import apoioJson from '@content/apoio.json';
import downloadsJson from '@content/downloads.json';
import type { Apoio, ChaveCenario, Deslizes, Download, FraseResgate, GrupoChecklist, Pergunta, Pronuncia } from './tipos';

export const perguntas = (perguntasJson as unknown as Pergunta[])
  .filter((p) => p && p.codigo)
  .sort((a, b) => a.codigo.localeCompare(b.codigo, 'en', { numeric: true }));
export const resgate = resgateJson as unknown as FraseResgate[];
export const checklist = checklistJson as unknown as GrupoChecklist[];
export const pronuncia = pronunciaJson as unknown as Pronuncia;
export const deslizes = deslizesJson as unknown as Deslizes;
export const apoio = apoioJson as unknown as Apoio;
export const downloads = downloadsJson as unknown as Download[];

export const BLOCOS = [
  { id: 'A', nome: 'Abertura' },
  { id: 'B', nome: 'Sobre a viagem' },
  { id: 'C', nome: 'Quem é você' },
  { id: 'D', nome: 'Dinheiro, bagagem e alfândega' },
  { id: 'E', nome: 'Perguntas extras' },
] as const;

export const nomeBloco = (id: string) => BLOCOS.find((b) => b.id === id)?.nome ?? id;

export const ROTULO_CENARIO: Record<ChaveCenario, string> = {
  unico: 'Resposta',
  turismo: 'Turismo',
  familia: 'Família',
  trabalho: 'Trabalho',
  hotel: 'Hotel',
  eu: 'Eu pago',
  empresa: 'Empresa',
};

export const ROTULO_NIVEL: Record<number, { nome: string; descricao: string }> = {
  1: { nome: 'Curta', descricao: 'O mínimo para responder com segurança.' },
  2: { nome: 'Completa', descricao: 'Frase inteira, a mais indicada.' },
  3: { nome: 'Segurança', descricao: 'Com um detalhe a mais, se o oficial pedir.' },
};

export const totalChecklist = checklist.reduce((s, g) => s + g.itens.length, 0);

export function chavesCenario(p: Pergunta): ChaveCenario[] {
  return (Object.keys(p.cenarios ?? {}) as ChaveCenario[]).filter((k) => (p.cenarios[k]?.length ?? 0) > 0);
}

/** Escolhe o cenário preferido do aluno, se a pergunta tiver; senão o primeiro. */
export function cenarioPara(p: Pergunta, preferido?: string | null): ChaveCenario | null {
  const chaves = chavesCenario(p);
  if (!chaves.length) return null;
  if (preferido && chaves.includes(preferido as ChaveCenario)) return preferido as ChaveCenario;
  return chaves[0];
}

export function respostaPara(p: Pergunta, nivel: number, preferido?: string | null) {
  const c = cenarioPara(p, preferido);
  if (!c) return undefined;
  const lista = p.cenarios[c] ?? [];
  return lista.find((r) => r.nivel === nivel) ?? lista[0];
}
