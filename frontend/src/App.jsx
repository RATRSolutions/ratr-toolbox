import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RflpViewer from './pages/RflpViewer';
import Laeringsplan from './pages/Laeringsplan';
import MdToDocx from './pages/MdToDocx';

const isRflpOnly = import.meta.env.VITE_APP === 'rflp';

function App() {
  if (isRflpOnly) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RflpViewer />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rflp-viewer" element={<RflpViewer />} />
        <Route path="/laeringsplan" element={<Laeringsplan />} />
        <Route path="/md-to-docx" element={<MdToDocx />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
