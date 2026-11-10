import { CHAVES, useLocal } from './armazenamento';
import { perguntas, totalChecklist, checklist } from './conteudo';

export function useTreinadas() {
  const [lista, setLista] = useLocal<string[]>(CHAVES.treinadas, []);
  const validas = lista.filter((c) => perguntas.some((p) => p.codigo === c));
  const set = new Set(validas);
  const alternar = (codigo: string) =>
    setLista((ant) => (ant.includes(codigo) ? ant.filter((c) => c !== codigo) : [...ant, codigo]));
  const marcar = (codigos: string[]) => setLista((ant) => Array.from(new Set([...ant, ...codigos])));
  return { treinadas: set, total: validas.length, alternar, marcar };
}

export function useChecklist() {
  const [marcados, setMarcados] = useLocal<Record<string, boolean>>(CHAVES.checklist, {});
  const idsValidos = new Set(checklist.flatMap((g) => g.itens.map((i) => i.id)));
  const feitos = Object.entries(marcados).filter(([id, v]) => v && idsValidos.has(id)).length;
  return {
    marcados,
    feitos,
    total: totalChecklist,
    alternar: (id: string) => setMarcados((ant) => ({ ...ant, [id]: !ant[id] })),
    limpar: () => setMarcados({}),
  };
}

export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
