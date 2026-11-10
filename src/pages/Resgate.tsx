import { AudioPlayer } from '../components/AudioPlayer';
import { Aviso, BotaoCopiar, Cabecalho, Cartao, Etiqueta, Picote, Pronuncia } from '../components/Ui';
import { resgate } from '../lib/conteudo';

export function Resgate() {
  return (
    <div>
      <Cabecalho
        titulo="Frases de resgate"
        subtitulo="Não entendeu? Travou? Use uma destas frases com calma. Pedir para repetir é normal e muito melhor do que dizer “yes” sem entender."
      />
      <ul className="space-y-4">
        {resgate.map((f, i) => (
          <Cartao as="li" key={f.id} cor={i % 2 ? 'ceu' : 'petroleo'}>
            <div className="flex items-center gap-2">
              <Etiqueta>{f.id}</Etiqueta>
              {f.quando && <span className="text-sm text-suave">{f.quando}</span>}
            </div>
            <p className="mt-3 text-2xl font-extrabold leading-snug" lang="en">
              {f.en}
            </p>
            <Picote />
            <p className="text-lg">{f.pt}</p>
            {f.pronuncia && <Pronuncia>{f.pronuncia}</Pronuncia>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AudioPlayer id={f.id} texto={f.en} audio={f.audio} destaque />
              <BotaoCopiar texto={f.en} />
            </div>
          </Cartao>
        ))}
      </ul>
      <Aviso className="mt-6">Dica: use o modo lento (0.75x) e o repetir para decorar. Depois diga em voz alta sem olhar.</Aviso>
    </div>
  );
}
