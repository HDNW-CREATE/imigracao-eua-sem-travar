import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../audio/AudioProvider';
import { CHAVES, useLocal } from '../lib/armazenamento';
import { ROTULO_NIVEL, respostaPara } from '../lib/conteudo';
import type { Pergunta } from '../lib/tipos';
import { IconeMicrofone, IconePlay, IconeSetaDir, IconeSetaEsq } from './Icones';
import { estiloBotao } from './Ui';

type Fase = 'parado' | 'pergunta' | 'pausa' | 'resposta' | 'fim';

const PAUSA_SEGUNDOS = 5;

/**
 * MODO TREINO: toca a pergunta do oficial, abre uma pausa de 5 s com contagem
 * regressiva ("Sua vez de responder") e depois toca a resposta-modelo.
 * Pode percorrer um bloco inteiro em sequência.
 */
export function ModoTreino({ lista, titulo = 'Modo treino', nivelInicial = 2 }: { lista: Pergunta[]; titulo?: string; nivelInicial?: 1 | 2 | 3 }) {
  const { tocarEsperar, parar } = useAudio();
  const [preferido] = useLocal<string | null>(CHAVES.cenario, null);
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>('parado');
  const [contagem, setContagem] = useState(PAUSA_SEGUNDOS);
  const [nivel, setNivel] = useState<1 | 2 | 3>(nivelInicial);
  const [sequencia, setSequencia] = useState(lista.length > 1);
  const execucao = useRef(0);

  const chaveLista = lista.map((p) => p.codigo).join(',');
  useEffect(() => {
    execucao.current++;
    setIndice(0);
    setFase('parado');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveLista]);

  useEffect(
    () => () => {
      execucao.current++;
    },
    [],
  );

  if (!lista.length) {
    return <p className="text-suave">Ainda não há perguntas neste bloco. Assim que o conteúdo for adicionado, o treino aparece aqui.</p>;
  }

  const atual = lista[Math.min(indice, lista.length - 1)];
  const resposta = respostaPara(atual, nivel, preferido);

  const esperar = (ms: number, minha: number) =>
    new Promise<boolean>((ok) => {
      const fim = Date.now() + ms;
      const tique = () => {
        if (execucao.current !== minha) return ok(false);
        const falta = fim - Date.now();
        setContagem(Math.max(0, Math.ceil(falta / 1000)));
        if (falta <= 0) return ok(true);
        window.setTimeout(tique, 200);
      };
      tique();
    });

  const iniciar = async (de: number) => {
    const minha = ++execucao.current;
    for (let i = de; i < lista.length; i++) {
      if (execucao.current !== minha) return;
      const p = lista[i];
      const r = respostaPara(p, nivel, preferido);
      setIndice(i);
      setFase('pergunta');
      const r1 = await tocarEsperar({ id: `treino-${p.codigo}`, texto: p.en, audio: p.audio });
      if (r1 === 'cancelado' || execucao.current !== minha) return;
      setFase('pausa');
      setContagem(PAUSA_SEGUNDOS);
      if (!(await esperar(PAUSA_SEGUNDOS * 1000, minha))) return;
      if (r) {
        setFase('resposta');
        const r2 = await tocarEsperar({ id: `treino-r-${p.codigo}-${r.nivel}`, texto: r.en, audio: r.audio });
        if (r2 === 'cancelado' || execucao.current !== minha) return;
      }
      if (!sequencia) {
        setFase('fim');
        return;
      }
      if (i < lista.length - 1 && !(await esperar(1200, minha))) return;
    }
    if (execucao.current === minha) setFase('fim');
  };

  const pararTreino = () => {
    execucao.current++;
    parar();
    setFase('parado');
  };

  const irPara = (i: number) => {
    execucao.current++;
    parar();
    setIndice(Math.max(0, Math.min(lista.length - 1, i)));
    setFase('parado');
  };

  const rodando = fase === 'pergunta' || fase === 'pausa' || fase === 'resposta';

  return (
    <div className="rounded-2xl border border-borda bg-superficie-2/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold">{titulo}</h3>
        <span className="text-sm tabular-nums text-suave">
          {indice + 1} de {lista.length}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Nível da resposta-modelo">
        {([1, 2, 3] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNivel(n)}
            aria-pressed={nivel === n}
            disabled={rodando}
            className={`min-h-11 rounded-full px-3 text-sm font-semibold ${
              nivel === n ? 'bg-primario text-primario-texto' : 'border border-borda bg-superficie text-texto'
            }`}
          >
            Nível {n} · {ROTULO_NIVEL[n].nome}
          </button>
        ))}
      </div>

      {lista.length > 1 && (
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-[var(--primario)]"
            checked={sequencia}
            disabled={rodando}
            onChange={(e) => setSequencia(e.target.checked)}
          />
          Percorrer o bloco inteiro em sequência
        </label>
      )}

      <div className="mt-4 rounded-xl border border-borda bg-superficie p-4" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-suave">
          {atual.codigo} · Oficial
        </p>
        <p className="mt-1 text-lg font-semibold">{fase === 'parado' ? 'Aperte “Começar” e escute o oficial.' : atual.en}</p>

        {fase === 'pausa' && (
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-ambar/20 p-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-ambar text-3xl font-extrabold tabular-nums text-petroleo-escuro">
              {contagem}
            </span>
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                <IconeMicrofone tamanho={20} /> Sua vez de responder
              </p>
              <p className="text-sm text-suave">Fale em voz alta. Depois você ouve a resposta-modelo.</p>
            </div>
          </div>
        )}

        {(fase === 'resposta' || fase === 'fim') && resposta && (
          <div className="mt-4 border-t-2 border-dashed border-borda pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-suave">Resposta-modelo · nível {resposta.nivel}</p>
            <p className="mt-1 text-lg font-semibold">{resposta.en}</p>
            {resposta.pt && <p className="text-sm text-suave">{resposta.pt}</p>}
          </div>
        )}

        {fase === 'fim' && (
          <p className="mt-3 text-sm font-semibold text-sucesso">
            {sequencia && indice === lista.length - 1 ? 'Bloco concluído! Repita mais uma vez amanhã.' : 'Pronto! Repita ou vá para a próxima.'}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {rodando ? (
          <button type="button" className={estiloBotao.secundario} onClick={pararTreino}>
            Parar
          </button>
        ) : (
          <button type="button" className={estiloBotao.primario} onClick={() => void iniciar(fase === 'fim' && !sequencia ? indice : fase === 'fim' ? 0 : indice)}>
            <IconePlay tamanho={18} />
            {fase === 'fim' ? 'Repetir' : 'Começar'}
          </button>
        )}
        <button type="button" className={estiloBotao.secundario} onClick={() => irPara(indice - 1)} disabled={indice === 0} aria-label="Pergunta anterior">
          <IconeSetaEsq tamanho={18} /> Anterior
        </button>
        <button
          type="button"
          className={estiloBotao.secundario}
          onClick={() => irPara(indice + 1)}
          disabled={indice >= lista.length - 1}
          aria-label="Próxima pergunta"
        >
          Próxima <IconeSetaDir tamanho={18} />
        </button>
      </div>
    </div>
  );
}
