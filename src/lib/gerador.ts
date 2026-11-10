// Monta as respostas personalizadas do Bônus 4 a partir dos dados do aluno.
import { capitalizar, comArtigo, dataPorExtenso, numeroPorExtenso } from './ingles';

export type Motivo = 'turismo' | 'familia' | 'trabalho';
export type Hospedagem = 'hotel' | 'familiar' | 'amigo' | 'aluguel';
export type QuemPaga = 'eu' | 'empresa' | 'familiar';

export interface DadosGerador {
  motivo: Motivo;
  cidadeMora: string;
  destino: string;
  cidades: string;
  mesVolta: number;
  diaVolta: number;
  dias: number;
  hospedagem: Hospedagem;
  parentesco: string;
  comQuem: string;
  profissao: string;
  quemPaga: QuemPaga;
  dinheiro: number;
  primeiraVez: 'sim' | 'nao';
}

export const DADOS_INICIAIS: DadosGerador = {
  motivo: 'turismo',
  cidadeMora: '',
  destino: '',
  cidades: '',
  mesVolta: 0,
  diaVolta: 0,
  dias: 0,
  hospedagem: 'hotel',
  parentesco: 'sister',
  comQuem: 'alone',
  profissao: '',
  quemPaga: 'eu',
  dinheiro: 0,
  primeiraVez: 'sim',
};

export const OPCOES_COM_QUEM = [
  { en: 'alone', pt: 'Sozinho(a)' },
  { en: 'my wife', pt: 'Com a esposa' },
  { en: 'my husband', pt: 'Com o marido' },
  { en: 'my partner', pt: 'Com o(a) parceiro(a)' },
  { en: 'my family', pt: 'Com a família' },
  { en: 'my wife and my children', pt: 'Com a esposa e os filhos' },
  { en: 'my husband and my children', pt: 'Com o marido e os filhos' },
  { en: 'my children', pt: 'Com os filhos' },
  { en: 'my parents', pt: 'Com os pais' },
  { en: 'a friend', pt: 'Com um(a) amigo(a)' },
  { en: 'some friends', pt: 'Com amigos' },
  { en: 'a colleague from work', pt: 'Com um(a) colega de trabalho' },
];

export const LIMITE_DECLARACAO = 10_000;

export interface CardResposta {
  id: string;
  titulo: string;
  perguntaEn: string;
  perguntaPt: string;
  niveis: [string, string, string];
}

// Profissões que são adjetivos (sem artigo): "I'm retired."
const SEM_ARTIGO = new Set(['retired', 'self-employed', 'unemployed', 'self employed']);

function limpar(t: string) {
  return t.trim().replace(/\s+/g, ' ').replace(/[.]+$/, '');
}

function cidadeBrasil(cidade: string) {
  const c = limpar(cidade);
  if (!c) return 'Brazil';
  return /brazil|brasil/i.test(c) ? c.replace(/brasil/i, 'Brazil') : `${c}, Brazil`;
}

function dias(n: number) {
  return n === 1 ? 'one day' : `${numeroPorExtenso(n)} days`;
}

function dolares(n: number) {
  return `${numeroPorExtenso(n)} ${n === 1 ? 'dollar' : 'dollars'}`;
}

/** Valida o formulário; devolve a lista de campos faltando (em português). */
export function camposFaltando(d: DadosGerador): string[] {
  const f: string[] = [];
  if (!limpar(d.cidadeMora)) f.push('cidade onde mora');
  if (!limpar(d.destino)) f.push('cidade de destino');
  if (!d.mesVolta || !d.diaVolta) f.push('mês e dia da volta');
  if (!d.dias || d.dias < 1) f.push('número de dias');
  if (!limpar(d.profissao)) f.push('profissão em inglês');
  if (d.dinheiro < 0 || Number.isNaN(d.dinheiro)) f.push('dinheiro em dólares');
  return f;
}

export function diaValido(mes: number, dia: number) {
  if (!mes || !dia) return true;
  const max = new Date(2028, mes, 0).getDate(); // ano bissexto para aceitar 29/02
  return dia <= max;
}

