import { useState } from 'react';
import { BarraProgresso, Cabecalho, Cartao, estiloBotao } from '../components/Ui';
import { IconeCheck, IconeLixo } from '../components/Icones';
import { checklist } from '../lib/conteudo';
import { pct, useChecklist } from '../lib/progresso';

export function Checklist() {
  const { marcados, feitos, total, alternar, limpar } = useChecklist();
  const [confirmar, setConfirmar] = useState(false);

  return (
    <div>
      <Cabecalho titulo="Checklist da viagem" subtitulo="Marque cada item quando estiver pronto. Fica salvo neste aparelho." />
      <Cartao cor="sucesso" className="mb-6">
        <BarraProgresso valor={pct(feitos, total)} rotulo={`${feitos} de ${total} itens prontos`} cor="sucesso" />
      </Cartao>

      <div className="space-y-6">
        {checklist.map((g) => {
          const feitosGrupo = g.itens.filter((i) => marcados[i.id]).length;
          return (
            <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 id={`grupo-${g.id}`} className="text-lg font-bold">
                  {g.titulo}
                </h2>
                <span className="text-sm tabular-nums text-suave">
                  {feitosGrupo}/{g.itens.length}
                </span>
              </div>
              <ul className="space-y-2">
                {g.itens.map((item) => {
                  const ok = Boolean(marcados[item.id]);
                  return (
                    <li key={item.id}>
                      <label
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          ok ? 'border-sucesso/50 bg-sucesso/10' : 'border-borda bg-superficie hover:border-destaque'
                        }`}
                      >
                        <input type="checkbox" className="peer sr-only" checked={ok} onChange={() => alternar(item.id)} />
                        <span
                          aria-hidden="true"
                          className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ambar ${
                            ok ? 'border-sucesso bg-sucesso text-white' : 'border-borda bg-fundo'
                          }`}
                        >
                          {ok && <IconeCheck tamanho={18} />}
                        </span>
                        <span className={ok ? 'text-suave line-through decoration-1' : ''}>{item.texto}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-8">
        {confirmar ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-borda bg-superficie p-4" role="alertdialog" aria-label="Confirmar limpeza">
            <p className="w-full font-semibold">Desmarcar todos os itens?</p>
            <button
              type="button"
              className={estiloBotao.primario}
              onClick={() => {
                limpar();
                setConfirmar(false);
              }}
            >
              Sim, limpar tudo
            </button>
            <button type="button" className={estiloBotao.secundario} onClick={() => setConfirmar(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className={estiloBotao.secundario} onClick={() => setConfirmar(true)} disabled={feitos === 0}>
            <IconeLixo tamanho={18} /> Limpar tudo
          </button>
        )}
      </div>
    </div>
  );
}
