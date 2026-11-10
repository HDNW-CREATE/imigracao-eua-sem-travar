import { Cabecalho, LinkCard, SeloCompleto } from '../components/Ui';
import { IconeBaixar, IconeEmail, IconeEstrela, IconeRelogio } from '../components/Icones';
import { EMAIL_SUPORTE, NAV_BONUS } from '../components/Layout';

export function Mais() {
  return (
    <div className="space-y-6">
      <Cabecalho titulo="Mais" sobre={<SeloCompleto />} />
      <div className="grid gap-3">
        <LinkCard para="/treino" titulo="Treino de 1 hora" descricao="Plano guiado, modo treino e autoteste." icone={<IconeRelogio />} cor="ambar" />
        <LinkCard para="/downloads" titulo="Downloads" descricao="Guia principal e PDFs dos bônus." icone={<IconeBaixar />} />
      </div>
      <section aria-labelledby="mais-bonus">
        <h2 id="mais-bonus" className="mb-3 text-lg font-bold">
          Seus bônus
        </h2>
        <div className="grid gap-3">
          {NAV_BONUS.map(({ para, rotulo, numero, icone: I, estrela }) => (
            <LinkCard
              key={para}
              para={para}
              titulo={`Bônus ${numero} · ${rotulo}`}
              descricao={estrela ? 'Respostas da sua viagem nos 3 níveis.' : 'Abrir bônus'}
              icone={<I />}
              cor={estrela ? 'ambar' : 'ceu'}
              extra={estrela ? <IconeEstrela tamanho={16} className="text-ambar" /> : undefined}
            />
          ))}
        </div>
      </section>
      <a
        href={`mailto:${EMAIL_SUPORTE}`}
        className="flex min-h-14 items-center gap-3 rounded-2xl border border-borda bg-superficie px-4 py-3 font-semibold hover:border-destaque"
      >
        <IconeEmail /> Suporte: <span className="break-all text-destaque">{EMAIL_SUPORTE}</span>
      </a>
    </div>
  );
}
