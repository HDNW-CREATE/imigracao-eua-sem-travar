import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CHAVES, salvar } from '../lib/armazenamento';
import { useAudio } from '../audio/AudioProvider';
import { perguntas } from '../lib/conteudo';
import {
  IconeAviao,
  IconeBaixar,
  IconeBoia,
  IconeCartao,
  IconeChecklist,
  IconeEstrela,
  IconeInicio,
  IconeLivro,
  IconeMais,
  IconePerguntas,
  IconeRelogio,
  IconeAlerta,
  IconeVarinha,
} from './Icones';
import { SeloCompleto } from './Ui';

export const NOME_SITE = 'Imigração EUA sem Travar';
export const SUBTITULO_SITE = 'Respostas Prontas em Inglês (com áudio)';
export const EMAIL_SUPORTE = 'contato.partiueua2027@gmail.com';

const TITULOS: { teste: RegExp; titulo: (m: RegExpMatchArray) => string }[] = [
  { teste: /^\/perguntas\/([^/]+)$/, titulo: (m) => `Pergunta ${decodeURIComponent(m[1]).toUpperCase()}` },
  { teste: /^\/perguntas$/, titulo: () => 'Perguntas' },
  { teste: /^\/resgate$/, titulo: () => 'Frases de resgate' },
  { teste: /^\/checklist$/, titulo: () => 'Checklist' },
  { teste: /^\/treino$/, titulo: () => 'Treino de 1 hora' },
  { teste: /^\/downloads$/, titulo: () => 'Downloads' },
  { teste: /^\/bonus\/pronuncia$/, titulo: () => 'Bônus 1 · Leia como se fala' },
  { teste: /^\/bonus\/cartao$/, titulo: () => 'Bônus 2 · Cartão da viagem' },
  { teste: /^\/bonus\/deslizes$/, titulo: () => 'Bônus 3 · Os 10 deslizes' },
  { teste: /^\/bonus\/gerador$/, titulo: () => 'Bônus 4 · Gerador de respostas' },
];

export function tituloDaRota(caminho: string): string | null {
  for (const t of TITULOS) {
    const m = caminho.match(t.teste);
    if (m) return t.titulo(m);
  }
  return null;
}

const NAV_PRINCIPAL = [
  { para: '/', rotulo: 'Início', icone: IconeInicio, fim: true },
  { para: '/perguntas', rotulo: 'Perguntas', icone: IconePerguntas },
  { para: '/resgate', rotulo: 'Resgate', icone: IconeBoia },
  { para: '/checklist', rotulo: 'Checklist', icone: IconeChecklist },
  { para: '/treino', rotulo: 'Treino de 1 hora', icone: IconeRelogio },
  { para: '/downloads', rotulo: 'Downloads', icone: IconeBaixar },
];

export const NAV_BONUS = [
  { para: '/bonus/pronuncia', rotulo: 'Leia como se fala', numero: 1, icone: IconeLivro },
  { para: '/bonus/cartao', rotulo: 'Cartão da viagem', numero: 2, icone: IconeCartao },
  { para: '/bonus/deslizes', rotulo: 'Os 10 deslizes', numero: 3, icone: IconeAlerta },
  { para: '/bonus/gerador', rotulo: 'Gerador de respostas', numero: 4, icone: IconeVarinha, estrela: true },
];

