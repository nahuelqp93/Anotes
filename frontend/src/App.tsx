import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Panel from './pages/Panel';
import Anotes from './pages/Anotes';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/obras/:obraId/anotes" element={<Anotes />} />
    </Routes>
  );
}

export default App;