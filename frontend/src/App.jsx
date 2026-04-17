import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MdToDocx from './pages/MdToDocx';
import Laeringsplan from './pages/Laeringsplan';
import RflpViewer from './pages/RflpViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/md-to-docx" element={<MdToDocx />} />
        <Route path="/laeringsplan" element={<Laeringsplan />} />
        <Route path="/rflp-viewer" element={<RflpViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
