import { Link } from 'react-router-dom';
import { estiloBotao } from '../components/Ui';

export function NaoEncontrada() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl" aria-hidden="true">🧳</p>
      <h1 className="mt-4 text-2xl font-extrabold">Página não encontrada</h1>
      <p className="mt-2 text-suave">Parece que esse portão não existe.</p>
      <Link to="/" className={`${estiloBotao.primario} mt-6`}>
        Voltar ao início
      </Link>
    </div>
  );
}