const classeLinkLateral = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-[0.95rem] font-semibold transition-colors ${
    isActive ? 'bg-primario text-primario-texto' : 'text-texto hover:bg-superficie-2'
  }`;

function MenuLateral() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-borda bg-superficie/95 backdrop-blur lg:flex print:hidden">
      <div className="border-b border-borda px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-petroleo text-gelo">
            <IconeAviao tamanho={24} />
          </span>
          <div className="min-w-0">
            <p className="font-extrabold leading-tight">{NOME_SITE}</p>
            <p className="text-xs text-suave">Área de membros</p>
          </div>
        </div>
        <SeloCompleto className="mt-3" />
      </div>
      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_PRINCIPAL.map(({ para, rotulo, icone: I, fim }) => (
            <li key={para}>
              <NavLink to={para} end={fim} className={classeLinkLateral}>
                <I tamanho={20} /> {rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mt-6 px-3 text-xs font-bold uppercase tracking-wider text-suave">Seus bônus</p>
        <ul className="mt-2 space-y-1">
          {NAV_BONUS.map(({ para, rotulo, numero, icone: I, estrela }) => (
            <li key={para}>
              <NavLink to={para} className={classeLinkLateral}>
                <I tamanho={20} />
                <span className="flex-1">
                  <span className="block text-xs font-bold opacity-75">Bônus {numero}</span>
                  {rotulo}
                </span>
                {estrela && <IconeEstrela tamanho={16} className="text-ambar" />}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

const NAV_INFERIOR = [
  { para: '/', rotulo: 'Início', icone: IconeInicio, fim: true },
  { para: '/perguntas', rotulo: 'Perguntas', icone: IconePerguntas },
  { para: '/resgate', rotulo: 'Resgate', icone: IconeBoia },
  { para: '/checklist', rotulo: 'Checklist', icone: IconeChecklist },
  { para: '/mais', rotulo: 'Mais', icone: IconeMais },
];

function NavegacaoInferior() {
  const { pathname } = useLocation();
  const emMais = ['/mais', '/treino', '/downloads'].includes(pathname) || pathname.startsWith('/bonus');
  return (
    <nav
      aria-label="Navegação principal"
      className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie/95 backdrop-blur lg:hidden print:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {NAV_INFERIOR.map(({ para, rotulo, icone: I, fim }) => (
          <li key={para}>
            <NavLink
              to={para}
              end={fim}
              className={({ isActive }) => {
                const ativo = isActive || (para === '/mais' && emMais);
                return `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                  ativo ? 'text-destaque' : 'text-suave'
                }`;
              }}
            >
              {({ isActive }) => {
                const ativo = isActive || (para === '/mais' && emMais);
                return (
                  <>
                    <span className={`grid h-8 w-12 place-items-center rounded-full ${ativo ? 'bg-ceu/30' : ''}`}>
                      <I tamanho={22} />
                    </span>
                    {rotulo}
                  </>
                );
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TopoCelular() {
  return (
    <header className="sticky top-0 z-30 border-b border-borda bg-fundo/90 backdrop-blur lg:hidden print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="flex min-w-0 items-center gap-2 font-extrabold">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-petroleo text-gelo">
            <IconeAviao tamanho={20} />
          </span>
          <span className="truncate">{NOME_SITE}</span>
        </NavLink>
        <SeloCompleto />
      </div>
    </header>
  );
}

function Rodape() {
  return (
    <footer className="mx-auto mt-12 max-w-3xl border-t border-borda px-4 pb-8 pt-6 text-sm text-suave print:hidden">
      <p>
        Este material treina comunicação em inglês. Não é orientação jurídica, não é consultoria de visto e não garante a entrada nos EUA.
        Procedimentos mudam: confira sempre{' '}
        <a className="font-semibold text-destaque underline" href="https://www.cbp.gov" target="_blank" rel="noopener noreferrer">
          cbp.gov
        </a>
        .
      </p>
      <p className="mt-2">
        Suporte:{' '}
        <a className="font-semibold text-destaque underline" href={`mailto:${EMAIL_SUPORTE}`}>
          {EMAIL_SUPORTE}
        </a>
      </p>
    </footer>
  );
}

/** Mapa de rotas aéreas sutil no fundo. */
function MapaDeRotas() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.07] print:hidden"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 800"
      style={{ color: 'var(--mapa)' }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 10" strokeLinecap="round">
        <path d="M120 620 C 380 320, 760 260, 1080 160" />
        <path d="M200 700 C 420 520, 700 500, 980 420" />
        <path d="M80 300 C 300 180, 600 140, 900 260" />
        <path d="M420 760 C 520 560, 820 380, 1140 360" />
      </g>
      <g fill="currentColor">
        <circle cx="120" cy="620" r="7" />
        <circle cx="1080" cy="160" r="7" />
        <circle cx="200" cy="700" r="5" />
        <circle cx="980" cy="420" r="5" />
        <circle cx="80" cy="300" r="5" />
        <circle cx="900" cy="260" r="5" />
        <circle cx="1140" cy="360" r="6" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="1080" cy="160" r="18" />
        <circle cx="120" cy="620" r="18" />
      </g>
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { parar } = useAudio();

  // Ao trocar de página: para o áudio, volta ao topo e lembra "de onde parei".
  useEffect(() => {
    parar();
    window.scrollTo({ top: 0 });
    const titulo = tituloDaRota(pathname);
    if (titulo) {
      const valido = !pathname.startsWith('/perguntas/') || perguntas.some((p) => `/perguntas/${p.codigo}` === pathname);
      if (valido) salvar(CHAVES.ultimo, { caminho: pathname, titulo });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-ambar px-4 py-2 font-bold text-petroleo-escuro focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <MapaDeRotas />
      <MenuLateral />
      <div className="lg:pl-72">
        <TopoCelular />
        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 pb-8 pt-6 outline-none sm:pt-8 lg:pb-16 print:p-0">
          {children}
        </main>
        <div className="pb-24 lg:pb-0">
          <Rodape />
        </div>
      </div>
      <NavegacaoInferior />
    </div>
  );
}
