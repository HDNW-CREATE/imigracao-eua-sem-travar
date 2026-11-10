import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CHAVES, ler, salvar } from '../lib/armazenamento';
import { IconeChat, IconeEnviar, IconeFechar } from './Icones';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const LIMITE_DIARIO = 30;
const MAX_CARACTERES = 500;
const BOAS_VINDAS =
  'Oi! Eu sou o Aero. Pergunte sobre o site ou sobre inglês: traduzir uma frase, explicar uma palavra, corrigir sua resposta ou treinar a entrevista comigo.';
const INDISPONIVEL = 'O Aero está indisponível no momento.';

const SUGESTOES: { rotulo: string; texto: string; enviar?: boolean }[] = [
  { rotulo: 'Traduzir uma frase', texto: 'Traduza para o inglês: ' },
  { rotulo: 'Como se fala?', texto: 'Como se fala ' },
  { rotulo: 'Corrigir minha resposta', texto: 'Corrija minha resposta: ' },
  { rotulo: 'Treinar com o oficial', texto: 'Quero treinar com o oficial.', enviar: true },
];

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function usoHoje(): number {
  const u = ler<{ dia: string; total: number }>(CHAVES.aeroUso, { dia: '', total: 0 });
  return u.dia === hoje() ? u.total : 0;
}
function registrarUso() {
  salvar(CHAVES.aeroUso, { dia: hoje(), total: usoHoje() + 1 });
}

