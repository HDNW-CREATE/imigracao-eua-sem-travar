import arquivos from 'virtual:arquivos-publicos';
import { Cabecalho, Cartao } from '../components/Ui';
import { IconeBaixar } from '../components/Icones';
import { downloads } from '../lib/conteudo';

const disponiveis = new Set(arquivos.pdf);

export function Downloads() {
  return (
    <div>
      <Cabecalho titulo="Downloads" subtitulo="Baixe os PDFs para ler sem internet, imprimir ou guardar no celular." />
      <ul className="space-y-3">
        {downloads.map((d, i) => {
          const ok = disponiveis.has(d.arquivo);
          return (
            <Cartao as="li" key={d.arquivo} cor={i === 0 ? 'ambar' : 'petroleo'}>
              <div className="flex flex-wrap items-center gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-superficie-2 text-sm font-extrabold text-destaque">
                  PDF
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{d.titulo}</h2>
                  {d.descricao && <p className="text-sm text-suave">{d.descricao}</p>}
                </div>
                {ok ? (
                  <a
                    href={`/pdf/${d.arquivo}`}
                    download
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primario px-4 font-semibold text-primario-texto hover:opacity-90"
                    aria-label={`Baixar ${d.titulo}`}
                  >
                    <IconeBaixar tamanho={18} /> Baixar
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center rounded-xl border border-dashed border-borda px-4 text-sm text-suave">Em breve</span>
                )}
              </div>
            </Cartao>
          );
        })}
      </ul>
    </div>
  );
}
