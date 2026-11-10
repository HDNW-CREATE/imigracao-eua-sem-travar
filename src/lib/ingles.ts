// Ajudantes de inglês: números por extenso, datas, artigo a/an.

const UNIDADES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const DEZENAS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function ate999(n: number): string {
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c) partes.push(`${UNIDADES[c]} hundred`);
  if (r) {
    if (r < 20) partes.push(UNIDADES[r]);
    else partes.push(DEZENAS[Math.floor(r / 10)] + (r % 10 ? `-${UNIDADES[r % 10]}` : ''));
  }
  return partes.join(' ');
}

/** 2500 -> "two thousand five hundred" (estilo americano, sem "and"). */
export function numeroPorExtenso(valor: number): string {
  const n = Math.floor(Math.abs(valor));
  if (n === 0) return 'zero';
  if (n >= 1_000_000_000) return n.toLocaleString('en-US');
  const partes: string[] = [];
  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  if (milhoes) partes.push(`${ate999(milhoes)} million`);
  if (milhares) partes.push(`${ate999(milhares)} thousand`);
  if (resto) partes.push(ate999(resto));
  return partes.join(' ');
}

const ORDINAIS_ESPECIAIS: Record<string, string> = {
  one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth',
};

/** 13 -> "thirteenth", 21 -> "twenty-first". */
export function ordinalPorExtenso(n: number): string {
  const palavras = numeroPorExtenso(n);
  const m = palavras.match(/^(.*?)([a-z]+)$/);
  if (!m) return palavras;
  const [, inicio, ultima] = m;
  let ord: string;
  if (ORDINAIS_ESPECIAIS[ultima]) ord = ORDINAIS_ESPECIAIS[ultima];
  else if (ultima.endsWith('y')) ord = ultima.slice(0, -1) + 'ieth';
  else ord = ultima + 'th';
  return inicio + ord;
}

export const MESES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** (3, 13) -> "March thirteenth". */
export function dataPorExtenso(mes: number, dia: number): string {
  return `${MESES_EN[mes - 1]} ${ordinalPorExtenso(dia)}`;
}

const COM_SOM_DE_VOGAL_EXCECOES = /^(hour|honest|honor|honour|heir)/i;
const COM_SOM_DE_CONSOANTE_EXCECOES = /^(uni|use|usu|uti|euro|eu|one|once|ufo|u\b)/i;

/** "engineer" -> "an engineer", "teacher" -> "a teacher", "university professor" -> "a university professor". */
export function comArtigo(palavra: string): string {
  const limpo = palavra.trim().replace(/^(a|an)\s+/i, '');
  if (!limpo) return limpo;
  let an = /^[aeiou]/i.test(limpo);
  if (COM_SOM_DE_VOGAL_EXCECOES.test(limpo)) an = true;
  else if (COM_SOM_DE_CONSOANTE_EXCECOES.test(limpo)) an = false;
  return `${an ? 'an' : 'a'} ${limpo}`;
}

export function capitalizar(t: string) {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}