export function gerarRespostas(d: DadosGerador): CardResposta[] {
  const destino = limpar(d.destino);
  const cidades = limpar(d.cidades) || destino;
  const origem = cidadeBrasil(d.cidadeMora);
  const cidadeSo = limpar(d.cidadeMora).replace(/,?\s*(brazil|brasil)$/i, '') || 'my city';
  const volta = dataPorExtenso(d.mesVolta, d.diaVolta);
  const nDias = dias(d.dias);
  const par = limpar(d.parentesco) || 'family';
  const prof = limpar(d.profissao).toLowerCase().replace(/^(a|an)\s+/, '');
  const comQuem = d.comQuem || 'alone';
  const sozinho = comQuem === 'alone';

  const motivoCurto: Record<Motivo, string> = {
    turismo: 'on vacation',
    familia: `to visit my ${par}`,
    trabalho: 'for a business meeting',
  };
  const tipoViagem: Record<Motivo, string> = { turismo: 'a vacation trip', familia: 'a family trip', trabalho: 'a business trip' };

  const cards: CardResposta[] = [];

  // 1. Motivo
  const motivo: Record<Motivo, [string, string, string]> = {
    turismo: ['Tourism.', "I'm here on vacation.", `I'm here on vacation. I'll visit ${cidades}.`],
    familia: ['To visit family.', `I'm here to visit my ${par}.`, `I'm here to visit my ${par} in ${destino}. I'll stay for ${nDias}.`],
    trabalho: ['Business.', "I'm here for a business meeting.", `I'm here for a business meeting in ${destino}. I'm going back to Brazil on ${volta}.`],
  };
  cards.push({ id: 'motivo', titulo: 'Motivo da viagem', perguntaEn: 'What is the purpose of your visit?', perguntaPt: 'Qual é o motivo da sua visita?', niveis: motivo[d.motivo] });

  // 2. Tempo de estadia
  cards.push({
    id: 'estadia',
    titulo: 'Tempo de estadia',
    perguntaEn: 'How long will you be staying?',
    perguntaPt: 'Quanto tempo você vai ficar?',
    niveis: [`${capitalizar(nDias)}.`, `I'll be here for ${nDias}.`, `I'll be here for ${nDias}, until ${volta}. My return ticket is already booked.`],
  });

  // 3. Onde vai ficar
  const hosp: Record<Hospedagem, [string, string, string]> = {
    hotel: ['At a hotel.', `I'll stay at a hotel in ${destino}.`, `I'll stay at a hotel in ${destino}. I have the reservation on my phone.`],
    familiar: [`With my ${par}.`, `I'll stay at my ${par}'s house.`, `I'll stay at my ${par}'s house in ${destino}. I have the address here.`],
    amigo: ['With a friend.', `I'll stay at my friend's house.`, `I'll stay at my friend's house in ${destino}. I have the address here.`],
    aluguel: ['In a vacation rental.', `I'll stay in a vacation rental in ${destino}.`, `I'll stay in a vacation rental in ${destino}. I have the reservation on my phone.`],
  };
  cards.push({ id: 'hospedagem', titulo: 'Onde vai ficar', perguntaEn: 'Where will you be staying?', perguntaPt: 'Onde você vai ficar?', niveis: hosp[d.hospedagem] });

  // 4. Primeira vez
  cards.push({
    id: 'primeira',
    titulo: 'Primeira vez nos EUA',
    perguntaEn: 'Is this your first time in the United States?',
    perguntaPt: 'É a sua primeira vez nos Estados Unidos?',
    niveis:
      d.primeiraVez === 'sim'
        ? ['Yes, it is.', 'Yes, this is my first time.', "Yes, this is my first time here. I'm very excited."]
        : ["No, it isn't.", "No, I've been here before.", `No, I've been here before. This time I'm here ${motivoCurto[d.motivo]}.`],
  });

  // 5. De onde vem
  cards.push({
    id: 'origem',
    titulo: 'De onde você vem',
    perguntaEn: 'Where are you coming from?',
    perguntaPt: 'De onde você está vindo?',
    niveis: ['From Brazil.', `I'm coming from ${origem}.`, `I'm coming from ${origem}. I live there.`],
  });

  // 6. Passagem de volta
  cards.push({
    id: 'passagem',
    titulo: 'Passagem de volta',
    perguntaEn: 'Do you have a return ticket?',
    perguntaPt: 'Você tem passagem de volta?',
    niveis: ['Yes, I do.', 'Yes, I have a return ticket.', `Yes, I have a return ticket for ${volta}. I can show it to you.`],
  });

  // 7. Quando volta
  cards.push({
    id: 'volta',
    titulo: 'Quando você volta',
    perguntaEn: 'When are you going back?',
    perguntaPt: 'Quando você vai voltar?',
    niveis: [`${volta}.`, `I'm going back on ${volta}.`, `I'm going back to Brazil on ${volta}. My return ticket is already booked.`],
  });

  // 8. Viaja sozinho?
  cards.push({
    id: 'companhia',
    titulo: 'Viaja sozinho(a)?',
    perguntaEn: 'Are you traveling alone?',
    perguntaPt: 'Você está viajando sozinho(a)?',
    niveis: sozinho
      ? ['Yes, alone.', "Yes, I'm traveling alone.", `Yes, I'm traveling alone. This is ${tipoViagem[d.motivo]}.`]
      : [`No, with ${comQuem}.`, `No, I'm traveling with ${comQuem}.`, `No, I'm traveling with ${comQuem}. We're here ${d.motivo === 'familia' ? `to visit my ${par}` : motivoCurto[d.motivo]}.`],
  });

  // 9. Cidades
  cards.push({
    id: 'cidades',
    titulo: 'Cidades que vai visitar',
    perguntaEn: 'Which cities will you visit?',
    perguntaPt: 'Quais cidades você vai visitar?',
    niveis: [`${cidades}.`, `I'll visit ${cidades}.`, `I'll visit ${cidades}. I'll be here for ${nDias} in total.`],
  });

  // 10. Profissão
  let nivelProf: [string, string, string];
  const extraProf = d.motivo === 'turismo' ? "I'm on vacation now." : `I'm here ${motivoCurto[d.motivo]}.`;
  if (SEM_ARTIGO.has(prof)) {
    nivelProf = [`I'm ${prof}.`, `I'm ${prof}. I live in ${origem}.`, `I'm ${prof}, and I live in ${origem}. ${extraProf}`];
  } else if (prof === 'student') {
    nivelProf = ["I'm a student.", "I'm a student in Brazil.", `I'm a student in ${cidadeSo}, Brazil. ${extraProf}`];
  } else if (prof === 'business owner') {
    nivelProf = ["I'm a business owner.", 'I have my own business in Brazil.', `I have my own business in ${cidadeSo}, Brazil. ${extraProf}`];
  } else {
    const comA = comArtigo(prof);
    nivelProf = [`I'm ${comA}.`, `I work as ${comA} in Brazil.`, `I work as ${comA} in ${cidadeSo}, Brazil. ${extraProf}`];
  }
  cards.push({ id: 'profissao', titulo: 'Profissão', perguntaEn: 'What do you do for a living?', perguntaPt: 'O que você faz da vida? (Qual é a sua profissão?)', niveis: nivelProf });

  // 11. Quem paga
  const paga: Record<QuemPaga, [string, string, string]> = {
    eu: ['I am.', "I'm paying for the trip myself.", "I'm paying for the trip myself. I saved money for it."],
    empresa: ['My company.', 'My company is paying for it.', `My company is paying for my trip. It's a business trip, and I'm going back to Brazil on ${volta}.`],
    familiar: [`My ${par}.`, `My ${par} is paying for the trip.`, `My ${par} is paying for my trip. I'll stay for ${nDias}.`],
  };
  cards.push({ id: 'paga', titulo: 'Quem paga a viagem', perguntaEn: 'Who is paying for your trip?', perguntaPt: 'Quem está pagando a sua viagem?', niveis: paga[d.quemPaga] });

  // 12. Dinheiro
  const valor = Math.round(d.dinheiro);
  cards.push({
    id: 'dinheiro',
    titulo: 'Dinheiro que leva',
    perguntaEn: 'How much money are you carrying?',
    perguntaPt: 'Quanto dinheiro você está levando?',
    niveis:
      valor > 0
        ? [`About ${dolares(valor)}.`, `I have about ${dolares(valor)} with me.`, `I have about ${dolares(valor)} with me. That's enough for my trip.`]
        : ['Only my cards.', "I'm not carrying cash. I have my cards.", "I'm not carrying cash. I'll use my cards during the trip."],
  });

  return cards;
}
