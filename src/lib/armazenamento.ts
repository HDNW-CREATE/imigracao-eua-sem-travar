import { useCallback, useEffect, useState } from 'react';

const PREFIXO = 'iet:';
const EVENTO = 'iet-armazenamento';

export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave);
    return bruto === null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export function salvar<T>(chave: string, valor: T) {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* navegador sem espaço ou modo privado: segue sem salvar */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: chave }));
  } catch {
    /* ignora */
  }
}

export function remover(chave: string) {
  try {
    window.localStorage.removeItem(PREFIXO + chave);
  } catch {
    /* ignora */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: chave }));
  } catch {
    /* ignora */
  }
}

/** useState que salva no localStorage e sincroniza entre componentes. */
export function useLocal<T>(chave: string, padrao: T): [T, (v: T | ((anterior: T) => T)) => void] {
  const [valor, setValor] = useState<T>(() => ler(chave, padrao));

  useEffect(() => {
    const aoMudar = (e: Event) => {
      const det = (e as CustomEvent<string>).detail;
      if (det === chave) setValor(ler(chave, padrao));
    };
    const aoStorage = (e: StorageEvent) => {
      if (e.key === PREFIXO + chave) setValor(ler(chave, padrao));
    };
    window.addEventListener(EVENTO, aoMudar);
    window.addEventListener('storage', aoStorage);
    return () => {
      window.removeEventListener(EVENTO, aoMudar);
      window.removeEventListener('storage', aoStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const atualizar = useCallback(
    (v: T | ((anterior: T) => T)) => {
      const novo = typeof v === 'function' ? (v as (a: T) => T)(ler(chave, padrao)) : v;
      setValor(novo);
      salvar(chave, novo);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chave],
  );

  return [valor, atualizar];
}

/* Chaves usadas no site */
export const CHAVES = {
  treinadas: 'treinadas',
  checklist: 'checklist',
  ultimo: 'ultimo',
  cartao: 'cartao',
  cartaoChecagem: 'cartao-checagem',
  gerador: 'gerador',
  cenario: 'cenario-preferido',
  autoteste: 'autoteste',
  deslizesChecklist: 'deslizes-checklist',
  audioLento: 'audio-lento',
  aeroUso: 'aero-uso',
  aeroConversa: 'aero-conversa',
} as const;
