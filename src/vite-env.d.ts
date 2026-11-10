/// <reference types="vite/client" />

declare module 'virtual:arquivos-publicos' {
  const arquivos: { audio: string[]; pdf: string[] };
  export default arquivos;
}
