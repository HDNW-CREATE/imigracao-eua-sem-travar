import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cabecalho, Etiqueta } from '../components/Ui';
import { IconeBusca, IconeCheck, IconePlay } from '../components/Icones';
import { BLOCOS, perguntas } from '../lib/conteudo';
import { useTreinadas } from '../lib/progresso';

type Status = 'todas' | 'treinadas' | 'nao';

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function Perguntas() {
  const { treinadas } = useTreinadas();
  const [busca, setBusca] = useState('');
  const [bloco, setBloco] = useState<string>('todos');
  const [status, setStatus] = useState<Status>('todas');

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return perguntas.filter((p) => {
      if (bloco !== 'todos' && p.bloco !== bloco) return false;
      if (status === 'treinadas' && !treinadas.has(p.codigo)) return false;
      if (status === 'nao' && treinadas.has(p.codigo)) return false;
      if (!termo) return true;
      const respostas = Object.values(p.cenarios ?? {})
        .flat()
        .map((r) => `${r?.en ?? ''} ${r?.pt ?? ''}`)
        .join(' ');
      return normalizar(`${p.codigo} ${p.en} ${p.pt} ${respostas}`).includes(termo);
    });
  }, [busca, bloco, status, treinadas]);

  const blocosVisiveis = BLOCOS.filter((b) => bloco === 'todos' || b.id === bloco);

  return (
    <div>
      <Cabecalho
        titulo="Perguntas do oficial"
        subtitulo={`${perguntas.length} pergunta(s) em 5 blocos. Toque em uma pergunta para ouvir o oficial e treinar os 3 níveis de resposta.`}
        acoes={<Etiqueta>{treinadas.size} treinada(s)</Etiqueta>}
      />

      <div className="space-y-3 rounded-2xl border border-borda bg-superficie p-4">
        <label className="relative block">
          <span className="sr-only">Buscar pergunta</span>
          <IconeBusca className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" tamanho={20} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar em inglês ou português (ex.: hotel, P02)"
            className="min-h-12 w-full rounded-xl border border-borda bg-fundo pl-10 pr-3 text-base text-texto placeholder:text-suave"
          />
        </label>
        <div role="group" aria-label="Filtrar por bloco" className="flex flex-wrap gap-2">
          {[{ id: 'todos', nome: 'Todos' }, ...BLOCOS].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBloco(b.id)}
              aria-pressed={bloco === b.id}
              className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
                bloco === b.id ? 'bg-primario text-primario-texto' : 'border border-borda bg-superficie-2 text-texto'
              }`}
            >
              {b.id === 'todos' ? 'Todos' : `${b.id} · ${b.nome}`}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
          {(
            [
              ['todas', 'Todas'],
              ['treinadas', 'Treinadas'],
              ['nao', 'Não treinadas'],
            ] as [Status, string][]
          ).map(([id, nome]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatus(id)}
              aria-pressed={status === id}
              className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
                status === id ? 'bg-ambar text-petroleo-escuro' : 'border border-borda bg-superficie-2 text-texto'
              }`}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-suave" aria-live="polite">
        {filtradas.length} resultado(s)
      </p>

      <div className="mt-2 space-y-8">
        {blocosVisiveis.map((b) => {
          const doBloco = perguntas.filter((p) => p.bloco === b.id);
          const lista = filtradas.filter((p) => p.bloco === b.id);
          if (busca && !lista.length) return null;
          return (
            <section key={b.id} aria-labelledby={`bloco-${b.id}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 id={`bloco-${b.id}`} className="text-lg font-bold">
                  <span className="mr-2 inline-grid size-8 place-items-center rounded-lg bg-petroleo text-sm text-gelo">{b.id}</span>
                  {b.nome}
                </h2>
                {doBloco.length > 0 && (
                  <Link to={`/treino?bloco=${b.id}#modo-treino`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-destaque hover:bg-superficie-2">
                    <IconePlay tamanho={16} /> Treinar bloco em sequência
                  </Link>
                )}
              </div>
              {doBloco.length === 0 ? (
                <p className="rounded-xl border border-dashed border-borda px-4 py-3 text-sm text-suave">Perguntas deste bloco ainda não foram adicionadas.</p>
              ) : lista.length === 0 ? (
                <p className="text-sm text-suave">Nenhuma pergunta deste bloco com esse filtro.</p>
              ) : (
                <ul className="space-y-2">
                  {lista.map((p) => {
                    const ok = treinadas.has(p.codigo);
                    return (
                      <li key={p.codigo}>
                        <Link
                          to={`/perguntas/${p.codigo}`}
                          className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-borda bg-superficie py-3 pl-[calc(1rem+6px)] pr-3 transition hover:border-destaque"
                        >
                          <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${ok ? 'bg-sucesso' : 'bg-ceu'}`} />
                          <span className="w-10 shrink-0 text-sm font-extrabold text-destaque">{p.codigo}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">{p.en}</span>
                            <span className="block text-sm text-suave">{p.pt}</span>
                          </span>
                          {ok ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sucesso/15 px-2 py-1 text-xs font-bold text-sucesso">
                              <IconeCheck tamanho={14} /> Treinada
                            </span>
                          ) : (
                            <span className="sr-only">Não treinada</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
