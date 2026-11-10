import { Link, useParams } from 'react-router-dom';
import { AudioPlayer } from '../components/AudioPlayer';
import { ModoTreino } from '../components/ModoTreino';
import { BotaoCopiar, Cartao, Etiqueta, Picote, Pronuncia, estiloBotao } from '../components/Ui';
import { IconeCheck, IconeSetaDir, IconeSetaEsq } from '../components/Icones';
import { CHAVES, useLocal } from '../lib/armazenamento';
import { ROTULO_CENARIO, ROTULO_NIVEL, cenarioPara, chavesCenario, nomeBloco, perguntas } from '../lib/conteudo';
import { useTreinadas } from '../lib/progresso';
import type { ChaveCenario } from '../lib/tipos';

const CORES_NIVEL = { 1: 'ceu', 2: 'petroleo', 3: 'ambar' } as const;

export function PerguntaDetalhe() {
  const { codigo = '' } = useParams();
  const indice = perguntas.findIndex((p) => p.codigo.toLowerCase() === codigo.toLowerCase());
  const p = perguntas[indice];
  const { treinadas, alternar } = useTreinadas();
  const [preferido, setPreferido] = useLocal<string | null>(CHAVES.cenario, null);

  if (!p) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-2xl font-bold">Pergunta não encontrada</h1>
        <p className="mt-2 text-suave">Ela ainda não foi adicionada ao conteúdo.</p>
        <Link to="/perguntas" className={`${estiloBotao.primario} mt-6`}>
          Ver todas as perguntas
        </Link>
      </div>
    );
  }

  const chaves = chavesCenario(p);
  const temAbas = chaves.length > 0 && !(chaves.length === 1 && chaves[0] === 'unico');
  const cenario = cenarioPara(p, preferido) as ChaveCenario | null;
  const respostas = cenario ? [...(p.cenarios[cenario] ?? [])].sort((a, b) => a.nivel - b.nivel) : [];
  const anterior = perguntas[indice - 1];
  const proxima = perguntas[indice + 1];
  const ok = treinadas.has(p.codigo);

  return (
    <div className="space-y-6">
      <nav aria-label="Caminho" className="text-sm text-suave">
        <Link to="/perguntas" className="font-semibold text-destaque hover:underline">
          Perguntas
        </Link>{' '}
        / Bloco {p.bloco} · {nomeBloco(p.bloco)}
      </nav>

      <Cartao cor={ok ? 'sucesso' : 'petroleo'} as="article" aria-labelledby="pergunta-en">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta>{p.codigo}</Etiqueta>
          <span className="text-xs font-bold uppercase tracking-wide text-suave">O oficial pergunta</span>
          {ok && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sucesso/15 px-2 py-0.5 text-xs font-bold text-sucesso">
              <IconeCheck tamanho={14} /> Treinada
            </span>
          )}
        </div>
        <h1 id="pergunta-en" className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl" lang="en">
          {p.en}
        </h1>
        <p className="mt-1 text-lg text-suave">{p.pt}</p>
        {p.pronuncia && <Pronuncia>{p.pronuncia}</Pronuncia>}
        <AudioPlayer id={`oficial-${p.codigo}`} texto={p.en} audio={p.audio} rotulo="Ouvir o oficial" destaque className="mt-4" />

        <Picote />

        {temAbas && (
          <div role="tablist" aria-label="Escolha o seu cenário" className="-mx-1 mb-4 flex flex-wrap gap-2">
            {chaves.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                id={`aba-${k}`}
                aria-selected={cenario === k}
                aria-controls="painel-respostas"
                onClick={() => setPreferido(k)}
                className={`min-h-11 rounded-full px-4 text-sm font-bold ${
                  cenario === k ? 'bg-primario text-primario-texto' : 'border border-borda bg-superficie-2 text-texto'
                }`}
              >
                {ROTULO_CENARIO[k] ?? k}
              </button>
            ))}
          </div>
        )}

        <div id="painel-respostas" role={temAbas ? 'tabpanel' : undefined} aria-labelledby={temAbas && cenario ? `aba-${cenario}` : undefined} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-suave">Você responde</p>
          {respostas.length === 0 && <p className="text-suave">As respostas desta pergunta ainda não foram adicionadas.</p>}
          {respostas.map((r) => (
            <div key={`${cenario}-${r.nivel}-${r.en}`} className="relative overflow-hidden rounded-xl border border-borda bg-fundo/60 py-3 pl-[calc(0.9rem+4px)] pr-3">
              <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${CORES_NIVEL[r.nivel] === 'ambar' ? 'bg-ambar' : CORES_NIVEL[r.nivel] === 'ceu' ? 'bg-ceu' : 'bg-petroleo dark:bg-ceu'}`} />
              <p className="text-xs font-bold uppercase tracking-wide text-suave">
                Nível {r.nivel} · {ROTULO_NIVEL[r.nivel]?.nome}
              </p>
              <p className="mt-1 text-lg font-semibold" lang="en">
                {r.en}
              </p>
              {r.pt && <p className="text-[0.95rem] text-suave">{r.pt}</p>}
              {r.pronuncia && <Pronuncia>{r.pronuncia}</Pronuncia>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AudioPlayer id={`r-${p.codigo}-${cenario}-${r.nivel}`} texto={r.en} audio={r.audio} compacto />
                <BotaoCopiar texto={r.en} />
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      {p.dica && (
        <Cartao cor="ambar">
          <p className="text-xs font-bold uppercase tracking-wide text-suave">💡 Dica</p>
          <p className="mt-1">{p.dica}</p>
        </Cartao>
      )}

      <button
        type="button"
        onClick={() => alternar(p.codigo)}
        aria-pressed={ok}
        className={`${ok ? estiloBotao.secundario : estiloBotao.ambar} w-full py-3.5 text-lg`}
      >
        <IconeCheck tamanho={22} />
        {ok ? 'Treinada! (toque para desmarcar)' : 'Marcar como treinada'}
      </button>

      <ModoTreino lista={[p]} titulo="Modo treino desta pergunta" />

      <nav aria-label="Navegar entre perguntas" className="grid grid-cols-2 gap-3">
        {anterior ? (
          <Link to={`/perguntas/${anterior.codigo}`} className={`${estiloBotao.secundario} justify-start`}>
            <IconeSetaEsq tamanho={18} />
            <span className="truncate">Anterior · {anterior.codigo}</span>
          </Link>
        ) : (
          <span />
        )}
        {proxima ? (
          <Link to={`/perguntas/${proxima.codigo}`} className={`${estiloBotao.primario} justify-end`}>
            <span className="truncate">Próxima · {proxima.codigo}</span>
            <IconeSetaDir tamanho={18} />
          </Link>
        ) : (
          <Link to="/perguntas" className={`${estiloBotao.secundario} justify-end`}>
            Ver todas
          </Link>
        )}
      </nav>
    </div>
  );
}
