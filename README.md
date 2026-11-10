# Imigração EUA sem Travar: Respostas Prontas em Inglês (com áudio)

Área de membros do **plano Completo**. Todo o conteúdo fica aberto para quem tiver o endereço: não há login, cadastro, banco de dados nem controle de planos.

Feito com Vite + React + TypeScript + Tailwind CSS + React Router. O único código de servidor é a função do chat **Aero** (`api/aero.ts`).

---

## 1. Instalar e rodar no VS Code

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais novo.

1. Abra a pasta do projeto no VS Code (**Arquivo → Abrir pasta**).
2. Abra o terminal (**Terminal → Novo terminal**) e instale as dependências:

   ```bash
   npm install
   ```

3. Rode o site:

   ```bash
   npm run dev
   ```

4. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

Para testar o chat no seu computador, crie um arquivo `.env` na raiz (copie o `.env.example`) e coloque sua chave:

```
AI_API_KEY=sua-chave-aqui
```

Pare o servidor (Ctrl + C) e rode `npm run dev` de novo. Sem a chave, o site funciona normalmente e o chat mostra "O Aero está indisponível no momento".

Outros comandos:

| Comando | Para que serve |
| --- | --- |
| `npm run build` | Gera a versão final na pasta `dist` (e confere erros de TypeScript) |
| `npm run preview` | Abre a versão final localmente (o chat não roda aqui) |

---

## 2. Onde fica cada coisa

```
content/            ← TEXTOS do site (edite aqui, sem mexer na interface)
  perguntas.json      As 30 perguntas (P01 a P30) e as respostas
  resgate.json        As 6 frases de resgate
  checklist.json      Os 3 grupos do checklist
  pronuncia.json      Bônus 1 – Leia como se fala (já completo, do PDF do Bônus 1)
  apoio.json          Bônus 2 – meses, ordinais, números, parentesco, profissões, checagem final
  deslizes.json       Bônus 3 – Os 10 deslizes
  downloads.json      Lista de PDFs da página Downloads
public/audio/       ← MP3 (P01.mp3 … P30.mp3, R01-1.mp3 …, RES-1.mp3 … RES-6.mp3)
public/pdf/         ← PDFs para baixar
api/aero.ts         ← Função do chat Aero (servidor)
src/                ← Código da interface
```

### 2.1 Perguntas (`content/perguntas.json`)

Já vêm P01, P02 e P03 completas como exemplo. Cole as demais no mesmo formato, dentro da lista `[ ... ]`, separadas por vírgula:

```json
{
  "codigo": "P04",
  "bloco": "B",
  "pt": "Onde você vai ficar?",
  "en": "Where will you be staying?",
  "audio": "P04.mp3",
  "pronuncia": "uér uíl iú bi STÊI-ing?",
  "dica": "Diga o nome da hospedagem igual ao da reserva.",
  "cenarios": {
    "hotel": [
      { "nivel": 1, "en": "At a hotel.", "pt": "Num hotel.", "audio": "R04-1.mp3", "pronuncia": "ét a rrôu-TÉL" },
      { "nivel": 2, "en": "...", "pt": "...", "audio": "R04-2.mp3", "pronuncia": "..." },
      { "nivel": 3, "en": "...", "pt": "...", "audio": "R04-3.mp3", "pronuncia": "..." }
    ],
    "familia": [ ... ]
  }
}
```

- **bloco**: `A` Abertura · `B` Sobre a viagem · `C` Quem é você · `D` Dinheiro/bagagem/alfândega · `E` Perguntas extras.
- **cenarios**: cada chave vira uma aba. Use `turismo`, `familia`, `trabalho`, `hotel`, `eu`, `empresa`. Se a pergunta tem uma versão só, use a chave `unico` (aparece sem abas).
- **nivel**: 1 (curta), 2 (completa), 3 (segurança). `pt` e `pronuncia` são opcionais.
- A ordem no site segue o código (P01, P02…), não importa a ordem no arquivo.
- Dica: depois de colar, rode `npm run build`. Se tiver vírgula ou aspas faltando, o erro mostra a linha.

### 2.2 Áudios (`public/audio`)

Coloque os MP3 com estes nomes exatos:

