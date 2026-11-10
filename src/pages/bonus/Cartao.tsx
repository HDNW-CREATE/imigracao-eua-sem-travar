import { useRef, useState } from 'react';
import { AudioPlayer } from '../../components/AudioPlayer';
import { Aviso, BotaoCopiar, Cabecalho, Cartao, Etiqueta, estiloBotao } from '../../components/Ui';
import { IconeCheck, IconeImprimir } from '../../components/Icones';
import { CHAVES, useLocal } from '../../lib/armazenamento';
import { apoio } from '../../lib/conteudo';
import type { ItemApoio } from '../../lib/tipos';

interface Campo {
  id: string;
  pt: string;
  en: string;
  exemplo: string;
  tipo?: 'text' | 'tel';
  grupo: string;
}

const CAMPOS: Campo[] = [
  { id: 'nome', pt: 'Nome completo', en: 'Full name', exemplo: 'Maria Silva', grupo: 'Você' },
  { id: 'cidade', pt: 'Cidade onde mora', en: 'City where I live', exemplo: 'São Paulo, Brazil', grupo: 'Você' },
  { id: 'profissao', pt: 'Profissão', en: 'Occupation', exemplo: 'Teacher', grupo: 'Você' },
  { id: 'trabalho', pt: 'Onde trabalha', en: 'Workplace', exemplo: 'Escola ABC, São Paulo', grupo: 'Você' },
  { id: 'motivo', pt: 'Motivo da viagem', en: 'Purpose of trip', exemplo: 'Vacation', grupo: 'Viagem' },
  { id: 'chegada', pt: 'Data de chegada', en: 'Arrival date', exemplo: 'March third', grupo: 'Viagem' },
  { id: 'volta', pt: 'Data de volta', en: 'Return date', exemplo: 'March thirteenth', grupo: 'Viagem' },
  { id: 'dias', pt: 'Quantos dias', en: 'Length of stay', exemplo: 'Ten days', grupo: 'Viagem' },
  { id: 'vooIda', pt: 'Voo de ida (nº)', en: 'Departure flight', exemplo: 'XX 1234', grupo: 'Viagem' },
  { id: 'vooVolta', pt: 'Voo de volta (nº)', en: 'Return flight', exemplo: 'XX 5678', grupo: 'Viagem' },
  { id: 'cidades', pt: 'Cidades que vai visitar', en: 'Cities I will visit', exemplo: 'Orlando and Miami', grupo: 'Viagem' },
  { id: 'hotelNome', pt: 'Nome da hospedagem', en: 'Hotel name', exemplo: 'Hotel Sunshine', grupo: 'Hospedagem' },
  { id: 'hotelEndereco', pt: 'Endereço da hospedagem', en: 'Hotel address', exemplo: '100 Main Street, Orlando', grupo: 'Hospedagem' },
  { id: 'hotelTelefone', pt: 'Telefone da hospedagem', en: 'Hotel phone', exemplo: '+1 000 000 0000', tipo: 'tel', grupo: 'Hospedagem' },
  { id: 'quemPaga', pt: 'Quem paga a viagem', en: 'Who is paying', exemplo: 'I am', grupo: 'Dinheiro e companhia' },
  { id: 'comQuem', pt: 'Com quem viaja', en: 'Traveling with', exemplo: 'Alone', grupo: 'Dinheiro e companhia' },
  { id: 'dinheiro', pt: 'Dinheiro que leva', en: 'Money I carry', exemplo: 'About 2,000 dollars and two credit cards', grupo: 'Dinheiro e companhia' },
  { id: 'emergencia', pt: 'Contato de emergência no Brasil', en: 'Emergency contact in Brazil', exemplo: 'Ana Silva, +55 00 00000 0000', tipo: 'tel', grupo: 'Contatos' },
  { id: 'familiarEua', pt: 'Familiar nos EUA (se houver)', en: 'Relative in the U.S.', exemplo: 'Paula Silva, sister, Miami, phone', grupo: 'Contatos' },
  { id: 'empresa', pt: 'Empresa e contato (se trabalho)', en: 'Company and contact', exemplo: 'ABC Inc., Houston, John Smith', grupo: 'Contatos' },
];

const GRUPOS = Array.from(new Set(CAMPOS.map((c) => c.grupo)));

type Dados = Record<string, string>;

