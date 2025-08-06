import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Panel from './pages/Panel';
import Anotes from './pages/Anotes';
import Resumen from './pages/Resumen';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/obras/:obraId/anotes" element={<Anotes />} />
      <Route path="/obras/:obraId/resumen" element={<Resumen />} />
    </Routes>
  );
}

export default App;