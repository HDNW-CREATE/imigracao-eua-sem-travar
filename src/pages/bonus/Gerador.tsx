import { useMemo, useState, type ReactNode } from 'react';
import { AudioPlayer } from '../../components/AudioPlayer';
import { Aviso, BotaoCopiar, Cabecalho, Cartao, Etiqueta, Picote, estiloBotao } from '../../components/Ui';
import { IconeCheck, IconeEstrela, IconeVarinha } from '../../components/Icones';
import { CHAVES, useLocal } from '../../lib/armazenamento';
import { apoio, ROTULO_NIVEL } from '../../lib/conteudo';
import {
  DADOS_INICIAIS,
  LIMITE_DECLARACAO,
  OPCOES_COM_QUEM,
  camposFaltando,
  diaValido,
  gerarRespostas,
  type DadosGerador,
} from '../../lib/gerador';
import { MESES_PT } from '../../lib/ingles';

interface Salvo {
  dados: DadosGerador;
  salvoEm: string;
}

const CLASSE_CAMPO = 'mt-1 min-h-12 w-full rounded-xl border border-borda bg-fundo px-3 text-base text-texto placeholder:text-suave/70';

function Campo({ id, rotulo, ajuda, children }: { id: string; rotulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {rotulo}
      </label>
      {children}
      {ajuda && (
        <p id={`${id}-ajuda`} className="mt-1 text-sm text-suave">
          {ajuda}
        </p>
      )}
    </div>
  );
}

