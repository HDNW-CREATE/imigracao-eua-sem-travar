/**
 * Gerenciador único de áudio do site.
 * - Só um áudio toca por vez.
 * - Toca o mp3 de /public/audio quando ele existe; se não existir (ou falhar),
 *   usa a voz em inglês do navegador (speechSynthesis), sem mostrar erro.
 * - Velocidade 1x ou 0.75x (lento) e repetição (loop).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import arquivos from 'virtual:arquivos-publicos';
import { CHAVES, ler, salvar } from '../lib/armazenamento';

export interface Faixa {
  id: string;
  texto: string;
  audio?: string;
}

type Resultado = 'fim' | 'cancelado';

interface ContextoAudio {
  atualId: string | null;
  tocando: boolean;
  progresso: number;
  lento: boolean;
  repetir: boolean;
  alternar: (faixa: Faixa) => void;
  tocarEsperar: (faixa: Faixa) => Promise<Resultado>;
  parar: () => void;
  setLento: (v: boolean) => void;
  setRepetir: (v: boolean) => void;
}

const Ctx = createContext<ContextoAudio | null>(null);

const existentes = new Set(arquivos.audio);
const quebrados = new Set<string>();
const temArquivo = (nome?: string) => Boolean(nome && existentes.has(nome) && !quebrados.has(nome));

function vozIngles(): SpeechSynthesisVoice | undefined {
  try {
    const vozes = window.speechSynthesis?.getVoices() ?? [];
    const us = vozes.filter((v) => v.lang?.toLowerCase().replace('_', '-') === 'en-us');
    const preferidas = ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Jenny', 'Alex'];
    for (const nome of preferidas) {
      const v = us.find((x) => x.name.includes(nome));
      if (v) return v;
    }
    return us.find((v) => v.localService) ?? us[0] ?? vozes.find((v) => v.lang?.toLowerCase().startsWith('en'));
  } catch {
    return undefined;
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [atualId, setAtualId] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [lento, setLentoEstado] = useState<boolean>(() => ler(CHAVES.audioLento, false));
  const [repetir, setRepetirEstado] = useState(false);

  const elemento = useRef<HTMLAudioElement | null>(null);
  const sessao = useRef(0);
  const lentoRef = useRef(lento);
  const repetirRef = useRef(repetir);
  const pausado = useRef<{ faixa: Faixa; tipo: 'arquivo' | 'voz' } | null>(null);
  const timerVoz = useRef<number | null>(null);
  const resolverAtual = useRef<((r: Resultado) => void) | null>(null);

  useEffect(() => {
    lentoRef.current = lento;
    if (elemento.current) elemento.current.playbackRate = lento ? 0.75 : 1;
  }, [lento]);
  useEffect(() => {
    repetirRef.current = repetir;
  }, [repetir]);

  // Carrega a lista de vozes (alguns navegadores carregam depois).
  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices();
      const fn = () => window.speechSynthesis?.getVoices();
      window.speechSynthesis?.addEventListener?.('voiceschanged', fn);
      return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', fn);
    } catch {
      return undefined;
    }
  }, []);

  const pegarElemento = () => {
    if (!elemento.current) {
      elemento.current = new Audio();
      elemento.current.preload = 'auto';
    }
    return elemento.current;
  };

  const limparTimerVoz = () => {
    if (timerVoz.current !== null) {
      window.clearInterval(timerVoz.current);
      timerVoz.current = null;
    }
  };

  const pararTudo = useCallback(() => {
    const el = elemento.current;
    if (el) {
      el.onended = null;
      el.onerror = null;
      el.ontimeupdate = null;
      el.pause();
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignora */
    }
    limparTimerVoz();
  }, []);

  const finalizar = useCallback((minha: number, r: Resultado) => {
    if (sessao.current !== minha) return;
    setTocando(false);
    if (r === 'fim') setProgresso(1);
    const resolver = resolverAtual.current;
    resolverAtual.current = null;
    resolver?.(r);
  }, []);

  const falar = useCallback(
    (faixa: Faixa, minha: number, semRepetir: boolean) => {
      const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        finalizar(minha, 'fim');
        return;
      }
      const iniciar = () => {
        if (sessao.current !== minha) return;
        const fala = new SpeechSynthesisUtterance(faixa.texto);
        fala.lang = 'en-US';
        fala.rate = lentoRef.current ? 0.65 : 0.85;
        const voz = vozIngles();
        if (voz) fala.voice = voz;
        const estimado = Math.max(1200, (faixa.texto.length / 13) * 1000 * (lentoRef.current ? 1.3 : 1));
        const inicio = Date.now();
        limparTimerVoz();
        timerVoz.current = window.setInterval(() => {
          if (sessao.current !== minha) return limparTimerVoz();
          setProgresso(Math.min(0.95, (Date.now() - inicio) / estimado));
        }, 120);
        fala.onboundary = (e) => {
          if (sessao.current === minha && faixa.texto.length) setProgresso(Math.min(0.98, e.charIndex / faixa.texto.length));
        };
        const terminou = () => {
          limparTimerVoz();
          if (sessao.current !== minha) return;
          if (repetirRef.current && !semRepetir) {
            setProgresso(0);
            window.setTimeout(iniciar, 350);
          } else {
            finalizar(minha, 'fim');
          }
        };
        fala.onend = terminou;
        fala.onerror = terminou;
        try {
          synth.speak(fala);
        } catch {
          terminou();
        }
      };
      iniciar();
    },
    [finalizar],
  );

  const iniciarFaixa = useCallback(
    (faixa: Faixa, semRepetir: boolean): Promise<Resultado> => {
      pararTudo();
      resolverAtual.current?.('cancelado');
      resolverAtual.current = null;
      pausado.current = null;
      const minha = ++sessao.current;
      setAtualId(faixa.id);
      setTocando(true);
      setProgresso(0);

      return new Promise<Resultado>((resolve) => {
        resolverAtual.current = resolve;
        if (temArquivo(faixa.audio)) {
          const el = pegarElemento();
          const caiParaVoz = () => {
            if (sessao.current !== minha) return;
            if (faixa.audio) quebrados.add(faixa.audio);
            el.onended = null;
            el.onerror = null;
            el.ontimeupdate = null;
            falar(faixa, minha, semRepetir);
          };
          el.onerror = caiParaVoz;
          el.ontimeupdate = () => {
            if (sessao.current === minha && el.duration > 0) setProgresso(el.currentTime / el.duration);
          };
          el.onended = () => {
            if (sessao.current !== minha) return;
            if (repetirRef.current && !semRepetir) {
              el.currentTime = 0;
              void el.play().catch(caiParaVoz);
            } else {
              finalizar(minha, 'fim');
            }
          };
          el.src = `/audio/${faixa.audio}`;
          el.playbackRate = lentoRef.current ? 0.75 : 1;
          el.play().catch((erro: unknown) => {
            if (sessao.current !== minha) return;
            if (erro instanceof DOMException && erro.name === 'NotAllowedError') {
              finalizar(minha, 'cancelado');
            } else {
              caiParaVoz();
            }
          });
        } else {
          falar(faixa, minha, semRepetir);
        }
      });
    },
    [falar, finalizar, pararTudo],
  );

  const parar = useCallback(() => {
    pararTudo();
    sessao.current++;
    pausado.current = null;
    setTocando(false);
    setProgresso(0);
    setAtualId(null);
    const resolver = resolverAtual.current;
    resolverAtual.current = null;
    resolver?.('cancelado');
  }, [pararTudo]);

  const alternar = useCallback(
    (faixa: Faixa) => {
      if (atualId === faixa.id && tocando) {
        // Pausar
        const el = elemento.current;
        if (temArquivo(faixa.audio) && el && !el.paused) {
          el.pause();
          pausado.current = { faixa, tipo: 'arquivo' };
        } else {
          try {
            window.speechSynthesis?.cancel();
          } catch {
            /* ignora */
          }
          limparTimerVoz();
          pausado.current = { faixa, tipo: 'voz' };
        }
        setTocando(false);
        return;
      }
      if (atualId === faixa.id && pausado.current?.tipo === 'arquivo' && elemento.current) {
        // Continuar de onde parou
        pausado.current = null;
        setTocando(true);
        void elemento.current.play().catch(() => undefined);
        return;
      }
      void iniciarFaixa(faixa, false);
    },
    [atualId, tocando, iniciarFaixa],
  );

  const tocarEsperar = useCallback((faixa: Faixa) => iniciarFaixa(faixa, true), [iniciarFaixa]);

  const setLento = useCallback((v: boolean) => {
    setLentoEstado(v);
    salvar(CHAVES.audioLento, v);
  }, []);

  useEffect(() => () => pararTudo(), [pararTudo]);

  const valor = useMemo(
    () => ({ atualId, tocando, progresso, lento, repetir, alternar, tocarEsperar, parar, setLento, setRepetir: setRepetirEstado }),
    [atualId, tocando, progresso, lento, repetir, alternar, tocarEsperar, parar, setLento],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAudio precisa do AudioProvider');
  return c;
}
