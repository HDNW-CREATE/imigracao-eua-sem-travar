import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AudioPlayer } from '../components/AudioPlayer';
import { ModoTreino } from '../components/ModoTreino';
import { Autoteste } from '../components/Autoteste';
import { Cabecalho, Cartao, Etiqueta } from '../components/Ui';
import { BLOCOS, apoio, perguntas, pronuncia, resgate } from '../lib/conteudo';

const PLANO = [
  { min: 10, etapa: 'Aquecimento', oque: 'Ouça as frases do oficial e as 6 frases de resgate no modo lento (0.75x). Repita em voz alta.', exercicio: 'Exercício 2' },
  { min: 20, etapa: 'Modo treino por bloco', oque: 'Pergunta do oficial → 5 segundos para você responder → resposta-modelo. Níveis 1 e 2.', exercicio: 'Exercício 1' },
  { min: 15, etapa: 'As suas respostas', oque: 'Monte as respostas da SUA viagem (Gerador e Cartão) e treine datas, números e nível 3.', exercicio: 'Exercício 3' },
  { min: 10, etapa: 'Autoteste', oque: '10 perguntas sorteadas, só com o áudio do oficial. Responda e avalie: Sim, Quase ou Não.', exercicio: 'Exercício 4' },
  { min: 5, etapa: 'Revisão', oque: 'Repita as frases de resgate sem olhar e confira o checklist.', exercicio: 'Checklist' },
];

