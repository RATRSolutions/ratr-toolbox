import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const tools = [
  {
    id: 'md-to-docx',
    title: 'md-to-docx',
    description: 'Konverter et Markdown-dokument til Word med en mal.',
    path: '/md-to-docx',
  },
  {
    id: 'rflp-viewer',
    title: 'RFLP Viewer',
    description: 'Naviger og presenter RFLP-databaser fra Excel.',
    path: '/rflp-viewer',
  },
];

const menuItems = [];

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="hamburger-wrapper" ref={ref}>
      <button
        className={`hamburger-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Meny"
      >
        <span /><span /><span />
      </button>
      {open && (
        <nav className="hamburger-menu">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="hamburger-item"
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-text">
          <p className="home-eyebrow">ratr solutions</p>
          <h1>Verktøykasse</h1>
        </div>
        <HamburgerMenu />
      </header>
      <main className="home-grid">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.path} className="tool-card">
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

export default Home;
