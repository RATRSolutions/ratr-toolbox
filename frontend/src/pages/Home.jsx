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
    id: 'laeringsplan',
    title: 'Læringsplan',
    description: 'Veikart for AI-assistert softwareutvikling.',
    path: '/laeringsplan',
  },
  {
    id: 'rflp-viewer',
    title: 'RFLP Viewer',
    description: 'Naviger og presenter RFLP-databaser fra Excel.',
    path: '/rflp-viewer',
  },
];

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <p className="home-eyebrow">ratr solutions</p>
        <h1>Verktøykasse</h1>
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
