export type Nivel = 1 | 2 | 3;

export interface RespostaModelo {
  nivel: Nivel;
  en: string;
  pt?: string;
  audio?: string;
  pronuncia?: string;
}

export type ChaveCenario = 'unico' | 'turismo' | 'familia' | 'trabalho' | 'hotel' | 'eu' | 'empresa';

export interface Pergunta {
  codigo: string;
  bloco: 'A' | 'B' | 'C' | 'D' | 'E';
  pt: string;
  en: string;
  audio?: string;
  pronuncia?: string;
  dica?: string;
  cenarios: Partial<Record<ChaveCenario, RespostaModelo[]>>;
}

export interface FraseResgate {
  id: string;
  en: string;
  pt: string;
  pronuncia?: string;
  audio?: string;
  quando?: string;
}

export interface GrupoChecklist {
  id: string;
  titulo: string;
  itens: { id: string; texto: string }[];
}

export interface ItemApoio {
  pt: string;
  en: string;
  pronuncia: string;
}

export interface Apoio {
  meses: ItemApoio[];
  ordinais: ItemApoio[];
  observacaoOrdinais: string;
  diasSemana: ItemApoio[];
  datasTreino: ItemApoio[];
  numeros: ItemApoio[];
  observacaoNumeros: string;
  dinheiro: ItemApoio[];
  parentesco: ItemApoio[];
  profissoes: ItemApoio[];
  checagemFinal: string[];
}

export interface FrasePronuncia {
  id: string;
  en: string;
  pronuncia: string;
  audio?: string;
  nivel?: number;
  grupo?: string;
  observacao?: string;
  pt?: string;
}

export interface Pronuncia {
  titulo: string;
  subtitulo: string;
  paraQueServe: string;
  legenda: { simbolo: string; explicacao: string; exemplo: string }[];
  observacaoLegenda: string;
  dicas: { titulo: string; texto: string }[];
  oficial: FrasePronuncia[];
  perguntas: { codigo: string; en: string; pronuncia: string; audio?: string; respostas: FrasePronuncia[] }[];
  resgate: FrasePronuncia[];
  treinoRapido: string[];
  aviso: string;
}

export interface Deslize {
  numero: number;
  titulo: string;
  oQueAcontece: string;
  emVezDe: string;
  diga: { en?: string; pt?: string }[];
  tabela?: { emVezDe: string; diga: string }[];
  atencao?: string;
  treino: string;
}

export interface Deslizes {
  titulo: string;
  subtitulo: string;
  paraQueServe: string;
  principio: string;
  deslizes: Deslize[];
  conversaLonga: { titulo: string; texto: string; itens: { pt: string; en?: string }[]; aviso: string };
  checklistRapido: string[];
}

export interface Download {
  arquivo: string;
  titulo: string;
  descricao?: string;
}