export function BonusGerador() {
  const [salvo, setSalvo] = useLocal<Salvo | null>(CHAVES.gerador, null);
  const [dados, setDados] = useState<DadosGerador>(() => ({ ...DADOS_INICIAIS, ...(salvo?.dados ?? {}) }));
  const [gerado, setGerado] = useState<DadosGerador | null>(() => (salvo ? { ...DADOS_INICIAIS, ...salvo.dados } : null));
  const [faltando, setFaltando] = useState<string[]>([]);
  const [msgSalvo, setMsgSalvo] = useState(false);

  const cards = useMemo(() => (gerado ? gerarRespostas(gerado) : []), [gerado]);
  const mudar = <K extends keyof DadosGerador>(k: K, v: DadosGerador[K]) => setDados((a) => ({ ...a, [k]: v }));
  const precisaParentesco = dados.motivo === 'familia' || dados.hospedagem === 'familiar' || dados.quemPaga === 'familiar';

  const gerar = () => {
    const f = camposFaltando(dados);
    if (!diaValido(dados.mesVolta, dados.diaVolta)) f.push('um dia que exista nesse mês');
    setFaltando(f);
    if (f.length) return;
    setGerado({ ...dados });
    setMsgSalvo(false);
    window.setTimeout(() => document.getElementById('respostas-geradas')?.scrollIntoView({ block: 'start' }), 50);
  };

  const salvar = () => {
    if (!gerado) return;
    setSalvo({ dados: gerado, salvoEm: new Date().toLocaleString('pt-BR') });
    setMsgSalvo(true);
  };

  const textoNivel2 = cards.map((c) => `${c.perguntaEn}\n${c.niveis[1]}`).join('\n\n');
  const alertaDinheiro = (gerado?.dinheiro ?? 0) >= LIMITE_DECLARACAO;

  return (
    <div className="space-y-6">
      <Cabecalho
        titulo="Gerador de Respostas Personalizadas"
        sobre={
          <span className="inline-flex items-center gap-2">
            <Etiqueta>Bônus 4</Etiqueta>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-alerta-texto dark:text-ambar">
              <IconeEstrela tamanho={16} /> Destaque
            </span>
          </span>
        }
        subtitulo="Preencha os dados da SUA viagem e receba as respostas prontas em inglês nos 3 níveis, com áudio."
      />

      <Aviso tom="alerta">
        <strong>Use apenas respostas verdadeiras para a sua viagem.</strong> Se algo não combinar com a sua realidade, ajuste os dados ou não use a frase.
      </Aviso>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          gerar();
        }}
        noValidate
      >
        <Cartao cor="ambar" as="div">
          <fieldset>
            <legend className="text-lg font-bold">Motivo da viagem</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ['turismo', 'Turismo / férias'],
                  ['familia', 'Visitar família'],
                  ['trabalho', 'Trabalho / reunião'],
                ] as const
              ).map(([v, r]) => (
                <label key={v} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 ${dados.motivo === v ? 'border-destaque bg-superficie-2 font-semibold' : 'border-borda'}`}>
                  <input type="radio" name="motivo" value={v} checked={dados.motivo === v} onChange={() => mudar('motivo', v)} className="size-5 accent-[var(--primario)]" />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <Picote />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="g-cidade" rotulo="Cidade onde mora" ajuda="Ex.: São Paulo (o país Brazil é incluído).">
              <input id="g-cidade" className={CLASSE_CAMPO} value={dados.cidadeMora} onChange={(e) => mudar('cidadeMora', e.target.value)} placeholder="São Paulo" autoComplete="off" />
            </Campo>
            <Campo id="g-destino" rotulo="Cidade de destino" ajuda="Onde você chega ou vai ficar mais tempo.">
              <input id="g-destino" className={CLASSE_CAMPO} value={dados.destino} onChange={(e) => mudar('destino', e.target.value)} placeholder="Orlando" autoComplete="off" />
            </Campo>
            <Campo id="g-cidades" rotulo="Cidades que vai visitar (em inglês)" ajuda="Use “and” antes da última: Orlando and Miami.">
              <input id="g-cidades" className={CLASSE_CAMPO} value={dados.cidades} onChange={(e) => mudar('cidades', e.target.value)} placeholder="Orlando and Miami" autoComplete="off" lang="en" />
            </Campo>
            <Campo id="g-dias" rotulo="Número de dias">
              <input
                id="g-dias"
                type="number"
                inputMode="numeric"
                min={1}
                max={365}
                className={CLASSE_CAMPO}
                value={dados.dias || ''}
                onChange={(e) => mudar('dias', Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
                placeholder="10"
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <Campo id="g-mes" rotulo="Mês da volta">
                <select id="g-mes" className={CLASSE_CAMPO} value={dados.mesVolta} onChange={(e) => mudar('mesVolta', Number(e.target.value))}>
                  <option value={0}>Escolha</option>
                  {MESES_PT.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m} ({apoio.meses[i]?.en})
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo id="g-dia" rotulo="Dia da volta">
                <select id="g-dia" className={CLASSE_CAMPO} value={dados.diaVolta} onChange={(e) => mudar('diaVolta', Number(e.target.value))}>
                  <option value={0}>Escolha</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
            <Campo id="g-hosp" rotulo="Onde vai ficar">
              <select id="g-hosp" className={CLASSE_CAMPO} value={dados.hospedagem} onChange={(e) => mudar('hospedagem', e.target.value as DadosGerador['hospedagem'])}>
                <option value="hotel">Hotel</option>
                <option value="familiar">Casa de familiar</option>
                <option value="amigo">Casa de amigo(a)</option>
                <option value="aluguel">Casa/apartamento alugado (ex.: Airbnb)</option>
              </select>
            </Campo>
            <Campo id="g-par" rotulo="Parentesco do familiar" ajuda={precisaParentesco ? 'Usado nas respostas sobre família.' : 'Só é usado se envolver família.'}>
              <select id="g-par" className={CLASSE_CAMPO} value={dados.parentesco} onChange={(e) => mudar('parentesco', e.target.value)}>
                {apoio.parentesco
                  .filter((p) => p.en !== 'friend')
                  .map((p) => (
                    <option key={p.en} value={p.en}>
                      {p.pt} ({p.en})
                    </option>
                  ))}
              </select>
            </Campo>
            <Campo id="g-com" rotulo="Com quem viaja">
              <select id="g-com" className={CLASSE_CAMPO} value={dados.comQuem} onChange={(e) => mudar('comQuem', e.target.value)}>
                {OPCOES_COM_QUEM.map((o) => (
                  <option key={o.en} value={o.en}>
                    {o.pt} ({o.en})
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="g-prof" rotulo="Profissão em inglês" ajuda="Ex.: teacher, engineer, nurse, retired. Veja a lista no Bônus 2.">
              <input id="g-prof" className={CLASSE_CAMPO} value={dados.profissao} onChange={(e) => mudar('profissao', e.target.value)} placeholder="teacher" autoComplete="off" lang="en" list="lista-profissoes" />
              <datalist id="lista-profissoes">
                {apoio.profissoes.map((p) => (
                  <option key={p.en} value={p.en}>
                    {p.pt}
                  </option>
                ))}
              </datalist>
            </Campo>
            <Campo id="g-paga" rotulo="Quem paga a viagem">
              <select id="g-paga" className={CLASSE_CAMPO} value={dados.quemPaga} onChange={(e) => mudar('quemPaga', e.target.value as DadosGerador['quemPaga'])}>
                <option value="eu">Eu mesmo(a)</option>
                <option value="empresa">Minha empresa</option>
                <option value="familiar">Meu familiar (parentesco acima)</option>
              </select>
            </Campo>
            <Campo id="g-din" rotulo="Dinheiro em espécie (US$)" ajuda="Valor aproximado e verdadeiro, em dólares.">
              <input
                id="g-din"
                type="number"
                inputMode="numeric"
                min={0}
                step={50}
                className={CLASSE_CAMPO}
                value={dados.dinheiro || ''}
                onChange={(e) => mudar('dinheiro', Math.max(0, Number(e.target.value) || 0))}
                placeholder="2000"
              />
            </Campo>
            <fieldset className="sm:col-span-2">
              <legend className="font-semibold">É a sua primeira vez nos EUA?</legend>
              <div className="mt-1 flex gap-2">
                {(
                  [
                    ['sim', 'Sim'],
                    ['nao', 'Não'],
                  ] as const
                ).map(([v, r]) => (
                  <label key={v} className={`flex min-h-12 flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 ${dados.primeiraVez === v ? 'border-destaque bg-superficie-2 font-semibold' : 'border-borda'}`}>
                    <input type="radio" name="primeira" checked={dados.primeiraVez === v} onChange={() => mudar('primeiraVez', v)} className="size-5 accent-[var(--primario)]" />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {dados.dinheiro >= LIMITE_DECLARACAO && (
            <Aviso tom="alerta" className="mt-4">
              Valores a partir de US$ 10.000 precisam ser declarados. Confira a regra atual na CBP e responda com a verdade.
            </Aviso>
          )}

          {faltando.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-ambar bg-alerta-fundo px-4 py-3 text-alerta-texto">
              Preencha: {faltando.join(', ')}.
            </div>
          )}

          <button type="submit" className={`${estiloBotao.primario} mt-5 w-full py-3.5 text-lg`}>
            <IconeVarinha tamanho={20} /> Gerar minhas respostas
          </button>
        </Cartao>
      </form>

      {gerado && (
        <section id="respostas-geradas" aria-labelledby="titulo-geradas" className="scroll-mt-20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-geradas" className="text-xl font-bold">
              Suas respostas
            </h2>
            {salvo && <span className="text-sm text-suave">Salvas em {salvo.salvoEm}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            <BotaoCopiar texto={textoNivel2} rotulo="Copiar todas (nível 2)" />
            <button type="button" className={estiloBotao.ambar} onClick={salvar}>
              <IconeCheck tamanho={18} /> {msgSalvo ? 'Respostas salvas!' : 'Salvar minhas respostas'}
            </button>
          </div>

          {alertaDinheiro && (
            <Aviso tom="alerta">Valores a partir de US$ 10.000 precisam ser declarados. Confira a regra atual na CBP e responda com a verdade.</Aviso>
          )}

          <ul className="space-y-4">
            {cards.map((c, idx) => (
              <Cartao as="li" key={c.id} cor={idx % 3 === 0 ? 'petroleo' : idx % 3 === 1 ? 'ceu' : 'ambar'}>
                <p className="text-xs font-bold uppercase tracking-wide text-suave">{c.titulo}</p>
                <p className="mt-1 text-lg font-bold" lang="en">
                  {c.perguntaEn}
                </p>
                <p className="text-sm text-suave">{c.perguntaPt}</p>
                <AudioPlayer id={`ger-p-${c.id}`} texto={c.perguntaEn} rotulo="Ouvir o oficial" compacto className="mt-2" />
                <Picote />
                <div className="space-y-3">
                  {c.niveis.map((t, i) => (
                    <div key={i} className="rounded-xl border border-borda bg-fundo/60 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-suave">
                        Nível {i + 1} · {ROTULO_NIVEL[i + 1].nome}
                      </p>
                      <p className="mt-1 text-lg font-semibold" lang="en">
                        {t}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <AudioPlayer id={`ger-${c.id}-${i}`} texto={t} compacto />
                        <BotaoCopiar texto={t} />
                      </div>
                    </div>
                  ))}
                </div>
              </Cartao>
            ))}
          </ul>

          <Aviso tom="alerta">
            <strong>Use apenas respostas verdadeiras para a sua viagem.</strong> Confira datas e valores com a sua passagem e a sua reserva.
          </Aviso>
        </section>
      )}
    </div>
  );
}