function textoDoCartao(d: Dados): string {
  const v = (k: string) => (d[k] ?? '').trim();
  const linhas: string[] = ['MY TRIP', ''];
  const add = (rotulo: string, valor: string) => valor && linhas.push(`${rotulo}: ${valor}`);
  add('Name', v('nome'));
  add('I live in', v('cidade'));
  add('I work as', v('profissao'));
  add('Workplace', v('trabalho'));
  add('Purpose of trip', v('motivo'));
  if (v('chegada') || v('volta')) {
    linhas.push(`Arrival: ${v('chegada') || '-'} | Return: ${v('volta') || '-'}${v('dias') ? ` (${v('dias')})` : ''}`);
  } else add('Length of stay', v('dias'));
  add('Departure flight', v('vooIda'));
  add('Return flight', v('vooVolta'));
  add('Cities', v('cidades'));
  const hotel = [v('hotelNome'), v('hotelEndereco')].filter(Boolean).join(', ');
  add('Hotel', hotel);
  add('Hotel phone', v('hotelTelefone'));
  add('Paying for trip', v('quemPaga'));
  add('Traveling with', v('comQuem'));
  add('Money', v('dinheiro'));
  add('Emergency contact (Brazil)', v('emergencia'));
  add('Relative in the U.S.', v('familiarEua'));
  add('Company and contact', v('empresa'));
  return linhas.join('\n');
}

