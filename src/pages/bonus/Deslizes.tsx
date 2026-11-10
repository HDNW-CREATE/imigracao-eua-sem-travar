import { AudioPlayer } from '../../components/AudioPlayer';
import { Aviso, Cabecalho, Cartao, Etiqueta, Picote } from '../../components/Ui';
import { IconeCheck } from '../../components/Icones';
import { CHAVES, useLocal } from '../../lib/armazenamento';
import { deslizes } from '../../lib/conteudo';

export function BonusDeslizes() {
  const [marcados, setMarcados] = useLocal<Record<number, boolean>>(CHAVES.deslizesChecklist, {});

  return (
    <div className="space-y-6">
      <Cabecalho titulo={deslizes.titulo} sobre={<Etiqueta>Bônus 3</Etiqueta>} subtitulo={deslizes.subtitulo} />
      <p>{deslizes.paraQueServe}</p>
      <Aviso tom="alerta">
        <strong>Princípio de tudo:</strong> {deslizes.principio}
      </Aviso>

      <ol className="space-y-5">
        {deslizes.deslizes.map((d) => (
          <Cartao as="li" key={d.numero} cor={d.numero % 2 ? 'petroleo' : 'ceu'} aria-labelledby={`deslize-${d.numero}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-suave">Deslize {d.numero}</p>
            <h2 id={`deslize-${d.numero}`} className="mt-1 text-xl font-bold">
              {d.titulo}
            </h2>
            <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-suave">O que acontece</h3>
            <p className="mt-1">{d.oQueAcontece}</p>
            <Picote />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-superficie-2 p-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-suave">✗ Em vez de dizer</h3>
                <p className="mt-1">{d.emVezDe}</p>
              </div>
              <div className="rounded-xl border-2 border-sucesso/40 p-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-sucesso">✓ Diga</h3>
                {d.diga.map((x, i) =>
                  x.en ? (
                    <div key={i} className="mt-2">
                      <p className="text-lg font-semibold" lang="en">
                        “{x.en}”
                      </p>
                      <AudioPlayer id={`deslize-${d.numero}-${i}`} texto={x.en} compacto className="mt-1" />
                    </div>
                  ) : (
                    <p key={i} className="mt-1 font-semibold">
                      {x.pt}
                    </p>
                  ),
                )}
                {d.tabela && <p className="mt-1 text-sm text-suave">Veja a tabela abaixo.</p>}
              </div>
            </div>
            {d.tabela && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-[0.95rem]">
                  <thead>
                    <tr className="border-b-2 border-dashed border-borda text-sm text-suave">
                      <th scope="col" className="py-2 pr-3">Em vez de dizer</th>
                      <th scope="col" className="py-2">Diga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.tabela.map((l, i) => (
                      <tr key={i} className="border-b border-borda align-top last:border-0">
                        <td className="py-2 pr-3 text-suave" lang="en">{l.emVezDe}</td>
                        <td className="py-2">
                          <p className="font-semibold" lang="en">{l.diga}</p>
                          <AudioPlayer id={`deslize-${d.numero}-t${i}`} texto={l.diga} compacto className="mt-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {d.atencao && (
              <Aviso tom="alerta" className="mt-3">
                <strong>Atenção:</strong> {d.atencao}
              </Aviso>
            )}
            <div className="mt-3 rounded-xl bg-ambar/15 p-3">
              <h3 className="text-sm font-bold uppercase tracking-wide">🎯 Treino</h3>
              <p className="mt-1">{d.treino}</p>
            </div>
          </Cartao>
        ))}
      </ol>

      <Cartao cor="ambar" aria-labelledby="conversa-longa">
        <h2 id="conversa-longa" className="text-xl font-bold">
          {deslizes.conversaLonga.titulo}
        </h2>
        <p className="mt-2">{deslizes.conversaLonga.texto}</p>
        <ul className="mt-3 space-y-3">
          {deslizes.conversaLonga.itens.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ambar" />
              <div>
                <p>{it.pt}</p>
                {it.en && (
                  <>
                    <p className="font-semibold" lang="en">“{it.en}”</p>
                    <AudioPlayer id={`conversa-${i}`} texto={it.en} compacto className="mt-1" />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-suave">{deslizes.conversaLonga.aviso}</p>
      </Cartao>

      <Cartao cor="sucesso" aria-labelledby="check-rapido">
        <h2 id="check-rapido" className="text-xl font-bold">
          Checklist rápido: antes de chegar na cabine
        </h2>
        <ul className="mt-3 space-y-2">
          {deslizes.checklistRapido.map((t, i) => {
            const ok = Boolean(marcados[i]);
            return (
              <li key={i}>
                <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${ok ? 'border-sucesso/50 bg-sucesso/10' : 'border-borda'}`}>
                  <input type="checkbox" className="peer sr-only" checked={ok} onChange={() => setMarcados((a) => ({ ...a, [i]: !a[i] }))} />
                  <span
                    aria-hidden="true"
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ambar ${ok ? 'border-sucesso bg-sucesso text-white' : 'border-borda'}`}
                  >
                    {ok && <IconeCheck tamanho={18} />}
                  </span>
                  {t}
                </label>
              </li>
            );
          })}
        </ul>
      </Cartao>
    </div>
  );
}
