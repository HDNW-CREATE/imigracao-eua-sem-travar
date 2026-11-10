import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { tamanho?: number };

function Base({ tamanho = 22, children, ...resto }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

export const IconeInicio = (p: P) => (<Base {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Base>);
export const IconePerguntas = (p: P) => (<Base {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2" /><path d="M12 16.5h.01" /></Base>);
export const IconeBoia = (p: P) => (<Base {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" /></Base>);
export const IconeChecklist = (p: P) => (<Base {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 9l2 2 4-4" /><path d="M8 16h8" /></Base>);
export const IconeMais = (p: P) => (<Base {...p}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></Base>);
export const IconePlay = (p: P) => (<Base {...p}><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none" /></Base>);
export const IconePause = (p: P) => (<Base {...p}><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /></Base>);
export const IconeRepetir = (p: P) => (<Base {...p}><path d="M17 2l3 3-3 3" /><path d="M4 11V9a4 4 0 0 1 4-4h12" /><path d="M7 22l-3-3 3-3" /><path d="M20 13v2a4 4 0 0 1-4 4H4" /></Base>);
export const IconeCopiar = (p: P) => (<Base {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></Base>);
export const IconeCheck = (p: P) => (<Base {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Base>);
export const IconeBaixar = (p: P) => (<Base {...p}><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 21h16" /></Base>);
export const IconeBusca = (p: P) => (<Base {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Base>);
export const IconeAviao = (p: P) => (<Base {...p}><path d="M10.5 13.5L3 11l1.5-1.5 8 1 4-4.5c1-1 2.8-1.3 3.3-.8.5.5.2 2.3-.8 3.3l-4.5 4 1 8L14 22l-2.5-7.5" /><path d="M6 17l-2 1 1-2" /></Base>);
export const IconeChat = (p: P) => (<Base {...p}><path d="M20 12a8 8 0 0 1-11.5 7.2L3 20.5l1.3-4.6A8 8 0 1 1 20 12z" /></Base>);
export const IconeFechar = (p: P) => (<Base {...p}><path d="M6 6l12 12M18 6L6 18" /></Base>);
export const IconeEnviar = (p: P) => (<Base {...p}><path d="M4 12l16-8-6 16-2.5-6.5z" /><path d="M11.5 13.5L20 4" /></Base>);
export const IconeEstrela = (p: P) => (<Base {...p}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none" /></Base>);
export const IconeSetaEsq = (p: P) => (<Base {...p}><path d="M15 5l-7 7 7 7" /></Base>);
export const IconeSetaDir = (p: P) => (<Base {...p}><path d="M9 5l7 7-7 7" /></Base>);
export const IconeRelogio = (p: P) => (<Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>);
export const IconeImprimir = (p: P) => (<Base {...p}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></Base>);
export const IconeLivro = (p: P) => (<Base {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /><path d="M8 7h7" /></Base>);
export const IconeCartao = (p: P) => (<Base {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></Base>);
export const IconeAlerta = (p: P) => (<Base {...p}><path d="M12 3l9.5 17h-19z" /><path d="M12 10v4" /><path d="M12 17.5h.01" /></Base>);
export const IconeVarinha = (p: P) => (<Base {...p}><path d="M4 20L16 8" /><path d="M14 6l4 4" /><path d="M19 3v3M17.5 4.5h3M6 3v2M5 4h2M20 14v2M19 15h2" /></Base>);
export const IconeMicrofone = (p: P) => (<Base {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></Base>);
export const IconeEmail = (p: P) => (<Base {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Base>);
export const IconeLixo = (p: P) => (<Base {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></Base>);