export function Treino() {
  const [params, setParams] = useSearchParams();
  const blocosComConteudo = BLOCOS.filter((b) => perguntas.some((p) => p.bloco === b.id));
  const blocoUrl = params.get('bloco');
  const [bloco, setBloco] = useState<string>(
    blocoUrl && blocosComConteudo.some((b) => b.id === blocoUrl) ? blocoUrl : (blocosComConteudo[0]?.id ?? 'A'),
  );
  const lista = useMemo(() => perguntas.filter((p) => p.bloco === bloco), [bloco]);

  useEffect(() => {
    if (window.location.hash === '#modo-treino') {
      window.setTimeout(() => document.getElementById('modo-treino')?.scrollIntoView({ block: 'start' }), 60);
    }
  }, []);

  return (
    <div className="space-y-8">
      <Cabecalho titulo="Treino de 1 hora" subtitulo="Um plano simples para treinar ouvindo e falando. Faça uma vez por dia nos dias antes da viagem." />

      <Cartao cor="ambar" aria-labelledby="titulo-plano">
        <h2 id="titulo-plano" className="text-lg font-bold">
          Plano de 60 minutos
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-[0.95rem]">
            <caption className="sr-only">Plano de treino de 1 hora: 10, 20, 15, 10 e 5 minutos</caption>
            <thead>
              <tr className="border-b-2 border-dashed border-borda text-sm text-suave">
                <th scope="col" className="py-2 pr-3">Tempo</th>
                <th scope="col" className="py-2 pr-3">Etapa</th>
                <th scope="col" className="py-2">O que fazer</th>
              </tr>
            </thead>
            <tbody>
              {PLANO.map((l) => (
                <tr key={l.etapa} className="border-b border-borda align-top last:border-0">
                  <td className="py-3 pr-3 font-extrabold tabular-nums text-destaque">{l.min} min</td>
                  <th scope="row" className="py-3 pr-3 font-semibold">
                    {l.etapa}
                    <span className="block text-xs font-normal text-suave">{l.exercicio}</span>
                  </th>
                  <td className="py-3">{l.oque}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-3 font-extrabold text-destaque">60 min</td>
                <td colSpan={2} className="pt-3 text-sm text-suave">
                  Total. Se tiver pouco tempo, faça só os exercícios 1 e 4.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Cartao>

      <section id="modo-treino" aria-labelledby="ex1" className="scroll-mt-20">
        <Etiqueta>Exercício 1 · 20 min</Etiqueta>
        <h2 id="ex1" className="mt-2 text-xl font-bold">
          Modo treino por bloco
        </h2>
        <p className="mt-1 text-suave">Escolha o bloco. O oficial pergunta, você responde em 5 segundos e depois ouve a resposta-modelo.</p>
        <div role="group" aria-label="Escolher bloco" className="my-3 flex flex-wrap gap-2">
          {BLOCOS.map((b) => {
            const vazio = !perguntas.some((p) => p.bloco === b.id);
            return (
              <button
                key={b.id}
                type="button"
                disabled={vazio}
                aria-pressed={bloco === b.id}
                onClick={() => {
                  setBloco(b.id);
                  setParams({ bloco: b.id }, { replace: true });
                }}
                className={`min-h-10 rounded-full px-3 text-sm font-semibold disabled:opacity-40 ${
                  bloco === b.id ? 'bg-primario text-primario-texto' : 'border border-borda bg-superficie-2 text-texto'
                }`}
              >
                {b.id} · {b.nome}
              </button>
            );
          })}
        </div>
        <ModoTreino lista={lista} titulo={`Bloco ${bloco}`} />
      </section>

      <section aria-labelledby="ex2">
        <Etiqueta>Exercício 2 · 10 min</Etiqueta>
        <h2 id="ex2" className="mt-2 text-xl font-bold">
          Sombra: ouça e repita junto
        </h2>
        <p className="mt-1 text-suave">
          Ative o <strong>0.75x</strong> e o <strong>repetir</strong>. Fale junto com o áudio até sair sem pensar.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Cartao cor="ceu">
            <h3 className="font-bold">Frases do oficial na cabine</h3>
            <ul className="mt-2 space-y-3">
              {pronuncia.oficial.map((f) => (
                <li key={f.id}>
                  <p className="font-semibold" lang="en">{f.en}</p>
                  {f.pt && <p className="text-sm text-suave">{f.pt}</p>}
                  <AudioPlayer id={`sombra-${f.id}`} texto={f.en} audio={f.audio} compacto className="mt-1" />
                </li>
              ))}
            </ul>
          </Cartao>
          <Cartao cor="petroleo">
            <h3 className="font-bold">Frases de resgate</h3>
            <ul className="mt-2 space-y-3">
              {resgate.map((f) => (
                <li key={f.id}>
                  <p className="font-semibold" lang="en">{f.en}</p>
                  <p className="text-sm text-suave">{f.pt}</p>
                  <AudioPlayer id={`sombra-${f.id}`} texto={f.en} audio={f.audio} compacto className="mt-1" />
                </li>
              ))}
            </ul>
          </Cartao>
        </div>
      </section>

      <section aria-labelledby="ex3">
        <Etiqueta>Exercício 3 · 15 min</Etiqueta>
        <h2 id="ex3" className="mt-2 text-xl font-bold">
          As suas datas, números e respostas
        </h2>
        <p className="mt-1 text-suave">
          O que mais dá branco é data e número. Gere as respostas da sua viagem no{' '}
          <Link to="/bonus/gerador" className="font-semibold text-destaque underline">
            Gerador (Bônus 4)
          </Link>{' '}
          e preencha o{' '}
          <Link to="/bonus/cartao" className="font-semibold text-destaque underline">
            Cartão da viagem (Bônus 2)
          </Link>
          . Depois leia em voz alta 3 vezes:
        </p>
        <Cartao cor="ambar" className="mt-3">
          <ul className="space-y-3">
            {[...apoio.datasTreino, ...apoio.dinheiro.slice(0, 1)].map((f, i) => (
              <li key={i}>
                <p className="font-semibold" lang="en">{f.en}</p>
                <p className="text-sm italic text-suave">🗣️ {f.pronuncia}</p>
                <AudioPlayer id={`ex3-${i}`} texto={f.en} compacto className="mt-1" />
              </li>
            ))}
          </ul>
        </Cartao>
      </section>

      <section aria-labelledby="ex4">
        <Etiqueta>Exercício 4 · 10 min</Etiqueta>
        <h2 id="ex4" className="mt-2 text-xl font-bold">
          Autoteste
        </h2>
        <p className="mt-1 text-suave">Sorteamos até 10 perguntas. Você só ouve o oficial, responde em voz alta e se avalia com sinceridade.</p>
        <div className="mt-3">
          <Autoteste />
        </div>
      </section>
    </div>
  );
}