function TabelaApoio({ titulo, itens, idPrefixo, observacao }: { titulo: string; itens: ItemApoio[]; idPrefixo: string; observacao?: string }) {
  return (
    <details className="group rounded-2xl border border-borda bg-superficie">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-bold">
        {titulo}
        <span aria-hidden="true" className="text-suave transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-dashed border-borda px-4 pb-4">
        {observacao && <p className="mt-3 text-sm text-suave">{observacao}</p>}
        <ul className="mt-1">
          {itens.map((it, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-borda py-2.5 last:border-0">
              <div className="min-w-0">
                <p>
                  <span className="text-sm text-suave">{it.pt} · </span>
                  <strong lang="en">{it.en}</strong>
                </p>
                <p className="text-sm italic text-destaque">🗣️ {it.pronuncia}</p>
              </div>
              <AudioPlayer id={`${idPrefixo}-${i}`} texto={it.en} compacto />
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function BonusCartao() {
  const [dados, setDados] = useLocal<Dados>(CHAVES.cartao, {});
  const [checagem, setChecagem] = useLocal<Record<number, boolean>>(CHAVES.cartaoChecagem, {});
  const [salvoAgora, setSalvoAgora] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const preenchidos = CAMPOS.filter((c) => (dados[c.id] ?? '').trim()).length;
  const texto = textoDoCartao(dados);

  const mudar = (id: string, valor: string) => {
    setDados((a) => ({ ...a, [id]: valor }));
    setSalvoAgora(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSalvoAgora(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Cabecalho
          titulo="Cartão “Minha Viagem em Inglês”"
          sobre={<Etiqueta>Bônus 2</Etiqueta>}
          subtitulo="Preencha uma vez, leve no celular e responda datas, números e nomes sem esquecer."
        />
        <Aviso tom="alerta">
          <strong>Regra de ouro:</strong> os dados do cartão precisam ser iguais aos da passagem e da reserva. Se uma data mudar, atualize o cartão.
        </Aviso>
      </div>

      <form className="space-y-5 print:hidden" onSubmit={(e) => e.preventDefault()} aria-describedby="cartao-ajuda">
        <p id="cartao-ajuda" className="text-sm text-suave">
          Os exemplos em cinza são fictícios. Escreva os seus dados reais. Tudo fica salvo só neste aparelho.{' '}
          <span aria-live="polite" className="font-semibold text-sucesso">
            {salvoAgora ? 'Salvo ✓' : ''}
          </span>
        </p>
        {GRUPOS.map((g) => (
          <Cartao key={g} as="section" cor={g === 'Viagem' ? 'ambar' : 'petroleo'} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="text-lg font-bold">
              {g}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {CAMPOS.filter((c) => c.grupo === g).map((c) => (
                <div key={c.id}>
                  <label htmlFor={`campo-${c.id}`} className="block font-semibold">
                    {c.pt}
                    <span className="ml-1.5 text-sm font-normal text-suave" lang="en">
                      ({c.en})
                    </span>
                  </label>
                  <input
                    id={`campo-${c.id}`}
                    type={c.tipo ?? 'text'}
                    value={dados[c.id] ?? ''}
                    onChange={(e) => mudar(c.id, e.target.value)}
                    placeholder={c.exemplo}
                    autoComplete="off"
                    className="mt-1 min-h-12 w-full rounded-xl border border-borda bg-fundo px-3 text-base text-texto placeholder:text-suave/70"
                  />
                </div>
              ))}
            </div>
          </Cartao>
        ))}
        <Aviso>💡 Não escreva o número do passaporte em mensagens ou prints que você vai compartilhar.</Aviso>
      </form>

      <section aria-labelledby="pronto" className="print:hidden">
        <h2 id="pronto" className="mb-3 text-xl font-bold">
          Seu cartão de bolso
        </h2>
        <Cartao cor="ceu">
          <pre className="whitespace-pre-wrap break-words font-mono text-[0.95rem] leading-relaxed" lang="en">
            {preenchidos ? texto : 'Preencha os campos acima para montar o seu cartão.'}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={estiloBotao.primario} onClick={() => window.print()} disabled={!preenchidos}>
              <IconeImprimir tamanho={18} /> Imprimir / salvar em PDF
            </button>
            <BotaoCopiar texto={texto} rotulo="Copiar como texto" />
          </div>
          <p className="mt-2 text-sm text-suave">Salve também como nota ou print no celular (abre sem internet).</p>
        </Cartao>
      </section>

      {/* Versão de impressão */}
      <section className="hidden print:block" aria-hidden="true">
        <div style={{ border: '2px solid #0B3A5B', borderRadius: 16, padding: 24, maxWidth: 640 }}>
          <div style={{ borderLeft: '8px solid #F5A623', paddingLeft: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#0B3A5B' }}>MY TRIP</p>
            <p style={{ fontSize: 12, color: '#47606F' }}>Imigração EUA sem Travar · Cartão “Minha Viagem em Inglês”</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {CAMPOS.filter((c) => (dados[c.id] ?? '').trim()).map((c) => (
                <tr key={c.id} style={{ borderTop: '1px dashed #9FB3C2' }}>
                  <td style={{ padding: '6px 8px 6px 0', color: '#47606F', width: '42%' }}>
                    {c.en} <span style={{ fontSize: 11 }}>({c.pt})</span>
                  </td>
                  <td style={{ padding: '6px 0', fontWeight: 600 }}>{dados[c.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="apoio" className="space-y-3 print:hidden">
        <h2 id="apoio" className="text-xl font-bold">
          Apoio: como dizer datas, números e mais
        </h2>
        <TabelaApoio titulo="Meses" itens={apoio.meses} idPrefixo="mes" />
        <TabelaApoio titulo="Dias do mês (ordinais)" itens={apoio.ordinais} idPrefixo="ord" observacao={apoio.observacaoOrdinais} />
        <TabelaApoio titulo="Dias da semana" itens={apoio.diasSemana} idPrefixo="sem" />
        <TabelaApoio titulo="Treine as suas datas" itens={apoio.datasTreino} idPrefixo="datas" />
        <TabelaApoio titulo="Números" itens={apoio.numeros} idPrefixo="num" observacao={apoio.observacaoNumeros} />
        <TabelaApoio titulo="Dinheiro em frases" itens={apoio.dinheiro} idPrefixo="din" />
        <TabelaApoio titulo="Parentesco" itens={apoio.parentesco} idPrefixo="par" />
        <TabelaApoio titulo="Profissões" itens={apoio.profissoes} idPrefixo="prof" />
      </section>

      <section aria-labelledby="checagem" className="print:hidden">
        <Cartao cor="sucesso">
          <h2 id="checagem" className="text-xl font-bold">
            Checagem final (2 minutos)
          </h2>
          <ul className="mt-3 space-y-2">
            {apoio.checagemFinal.map((t, i) => {
              const ok = Boolean(checagem[i]);
              return (
                <li key={i}>
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${ok ? 'border-sucesso/50 bg-sucesso/10' : 'border-borda'}`}>
                    <input type="checkbox" className="peer sr-only" checked={ok} onChange={() => setChecagem((a) => ({ ...a, [i]: !a[i] }))} />
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ambar ${ok ? 'border-sucesso bg-sucesso text-white' : 'border-borda'}`}
                    >
                      {ok && <IconeCheck tamanho={18} />}
                    </span>
                    {t}
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-suave">A pronúncia escrita é uma aproximação. Use os áudios para confirmar.</p>
        </Cartao>
      </section>
    </div>
  );
}