export function AeroChat() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Msg[]>(() => {
    try {
      const salvas = window.sessionStorage.getItem('iet:' + CHAVES.aeroConversa);
      return salvas ? (JSON.parse(salvas) as Msg[]) : [];
    } catch {
      return [];
    }
  });
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [usados, setUsados] = useState(usoHoje);
  const listaRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const tituloId = useId();

  // Guarda a conversa só nesta aba (sessionStorage).
  useEffect(() => {
    try {
      window.sessionStorage.setItem('iet:' + CHAVES.aeroConversa, JSON.stringify(mensagens.slice(-30)));
    } catch {
      /* ignora */
    }
  }, [mensagens]);

  // Verifica se o chat está configurado quando abre.
  useEffect(() => {
    if (!aberto || disponivel !== null) return;
    let ativo = true;
    fetch('/api/aero', { method: 'GET', headers: { Accept: 'application/json' } })
      .then(async (r) => {
        const tipo = r.headers.get('content-type') ?? '';
        if (!r.ok || !tipo.includes('application/json')) return false;
        const d = (await r.json()) as { disponivel?: boolean };
        return Boolean(d.disponivel);
      })
      .catch(() => false)
      .then((ok) => {
        if (ativo) setDisponivel(ok);
      });
    return () => {
      ativo = false;
    };
  }, [aberto, disponivel]);

  useEffect(() => {
    if (aberto) {
      setUsados(usoHoje());
      window.setTimeout(() => campoRef.current?.focus(), 50);
    }
  }, [aberto]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight });
  }, [mensagens, enviando, aberto]);

  // Esc fecha
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberto]);

  const limiteAtingido = usados >= LIMITE_DIARIO;
  const bloqueado = enviando || disponivel === false || limiteAtingido;

  const enviar = async (conteudo: string) => {
    const limpo = conteudo.trim();
    if (!limpo || bloqueado) return;
    if (limpo.length > MAX_CARACTERES) {
      setErro(`Escreva até ${MAX_CARACTERES} caracteres.`);
      return;
    }
    setErro(null);
    const novas: Msg[] = [...mensagens, { role: 'user', content: limpo }];
    setMensagens(novas);
    setTexto('');
    setEnviando(true);
    registrarUso();
    setUsados(usoHoje());
    try {
      const r = await fetch('/api/aero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ mensagens: novas.slice(-12) }),
      });
      const tipo = r.headers.get('content-type') ?? '';
      const dados = tipo.includes('application/json') ? ((await r.json()) as { resposta?: string; mensagem?: string; erro?: string }) : {};
      if (r.ok && dados.resposta) {
        setMensagens((m) => [...m, { role: 'assistant', content: dados.resposta as string }]);
      } else if (dados.erro === 'indisponivel' || r.status === 404 || !tipo.includes('application/json')) {
        setDisponivel(false);
        setErro(INDISPONIVEL);
      } else {
        setErro(dados.mensagem ?? 'Não consegui responder agora. Tente de novo em instantes.');
      }
    } catch {
      setErro('Sem conexão com o Aero agora. Verifique a internet e tente de novo.');
    } finally {
      setEnviando(false);
      window.setTimeout(() => campoRef.current?.focus(), 30);
    }
  };

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    void enviar(texto);
  };

  const usarSugestao = (s: (typeof SUGESTOES)[number]) => {
    if (s.enviar) {
      void enviar(s.texto);
    } else {
      setTexto(s.texto);
      window.setTimeout(() => {
        const c = campoRef.current;
        if (c) {
          c.focus();
          c.setSelectionRange(c.value.length, c.value.length);
        }
      }, 20);
    }
  };

  return (
    <div className="print:hidden">
      {!aberto && (
        <button
          ref={botaoRef}
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir o chat Aero"
          aria-expanded={aberto}
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-50 grid size-14 place-items-center rounded-full bg-petroleo text-gelo shadow-lg shadow-petroleo/30 ring-2 ring-gelo/80 transition hover:scale-105 lg:bottom-6 lg:right-6 dark:ring-petroleo-escuro"
        >
          <IconeChat tamanho={26} />
          <span aria-hidden="true" className="absolute right-1 top-1 size-3.5 rounded-full border-2 border-petroleo bg-ambar" />
        </button>
      )}

      {aberto && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={tituloId}
          className="fixed inset-x-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-borda bg-superficie shadow-2xl lg:inset-x-auto lg:bottom-6 lg:right-6 lg:top-auto lg:h-[min(620px,calc(100dvh-3rem))] lg:w-[380px]"
        >
          <header className="flex items-center gap-3 bg-petroleo px-4 py-3 text-gelo">
            <span className="relative grid size-9 place-items-center rounded-full bg-gelo/15">
              <IconeChat tamanho={20} />
              <span aria-hidden="true" className="absolute right-0 top-0 size-2.5 rounded-full bg-ambar" />
            </span>
            <div className="flex-1">
              <h2 id={tituloId} className="font-extrabold leading-tight">
                Aero
              </h2>
              <p className="text-xs opacity-80">Seu assistente de inglês para a viagem</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                window.setTimeout(() => botaoRef.current?.focus(), 30);
              }}
              aria-label="Fechar o chat"
              className="grid size-11 place-items-center rounded-full hover:bg-gelo/15"
            >
              <IconeFechar tamanho={22} />
            </button>
          </header>

          <div ref={listaRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite" aria-relevant="additions">
            <Balao role="assistant" content={BOAS_VINDAS} />
            {mensagens.length === 0 && disponivel !== false && (
              <div className="flex flex-wrap gap-2 pl-1">
                {SUGESTOES.map((s) => (
                  <button
                    key={s.rotulo}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => usarSugestao(s)}
                    className="min-h-10 rounded-full border border-borda bg-superficie-2 px-3 text-sm font-semibold text-destaque hover:border-destaque disabled:opacity-50"
                  >
                    {s.rotulo}
                  </button>
                ))}
              </div>
            )}
            {mensagens.map((m, i) => (
              <Balao key={i} {...m} />
            ))}
            {enviando && (
              <p className="pl-2 text-sm italic text-suave" role="status">
                Aero está digitando...
              </p>
            )}
            {disponivel === false && (
              <p className="rounded-xl bg-alerta-fundo px-3 py-2 text-sm font-semibold text-alerta-texto" role="status">
                {INDISPONIVEL}
              </p>
            )}
            {limiteAtingido && disponivel !== false && (
              <p className="rounded-xl bg-alerta-fundo px-3 py-2 text-sm text-alerta-texto" role="status">
                Você usou as {LIMITE_DIARIO} mensagens de hoje. Volte amanhã para continuar treinando!
              </p>
            )}
            {erro && disponivel !== false && (
              <p className="rounded-xl bg-alerta-fundo px-3 py-2 text-sm text-alerta-texto" role="alert">
                {erro}
              </p>
            )}
          </div>

          <form onSubmit={aoEnviar} className="border-t border-borda bg-superficie px-3 pb-3 pt-2">
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="aero-campo">
                Sua mensagem para o Aero
              </label>
              <textarea
                id="aero-campo"
                ref={campoRef}
                rows={2}
                value={texto}
                maxLength={MAX_CARACTERES}
                disabled={disponivel === false || limiteAtingido}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void enviar(texto);
                  }
                }}
                placeholder="Escreva sua dúvida..."
                className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-borda bg-fundo px-3 py-2 text-base text-texto placeholder:text-suave disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={bloqueado || !texto.trim()}
                aria-label="Enviar mensagem"
                className="grid size-12 shrink-0 place-items-center rounded-xl bg-primario text-primario-texto disabled:opacity-40"
              >
                <IconeEnviar tamanho={20} />
              </button>
            </div>
            <div className="mt-1 flex justify-between gap-2 text-[0.72rem] leading-snug text-suave">
              <p>Respostas de IA podem ter erros. Não envie dados pessoais. Este chat não é orientação jurídica.</p>
              <p className="shrink-0 tabular-nums" aria-label={`${texto.length} de ${MAX_CARACTERES} caracteres`}>
                {texto.length}/{MAX_CARACTERES}
              </p>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function Balao({ role, content }: Msg) {
  const doAluno = role === 'user';
  return (
    <div className={`flex ${doAluno ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[0.95rem] leading-relaxed ${
          doAluno ? 'rounded-br-md bg-primario text-primario-texto' : 'rounded-bl-md border border-borda bg-superficie-2 text-texto'
        }`}
      >
        <span className="sr-only">{doAluno ? 'Você: ' : 'Aero: '}</span>
        {limparMarkdown(content)}
      </p>
    </div>
  );
}

/** Remove marcações simples de markdown para exibir texto limpo. */
function limparMarkdown(t: string) {
  return t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').replace(/`([^`]+)`/g, '$1');
}
