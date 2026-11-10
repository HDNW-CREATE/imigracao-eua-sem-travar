import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../audio/AudioProvider';
import { CHAVES, useLocal } from '../lib/armazenamento';
import { perguntas, respostaPara } from '../lib/conteudo';
import { useTreinadas } from '../lib/progresso';
import type { Pergunta } from '../lib/tipos';
import { AudioPlayer } from './AudioPlayer';
import { IconeMicrofone, IconePlay } from './Icones';
import { estiloBotao } from './Ui';

type Nota = 'sim' | 'quase' | 'nao';
const ROTULOS: Record<Nota, string> = { sim: 'Sim', quase: 'Quase', nao: 'Não' };

function sortear(n: number): Pergunta[] {
  const copia = [...perguntas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, Math.min(n, copia.length));
}

export function Autoteste() {
  const { alternar: tocar, parar } = useAudio();
  const { marcar } = useTreinadas();
  const [preferido] = useLocal<string | null>(CHAVES.cenario, null);
  const [ultimo, setUltimo] = useLocal<{ data: string; sim: number; quase: number; nao: number } | null>(CHAVES.autoteste, null);
  const [lista, setLista] = useState<Pergunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [notas, setNotas] = useState<Record<string, Nota>>({});
  const [revelar, setRevelar] = useState(false);
  const [marcadas, setMarcadas] = useState(false);

  if (!perguntas.length) return <p className="text-suave">Adicione perguntas ao conteúdo para usar o autoteste.</p>;

  const comecar = () => {
    const nova = sortear(10);
    setLista(nova);
    setIndice(0);
    setNotas({});
    setRevelar(false);
    setMarcadas(false);
    const p = nova[0];
    if (p) tocar({ id: `auto-${p.codigo}`, texto: p.en, audio: p.audio });
  };

  const avaliar = (nota: Nota) => {
    const p = lista[indice];
    const novas = { ...notas, [p.codigo]: nota };
    setNotas(novas);
    parar();
    setRevelar(false);
    const prox = indice + 1;
    setIndice(prox);
    if (prox < lista.length) {
      const q = lista[prox];
      tocar({ id: `auto-${q.codigo}`, texto: q.en, audio: q.audio });
    } else {
      const contagem = { sim: 0, quase: 0, nao: 0 };
      Object.values(novas).forEach((n) => contagem[n]++);
      setUltimo({ data: new Date().toLocaleDateString('pt-BR'), ...contagem });
    }
  };

  // Tela inicial
  if (!lista.length) {
    return (
      <div className="rounded-2xl border border-borda bg-superficie p-5">
        <ol className="list-decimal space-y-1 pl-5 text-[0.95rem]">
          <li>Aperte começar: o áudio do oficial toca sozinho.</li>
          <li>Responda em voz alta, sem olhar o texto.</li>
          <li>Avalie: consegui responder? Sim, Quase ou Não.</li>
        </ol>
        {ultimo && (
          <p className="mt-3 text-sm text-suave">
            Último autoteste ({ultimo.data}): {ultimo.sim} sim · {ultimo.quase} quase · {ultimo.nao} não
          </p>
        )}
        <button type="button" className={`${estiloBotao.primario} mt-4`} onClick={comecar}>
          <IconePlay tamanho={18} /> Começar autoteste
        </button>
      </div>
    );
  }

  // Resultado
  if (indice >= lista.length) {
    const sims = lista.filter((p) => notas[p.codigo] === 'sim');
    const revisar = lista.filter((p) => notas[p.codigo] !== 'sim');
    return (
      <div className="rounded-2xl border border-borda bg-superficie p-5" aria-live="polite">
        <h3 className="text-lg font-bold">Resultado</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(['sim', 'quase', 'nao'] as Nota[]).map((n) => (
            <div key={n} className={`rounded-xl p-3 ${n === 'sim' ? 'bg-sucesso/15' : n === 'quase' ? 'bg-ambar/20' : 'bg-superficie-2'}`}>
              <p className="text-2xl font-extrabold tabular-nums">{lista.filter((p) => notas[p.codigo] === n).length}</p>
              <p className="text-sm">{ROTULOS[n]}</p>
            </div>
          ))}
        </div>
        {revisar.length > 0 && (
          <>
            <p className="mt-4 font-semibold">Para treinar de novo:</p>
            <ul className="mt-1 space-y-1">
              {revisar.map((p) => (
                <li key={p.codigo}>
                  <Link to={`/perguntas/${p.codigo}`} className="text-destaque underline">
                    {p.codigo} · {p.en}
                  </Link>{' '}
                  <span className="text-sm text-suave">({ROTULOS[notas[p.codigo]]})</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {sims.length > 0 && (
            <button
              type="button"
              className={estiloBotao.ambar}
              disabled={marcadas}
              onClick={() => {
                marcar(sims.map((p) => p.codigo));
                setMarcadas(true);
              }}
            >
              {marcadas ? 'Marcadas como treinadas ✓' : `Marcar as ${sims.length} “Sim” como treinadas`}
            </button>
          )}
          <button type="button" className={estiloBotao.primario} onClick={comecar}>
            Fazer outro autoteste
          </button>
        </div>
      </div>
    );
  }

  const p = lista[indice];
  const r = respostaPara(p, 2, preferido);
  return (
    <div className="rounded-2xl border border-borda bg-superficie p-5">
      <p className="text-sm font-semibold tabular-nums text-suave">
        Pergunta {indice + 1} de {lista.length}
      </p>
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-superficie-2 p-4">
        <IconeMicrofone tamanho={24} className="shrink-0 text-destaque" />
        <p className="font-semibold">Ouça o oficial e responda em voz alta.</p>
      </div>
      <AudioPlayer id={`auto-${p.codigo}`} texto={p.en} audio={p.audio} rotulo="Ouvir o oficial de novo" destaque className="mt-3" />
      <button type="button" className={`${estiloBotao.fantasma} mt-2 px-0`} onClick={() => setRevelar(!revelar)} aria-expanded={revelar}>
        {revelar ? 'Esconder o texto' : 'Mostrar a pergunta e uma resposta-modelo'}
      </button>
      {revelar && (
        <div className="mt-1 rounded-xl border border-dashed border-borda p-3">
          <p className="font-semibold" lang="en">{p.en}</p>
          <p className="text-sm text-suave">{p.pt}</p>
          {r && (
            <p className="mt-2 text-[0.95rem]">
              <span className="text-suave">Modelo: </span>
              <span lang="en">{r.en}</span>
            </p>
          )}
        </div>
      )}
      <p className="mt-4 font-semibold">Você conseguiu responder?</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button type="button" className={`${estiloBotao.primario} bg-sucesso`} onClick={() => avaliar('sim')}>
          Sim
        </button>
        <button type="button" className={estiloBotao.ambar} onClick={() => avaliar('quase')}>
          Quase
        </button>
        <button type="button" className={estiloBotao.secundario} onClick={() => avaliar('nao')}>
          Não
        </button>
      </div>
    </div>
  );
}
