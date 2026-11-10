import { Link } from 'react-router-dom';
import { BarraProgresso, Cartao, LinkCard, SeloCompleto, estiloBotao } from '../components/Ui';
import { IconeBaixar, IconeBoia, IconeChecklist, IconeEstrela, IconePerguntas, IconePlay, IconeRelogio } from '../components/Icones';
import { NAV_BONUS, NOME_SITE, SUBTITULO_SITE } from '../components/Layout';
import { CHAVES, useLocal } from '../lib/armazenamento';
import { perguntas } from '../lib/conteudo';
import { pct, useChecklist, useTreinadas } from '../lib/progresso';

const DESCRICAO_BONUS: Record<number, string> = {
  1: 'A pronúncia escrita em português de todas as frases, com áudio.',
  2: 'Sua ficha da viagem em inglês: datas, números e endereço sem branco.',
  3: 'Os erros de fala mais comuns na fila e o que dizer no lugar.',
  4: 'Preencha seus dados e receba as respostas da SUA viagem nos 3 níveis.',
};

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Inicio() {
  const { total: treinadas } = useTreinadas();
  const { feitos, total: totalCheck } = useChecklist();
  const [ultimo] = useLocal<{ caminho: string; titulo: string } | null>(CHAVES.ultimo, null);

  const totalPerguntas = perguntas.length;
  const geral = pct(treinadas + feitos, totalPerguntas + totalCheck);
  const destinoContinuar = ultimo?.caminho ?? (perguntas[0] ? `/perguntas/${perguntas[0].codigo}` : '/perguntas');

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <SeloCompleto />
          <span className="text-sm text-suave">Acesso total liberado</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{saudacao()}! Pronto(a) para treinar?</h1>
        <p className="mt-2 text-suave">
          <strong className="text-texto">{NOME_SITE}:</strong> {SUBTITULO_SITE}
        </p>
      </section>

      <Cartao cor="ambar" aria-labelledby="titulo-progresso">
        <h2 id="titulo-progresso" className="text-lg font-bold">
          Seu progresso
        </h2>
        <div className="mt-4 space-y-4">
          <BarraProgresso valor={geral} rotulo="Progresso geral" cor="ambar" />
          <div className="picote" role="presentation" />
          <BarraProgresso valor={pct(treinadas, totalPerguntas)} rotulo={`Perguntas treinadas (${treinadas} de ${totalPerguntas})`} />
          <BarraProgresso valor={pct(feitos, totalCheck)} rotulo={`Checklist (${feitos} de ${totalCheck})`} cor="sucesso" />
        </div>
        <Link to={destinoContinuar} className={`${estiloBotao.primario} mt-6 w-full py-3.5 text-lg`}>
          <IconePlay tamanho={20} />
          Continuar de onde parei
        </Link>
        {ultimo && <p className="mt-2 text-center text-sm text-suave">Último acesso: {ultimo.titulo}</p>}
      </Cartao>

      <section aria-labelledby="titulo-acessos">
        <h2 id="titulo-acessos" className="mb-3 text-xl font-bold">
          Acesso rápido
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkCard para="/perguntas" titulo="Perguntas" descricao="As perguntas do oficial, com 3 níveis de resposta e áudio." icone={<IconePerguntas />} />
          <LinkCard para="/resgate" titulo="Frases de resgate" descricao="6 frases para quando não entender ou travar." icone={<IconeBoia />} cor="ceu" />
          <LinkCard para="/checklist" titulo="Checklist" descricao="Antes de viajar, no avião e na cabine." icone={<IconeChecklist />} cor="sucesso" />
          <LinkCard para="/treino" titulo="Treino de 1 hora" descricao="Plano guiado, modo treino e autoteste." icone={<IconeRelogio />} cor="ambar" />
          <LinkCard para="/downloads" titulo="Downloads" descricao="Guia principal e PDFs dos bônus." icone={<IconeBaixar />} />
        </div>
      </section>

      <section aria-labelledby="titulo-bonus" className="rounded-3xl bg-petroleo p-5 text-gelo sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="titulo-bonus" className="text-xl font-extrabold">
            Seus bônus
          </h2>
          <span className="rounded-full bg-ambar px-2.5 py-0.5 text-xs font-bold uppercase text-petroleo-escuro">Incluídos no Completo</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {NAV_BONUS.map(({ para, rotulo, numero, icone: I, estrela }) => (
            <Link
              key={para}
              to={para}
              className={`relative block rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                estrela ? 'border-ambar bg-ambar/15' : 'border-gelo/20 bg-gelo/10 hover:bg-gelo/15'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ceu">
                Bônus {numero}
                {estrela && (
                  <span className="inline-flex items-center gap-1 text-ambar">
                    <IconeEstrela tamanho={14} /> Destaque
                  </span>
                )}
              </span>
              <span className="mt-1 flex items-center gap-2 text-lg font-bold">
                <I tamanho={20} /> {rotulo} {estrela && <span aria-label="estrela">⭐</span>}
              </span>
              <span className="mt-1 block text-sm text-gelo/80">{DESCRICAO_BONUS[numero]}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="rounded-xl border border-borda bg-superficie px-4 py-3 text-sm text-suave">
        Este material treina comunicação em inglês. Não é orientação jurídica e não garante entrada nos EUA. Diga sempre a verdade.
      </p>
    </div>
  );
}