- Pergunta do oficial: `P01.mp3` … `P30.mp3`
- Respostas: `R01-1.mp3`, `R01-2.mp3`, `R01-3.mp3` … (no P02, os cenários seguem a numeração do guia: turismo `R02-1` a `R02-3`, família `R02-4` a `R02-6`, trabalho `R02-7` a `R02-9`)
- Resgate: `RES-1.mp3` … `RES-6.mp3`

O nome usado é o que estiver no campo `"audio"` do JSON. **Se um MP3 não existir, o site usa a voz em inglês do próprio navegador**, sem mostrar erro. Ao adicionar arquivos com o `npm run dev` rodando, a página recarrega sozinha.

### 2.3 PDFs (`public/pdf`)

Já estão na pasta os PDFs dos Bônus 1, 2, 3, 5 e a Cola de Bolso. Falta o guia principal: salve-o como `public/pdf/guia-principal.pdf`. Enquanto um arquivo não existir, a página Downloads mostra "Em breve". Para adicionar outro PDF, coloque o arquivo na pasta e inclua uma linha em `content/downloads.json`.

---

## 3. Subir para o GitHub

1. Crie um repositório novo (privado é o ideal) em https://github.com/new, **sem** README.
2. No terminal do VS Code, dentro da pasta do projeto:

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "Área de membros Imigração EUA sem Travar"
   ```

   ```bash
   git branch -M main
   ```

   ```bash
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   ```

   ```bash
   git push -u origin main
   ```

O `.gitignore` já impede que `node_modules`, `dist` e o `.env` (com a sua chave) subam.

Também dá para fazer pelo VS Code: ícone **Controle do código-fonte → Publicar no GitHub**.

---

## 4. Publicar na Vercel (recomendado)

1. Entre em https://vercel.com com a sua conta do GitHub.
2. **Add New → Project** e escolha o repositório.
3. A Vercel reconhece o Vite sozinha (o `vercel.json` já está pronto). Não mude nada.
4. Em **Environment Variables**, cadastre:
   - Nome: `AI_API_KEY` · Valor: a sua chave da IA
5. Clique em **Deploy**.

Toda vez que você fizer `git push`, a Vercel publica a nova versão.
Se cadastrar ou trocar a chave depois, vá em **Deployments → … → Redeploy** para valer.

**Sobre a IA do chat:** a função usa a API da Anthropic (Claude). Crie a chave em https://console.anthropic.com. O modelo padrão é `claude-opus-5-5`. Para trocar (por exemplo, por um mais barato como `claude-haiku-5-5`), cadastre também a variável opcional `AI_MODEL` com o nome do modelo.

### Por que não GitHub Pages?

O GitHub Pages só hospeda arquivos estáticos: o site abre, mas **o chat Aero não funciona**, porque ele precisa de uma função de servidor para guardar a chave da IA em segredo. Por isso o recomendado é Vercel (ou Netlify).

### Netlify (alternativa)

O projeto já tem `netlify.toml` e `netlify/functions/aero.mts` (reaproveita o mesmo código do chat). Em https://app.netlify.com: **Add new site → Import an existing project**, escolha o repositório e, em **Site configuration → Environment variables**, cadastre `AI_API_KEY`.

---

## 5. Como o site funciona

- **Progresso, checklist, Cartão, respostas do Gerador e preferências** ficam salvos no navegador (localStorage) de quem usa. Trocar de aparelho ou limpar os dados do navegador apaga o progresso.
- **Chat Aero**: limite de 30 mensagens por dia por navegador e por IP, mensagens de até 500 caracteres. O limite por IP fica na memória da função e zera quando a Vercel reinicia a função (é uma proteção simples, não um controle rígido). O chat recebe só as 3 perguntas de `perguntas.json` mais parecidas com a dúvida.
- **noindex**: todas as páginas têm `<meta name="robots" content="noindex">`, o cabeçalho `X-Robots-Tag` e `robots.txt` bloqueando buscadores.
- **Visual**: as cores ficam em `src/index.css` (azul-petróleo `#0B3A5B`, azul-céu `#7CC4F5`, âmbar `#F5A623`, branco gelo `#F4F7F8`), com modo claro e escuro automáticos.
- **Nenhuma chave ou senha** está no código. A chave existe só no `.env` local (que não sobe) e nas variáveis de ambiente da hospedagem.

Suporte: contato.partiueua2027@gmail.com
