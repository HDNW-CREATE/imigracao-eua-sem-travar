import { useMemo, useState } from 'react';
import { AudioPlayer } from '../../components/AudioPlayer';
import { Aviso, Cabecalho, Cartao, Etiqueta, Picote } from '../../components/Ui';
import { IconeBusca } from '../../components/Icones';
import { pronuncia } from '../../lib/conteudo';
import type { FrasePronuncia } from '../../lib/tipos';

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function Linha({ f, idPrefixo }: { f: FrasePronuncia; idPrefixo: string }) {
  return (
    <li className="flex flex-col gap-2 border-b border-borda py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold text-suave">
          {f.id.endsWith('-alt') ? f.observacao : f.id}
          {f.nivel ? ` · nível ${f.nivel}` : ''}
        </p>
        <p className="font-semibold" lang="en">
          {f.en}
        </p>
        <p className="text-[1.02rem] text-destaque">→ {f.pronuncia}</p>
        {f.pt && <p className="text-sm text-suave">{f.pt}</p>}
      </div>
      <AudioPlayer id={`${idPrefixo}-${f.id}`} texto={f.en} audio={f.audio} compacto className="shrink-0" />
    </li>
  );
}

export function BonusPronuncia() {
  const [busca, setBusca] = useState('');
  const termo = normalizar(busca.trim());
  const casa = (f: { id?: string; codigo?: string; en: string; pronuncia: string; pt?: string }) =>
    !termo || normalizar(`${f.id ?? ''} ${f.codigo ?? ''} ${f.en} ${f.pronuncia} ${f.pt ?? ''}`).includes(termo);

  const perguntas = useMemo(
    () =>
      pronuncia.perguntas
        .map((p) => {
          const perguntaCasa = casa(p);
          const respostas = perguntaCasa ? p.respostas : p.respostas.filter(casa);
          return { ...p, respostas, visivel: perguntaCasa || respostas.length > 0 };
        })
        .filter((p) => p.visivel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [termo],
  );
  const oficial = pronuncia.oficial.filter(casa);
  const resgate = pronuncia.resgate.filter(casa);
  const nada = !perguntas.length && !oficial.length && !resgate.length;

  return (
    <div className="space-y-6">
      <Cabecalho titulo={`Leia como se Fala`} sobre={<Etiqueta>Bônus 1</Etiqueta>} subtitulo={pronuncia.subtitulo} />

      <Cartao cor="ambar" aria-labelledby="legenda">
        <h2 id="legenda" className="text-lg font-bold">
          Como ler (legenda rápida)
        </h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {pronuncia.legenda.map((l) => (
            <div key={l.simbolo} className="rounded-xl bg-superficie-2 px-3 py-2">
              <dt className="font-extrabold text-destaque">{l.simbolo}</dt>
              <dd className="text-sm">
                {l.explicacao}
                {l.exemplo && <span className="text-suave"> Ex.: {l.exemplo}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-suave">{pronuncia.observacaoLegenda}</p>
        <Picote />
        <h3 className="font-bold">3 dicas para soar melhor em 5 minutos</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {pronuncia.dicas.map((d) => (
            <li key={d.titulo}>
              <strong>{d.titulo}</strong> {d.texto}
            </li>
          ))}
        </ol>
      </Cartao>

      <label className="relative block">
        <span className="sr-only">Buscar frase</span>
        <IconeBusca className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" tamanho={20} />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar frase, pronúncia ou código (ex.: hotel, R02)"
          className="min-h-12 w-full rounded-xl border border-borda bg-superficie pl-10 pr-3 text-base text-texto placeholder:text-suave"
        />
      </label>

      {nada && <p className="text-suave">Nada encontrado para “{busca}”.</p>}

      {oficial.length > 0 && (
        <Cartao cor="ceu" aria-labelledby="oficial">
          <h2 id="oficial" className="text-lg font-bold">
            As frases do oficial na cabine
          </h2>
          <ul className="mt-1">
            {oficial.map((f) => (
              <Linha key={f.id} f={f} idPrefixo="pron" />
            ))}
          </ul>
        </Cartao>
      )}

      {perguntas.map((p) => {
        const grupos: { nome: string | null; itens: FrasePronuncia[] }[] = [];
        for (const r of p.respostas) {
          const nome = r.grupo ?? null;
          const ultimo = grupos[grupos.length - 1];
          if (ultimo && ultimo.nome === nome) ultimo.itens.push(r);
          else grupos.push({ nome, itens: [r] });
        }
        return (
          <Cartao key={p.codigo} as="article" aria-labelledby={`pron-${p.codigo}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Etiqueta>{p.codigo}</Etiqueta>
                <h2 id={`pron-${p.codigo}`} className="mt-1 text-lg font-bold" lang="en">
                  {p.en}
                </h2>
                <p className="text-[1.02rem] text-destaque">→ {p.pronuncia}</p>
              </div>
              <AudioPlayer id={`pron-${p.codigo}`} texto={p.en} audio={p.audio} rotulo="Ouvir o oficial" compacto className="shrink-0" />
            </div>
            <Picote />
            {grupos.map((g, i) => (
              <div key={i}>
                {g.nome && <p className="mt-2 text-sm font-bold uppercase tracking-wide text-suave">{g.nome}</p>}
                <ul>
                  {g.itens.map((r) => (
                    <Linha key={r.id} f={r} idPrefixo="pron" />
                  ))}
                </ul>
              </div>
            ))}
          </Cartao>
        );
      })}

      {resgate.length > 0 && (
        <Cartao cor="ambar" aria-labelledby="pron-resgate">
          <h2 id="pron-resgate" className="text-lg font-bold">
            As 6 frases de resgate
          </h2>
          <ul className="mt-1">
            {resgate.map((f) => (
              <Linha key={f.id} f={f} idPrefixo="pron" />
            ))}
          </ul>
        </Cartao>
      )}

      {!termo && (
        <Cartao cor="sucesso">
          <h2 className="text-lg font-bold">Treino rápido (10 minutos)</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {pronuncia.treinoRapido.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </Cartao>
      )}

      <Aviso>{pronuncia.aviso}</Aviso>
    </div>
  );
}
