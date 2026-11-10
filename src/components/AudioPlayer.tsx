import { useAudio, type Faixa } from '../audio/AudioProvider';
import { IconePause, IconePlay, IconeRepetir } from './Icones';

interface Props extends Faixa {
  rotulo?: string;
  /** compacto: só o botão; os controles aparecem quando este áudio está ativo */
  compacto?: boolean;
  destaque?: boolean;
  className?: string;
}

/** Botão "Ouvir" reutilizável: play/pause, barra de progresso, velocidade e repetir. */
export function AudioPlayer({ id, texto, audio, rotulo = 'Ouvir', compacto = false, destaque = false, className = '' }: Props) {
  const { atualId, tocando, progresso, lento, repetir, alternar, setLento, setRepetir } = useAudio();
  const ativo = atualId === id;
  const estaTocando = ativo && tocando;
  const mostrarControles = !compacto || ativo;
  const nomeAcessivel = `${estaTocando ? 'Pausar' : rotulo}: ${texto}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => alternar({ id, texto, audio })}
        aria-label={nomeAcessivel}
        aria-pressed={estaTocando}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
          destaque || estaTocando ? 'bg-primario text-primario-texto' : 'border border-borda bg-superficie-2 text-destaque hover:border-destaque'
        }`}
      >
        {estaTocando ? <IconePause tamanho={18} /> : <IconePlay tamanho={18} />}
        <span>{estaTocando ? 'Pausar' : rotulo}</span>
      </button>

      {mostrarControles && (
        <>
          <button
            type="button"
            onClick={() => setLento(!lento)}
            aria-pressed={lento}
            aria-label={lento ? 'Velocidade lenta (0.75x) ativada. Mudar para 1x' : 'Velocidade normal (1x). Mudar para lento 0.75x'}
            className={`inline-flex min-h-11 min-w-14 items-center justify-center rounded-full px-3 text-sm font-bold tabular-nums ${
              lento ? 'bg-ambar text-petroleo-escuro' : 'border border-borda bg-superficie text-suave hover:text-texto'
            }`}
          >
            {lento ? '0.75x' : '1x'}
          </button>
          <button
            type="button"
            onClick={() => setRepetir(!repetir)}
            aria-pressed={repetir}
            aria-label={repetir ? 'Repetir ativado' : 'Repetir desativado'}
            title="Repetir"
            className={`inline-flex size-11 items-center justify-center rounded-full ${
              repetir ? 'bg-ambar text-petroleo-escuro' : 'border border-borda bg-superficie text-suave hover:text-texto'
            }`}
          >
            <IconeRepetir tamanho={18} />
          </button>
        </>
      )}

      {ativo && (
        <div
          className="h-1.5 min-w-24 flex-1 basis-24 overflow-hidden rounded-full bg-superficie-2"
          role="progressbar"
          aria-label="Progresso do áudio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progresso * 100)}
        >
          <div className="h-full bg-ambar transition-[width] duration-150" style={{ width: `${Math.round(progresso * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
