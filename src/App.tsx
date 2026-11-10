import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Inicio } from './pages/Inicio';
import { Perguntas } from './pages/Perguntas';
import { PerguntaDetalhe } from './pages/PerguntaDetalhe';
import { Resgate } from './pages/Resgate';
import { Checklist } from './pages/Checklist';
import { Treino } from './pages/Treino';
import { Downloads } from './pages/Downloads';
import { Mais } from './pages/Mais';
import { NaoEncontrada } from './pages/NaoEncontrada';
import { BonusPronuncia } from './pages/bonus/Pronuncia';
import { BonusCartao } from './pages/bonus/Cartao';
import { BonusDeslizes } from './pages/bonus/Deslizes';
import { BonusGerador } from './pages/bonus/Gerador';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/perguntas" element={<Perguntas />} />
        <Route path="/perguntas/:codigo" element={<PerguntaDetalhe />} />
        <Route path="/resgate" element={<Resgate />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/treino" element={<Treino />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/mais" element={<Mais />} />
        <Route path="/bonus/pronuncia" element={<BonusPronuncia />} />
        <Route path="/bonus/cartao" element={<BonusCartao />} />
        <Route path="/bonus/deslizes" element={<BonusDeslizes />} />
        <Route path="/bonus/gerador" element={<BonusGerador />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </Layout>
  );
}
