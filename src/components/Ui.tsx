import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconeCheck, IconeCopiar, IconeEstrela } from './Icones';

type Cor = 'petroleo' | 'ceu' | 'ambar' | 'sucesso';
const FAIXA: Record<Cor, string> = {
  petroleo: 'bg-petroleo dark:bg-ceu',
  ceu: 'bg-ceu',
  ambar: 'bg-ambar',
  sucesso: 'bg-sucesso',
};

/** Card no estilo "cartão de embarque", com faixa lateral colorida. */
export function Cartao({
  cor = 'petroleo',
  className = '',
  children,
  as: Tag = 'section',
  ...resto
}: {
  cor?: Cor;
  className?: string;
  children: ReactNode;
  as?: 'section' | 'article' | 'div' | 'li';
} & Record<string, unknown>) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-2xl border border-borda bg-superficie pl-[calc(1.25rem+6px)] pr-5 py-5 shadow-[0_1px_2px_rgba(11,58,91,0.06),0_8px_24px_-12px_rgba(11,58,91,0.18)] ${className}`}
      {...resto}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${FAIXA[cor]}`} />
      {children}
    </Tag>
  );
}

/** Linha tracejada com recortes, separando pergunta e respostas. */
export function Picote() {
  return <div className="picote" role="presentation" />;
}

export function SeloCompleto({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-ambar px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-petroleo-escuro ${className}`}
    >
      <IconeEstrela tamanho={13} />
      Completo
    </span>
  );
}

export function Etiqueta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md bg-superficie-2 px-2 py-0.5 text-xs font-bold tracking-wide text-destaque ${className}`}>
      {children}
    </span>
  );
}

export function BarraProgresso({ valor, rotulo, cor = 'ceu' }: { valor: number; rotulo: string; cor?: 'ceu' | 'ambar' | 'sucesso' }) {
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  const corBarra = cor === 'ambar' ? 'bg-ambar' : cor === 'sucesso' ? 'bg-sucesso' : 'bg-petroleo dark:bg-ceu';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">{rotulo}</span>
        <span className="tabular-nums text-suave">{v}%</span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-superficie-2"
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
      >
        <div className={`h-full rounded-full ${corBarra} transition-[width] duration-500`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Cabecalho({ titulo, subtitulo, sobre, acoes }: { titulo: string; subtitulo?: string; sobre?: ReactNode; acoes?: ReactNode }) {
  return (
    <header className="mb-6">
      {sobre && <div className="mb-2">{sobre}</div>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{titulo}</h1>
        {acoes}
      </div>
      {subtitulo && <p className="mt-2 max-w-prose text-suave">{subtitulo}</p>}
    </header>
  );
}

const BOTAO_BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const estiloBotao = {
  primario: `${BOTAO_BASE} bg-primario text-primario-texto hover:opacity-90`,
  secundario: `${BOTAO_BASE} border border-borda bg-superficie text-texto hover:bg-superficie-2`,
  ambar: `${BOTAO_BASE} bg-ambar text-petroleo-escuro hover:brightness-95`,
  fantasma: `${BOTAO_BASE} text-destaque hover:bg-superficie-2`,
};

export function BotaoCopiar({ texto, rotulo = 'Copiar', className = '' }: { texto: string; rotulo?: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(texto);
      ok = true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = texto;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand('copy');
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    }
  };
  return (
    <button type="button" onClick={copiar} className={`${estiloBotao.secundario} text-sm ${className}`} aria-live="polite">
      {copiado ? <IconeCheck tamanho={18} /> : <IconeCopiar tamanho={18} />}
      {copiado ? 'Copiado!' : rotulo}
    </button>
  );
}

export function Aviso({ children, tom = 'info', className = '' }: { children: ReactNode; tom?: 'info' | 'alerta'; className?: string }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        tom === 'alerta' ? 'border-ambar/60 bg-alerta-fundo text-alerta-texto' : 'border-borda bg-superficie-2 text-suave'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function LinkCard({ para, titulo, descricao, icone, cor = 'petroleo', extra }: { para: string; titulo: string; descricao: string; icone: ReactNode; cor?: Cor; extra?: ReactNode }) {
  return (
    <Link
      to={para}
      className="group relative block overflow-hidden rounded-2xl border border-borda bg-superficie py-4 pl-[calc(1rem+6px)] pr-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${FAIXA[cor]}`} />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-superficie-2 text-destaque">{icone}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-bold">
            {titulo}
            {extra}
          </span>
          <span className="mt-0.5 block text-sm text-suave">{descricao}</span>
        </span>
      </div>
    </Link>
  );
}

export function Pronuncia({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[0.95rem] italic text-suave">🗣️ {children}</p>;
}
