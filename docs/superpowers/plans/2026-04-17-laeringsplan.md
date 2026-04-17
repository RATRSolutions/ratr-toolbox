# Læringsplan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Legg til React Router, en forside med verktøykort, og en Læringsplan-side med kollapsbare moduler drevet av eksisterende JSON-data.

**Architecture:** React Router gir hver side sin egen URL. Forsiden (`/`) lister verktøy som klikkbare kort. Læringsplan (`/laeringsplan`) er en statisk side som importerer JSON direkte – ingen API-kall. Komponenter: `Laeringsplan.jsx` (layout + oversikt) → `PhaseBlock.jsx` (én fase) → `ModuleCard.jsx` (kollapsbar modul).

**Tech Stack:** React 18, Vite, react-router-dom v6, Google Fonts (Playfair Display, Source Sans 3, DM Mono)

> **Merk om testing:** Prosjektet har ingen test-oppsett. Verifikasjon gjøres i nettleseren etter hver oppgave. Kjør `npm run dev` i `frontend/` og ha `http://localhost:5173` åpen.

---

## Filstruktur

| Fil | Handling | Ansvar |
|-----|----------|--------|
| `frontend/index.html` | Modifiser | Tittel + Google Fonts |
| `frontend/src/App.jsx` | Modifiser | Router-konfigurasjon |
| `frontend/src/pages/Home.jsx` | Opprett | Forside med verktøykort |
| `frontend/src/pages/Home.css` | Opprett | Styling for forside |
| `frontend/src/pages/Laeringsplan.jsx` | Opprett | Hoved-side for læringsplan |
| `frontend/src/pages/Laeringsplan.css` | Opprett | All styling for læringsplan |
| `frontend/src/components/laeringsplan/PhaseBlock.jsx` | Opprett | Én fase med header og moduler |
| `frontend/src/components/laeringsplan/ModuleCard.jsx` | Opprett | Kollapsbar modul |
| `frontend/src/data/laringsplan.html` | Slett | Midlertidig referansefil |

---

## Task 1: Installer react-router-dom og oppdater index.html

**Files:**
- Modify: `frontend/index.html`

- [ ] **Steg 1: Installer react-router-dom**

```bash
cd frontend && npm install react-router-dom
```

Forventet: `added X packages` uten feil.

- [ ] **Steg 2: Oppdater index.html med tittel og Google Fonts**

Erstatt innholdet i `frontend/index.html` med:

```html
<!doctype html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verktøykasse – ratr solutions</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&family=DM+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Steg 3: Verifiser i nettleseren**

Åpne `http://localhost:5173`. Sjekk at fanen viser «Verktøykasse – ratr solutions» og at md-to-docx-siden fortsatt fungerer.

- [ ] **Steg 4: Commit**

```bash
git add frontend/index.html frontend/package.json frontend/package-lock.json
git commit -m "feat: install react-router-dom and update index.html"
```

---

## Task 2: Routing + forside

**Files:**
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/pages/Home.jsx`
- Create: `frontend/src/pages/Home.css`

- [ ] **Steg 1: Skriv `Home.jsx`**

Opprett `frontend/src/pages/Home.jsx`:

```jsx
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
```

- [ ] **Steg 2: Skriv `Home.css`**

Opprett `frontend/src/pages/Home.css`:

```css
.home {
  min-height: 100vh;
  background: #1a1a1a;
  color: #f5f3f0;
  font-family: 'Source Sans 3', Calibri, sans-serif;
  padding: 64px 64px 96px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #c97a1a;
  margin-bottom: 12px;
}

.home h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #f5f3f0;
  margin-bottom: 48px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.tool-card {
  background: #242424;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 24px;
  text-decoration: none;
  color: #f5f3f0;
  transition: border-color 0.15s, background 0.15s;
  display: block;
}

.tool-card:hover {
  background: #2c2c2c;
  border-color: #c97a1a;
}

.tool-card h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 8px;
  color: #f5f3f0;
}

.tool-card p {
  font-size: 14px;
  color: #8a8a8a;
  line-height: 1.5;
}
```

- [ ] **Steg 3: Oppdater `App.jsx` med routing**

Erstatt innholdet i `frontend/src/App.jsx` med:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MdToDocx from './pages/MdToDocx';
import Laeringsplan from './pages/Laeringsplan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/md-to-docx" element={<MdToDocx />} />
        <Route path="/laeringsplan" element={<Laeringsplan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

> `Laeringsplan` finnes ikke ennå – Vite vil vise kompileringsfeil til den er opprettet. Det er forventet.

- [ ] **Steg 4: Verifiser i nettleseren**

Gå til `http://localhost:5173`. Du skal se forsiden med to verktøykort. Klikk på «md-to-docx» – du skal komme til konverteringsverktøyet. Trykk tilbake.

- [ ] **Steg 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/pages/Home.jsx frontend/src/pages/Home.css
git commit -m "feat: add routing and Home page with tool cards"
```

---

## Task 3: CSS for Læringsplan

**Files:**
- Create: `frontend/src/pages/Laeringsplan.css`

- [ ] **Steg 1: Opprett `Laeringsplan.css`**

Opprett `frontend/src/pages/Laeringsplan.css`:

```css
/* ── Reset og base ─────────────────────────────── */
.laeringsplan {
  background: #1a1a1a;
  color: #f5f3f0;
  font-family: 'Source Sans 3', Calibri, sans-serif;
  min-height: 100vh;
}

/* ── Header ────────────────────────────────────── */
.lp-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding: 48px 64px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.lp-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #a78bfa;
  margin-bottom: 16px;
}

.lp-header h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  color: #f5f3f0;
  margin-bottom: 24px;
}

.lp-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.lp-stat {
  font-size: 13px;
  color: #8a8a8a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  flex-shrink: 0;
}

.lp-stat.p2 .stat-dot { background: #34d399; }
.lp-stat.p3 .stat-dot { background: #fbbf24; }
.lp-stat.new .stat-dot { background: #22d3ee; }

/* ── Oversiktsgrid ─────────────────────────────── */
.lp-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.07);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  max-width: 900px;
  margin: 32px auto;
}

.ov-card {
  background: #1e1e1e;
  padding: 20px 24px;
  cursor: pointer;
  text-align: left;
  border: none;
  color: #f5f3f0;
  transition: background 0.15s;
}

.ov-card:hover {
  background: #262626;
}

.ov-phase {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.ov-card.p1 .ov-phase { color: #a78bfa; }
.ov-card.p2 .ov-phase { color: #34d399; }
.ov-card.p3 .ov-phase { color: #fbbf24; }
.ov-card.p4 .ov-phase { color: #f87171; }

.ov-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ov-dur {
  font-size: 12px;
  color: #5e5c57;
}

/* ── Hoved-innhold ─────────────────────────────── */
.lp-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 64px 96px;
}

/* ── Fase-blokk ────────────────────────────────── */
.phase-block {
  margin-bottom: 48px;
}

.phase-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: none;
}

.phase-number {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  opacity: 0.15;
  flex-shrink: 0;
  margin-top: -4px;
}

.phase-header-content {
  flex: 1;
}

.phase-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.phase-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 400;
  margin-bottom: 8px;
}

.phase-duration {
  display: inline-block;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 99px;
  margin-bottom: 16px;
}

.phase-goal {
  font-size: 14px;
  line-height: 1.65;
  border-left: 2px solid;
  padding-left: 16px;
  margin-top: 12px;
}

/* Fasefarger */
.phase-block.p1 .phase-header { background: linear-gradient(135deg, #13111f 0%, #1a1630 100%); }
.phase-block.p1 .phase-number,
.phase-block.p1 .phase-eyebrow { color: #a78bfa; }
.phase-block.p1 .phase-title { color: #c4b5fd; }
.phase-block.p1 .phase-duration { background: rgba(167,139,250,0.1); color: #a78bfa; border: 1px solid rgba(167,139,250,0.2); }
.phase-block.p1 .phase-goal { color: #a78bfa; border-color: #a78bfa; }

.phase-block.p2 .phase-header { background: linear-gradient(135deg, #111a17 0%, #142820 100%); }
.phase-block.p2 .phase-number,
.phase-block.p2 .phase-eyebrow { color: #34d399; }
.phase-block.p2 .phase-title { color: #6ee7b7; }
.phase-block.p2 .phase-duration { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
.phase-block.p2 .phase-goal { color: #34d399; border-color: #34d399; }

.phase-block.p3 .phase-header { background: linear-gradient(135deg, #1a1710 0%, #261f0e 100%); }
.phase-block.p3 .phase-number,
.phase-block.p3 .phase-eyebrow { color: #fbbf24; }
.phase-block.p3 .phase-title { color: #fcd34d; }
.phase-block.p3 .phase-duration { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.phase-block.p3 .phase-goal { color: #fbbf24; border-color: #fbbf24; }

.phase-block.p4 .phase-header { background: linear-gradient(135deg, #1a1111 0%, #261414 100%); }
.phase-block.p4 .phase-number,
.phase-block.p4 .phase-eyebrow { color: #f87171; }
.phase-block.p4 .phase-title { color: #fca5a5; }
.phase-block.p4 .phase-duration { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
.phase-block.p4 .phase-goal { color: #f87171; border-color: #f87171; }

/* ── Modul-container ───────────────────────────── */
.phase-modules {
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-top: none;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
}

/* ── ModuleCard ────────────────────────────────── */
.module-card {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.module-card:last-child {
  border-bottom: none;
}

.module-toggle {
  width: 100%;
  background: #1e1e1e;
  border: none;
  color: #f5f3f0;
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  transition: background 0.15s;
}

.module-toggle:hover {
  background: #242424;
}

.module-toggle-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.module-num {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #5e5c57;
}

.badge-new {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  background: rgba(34,211,238,0.1);
  color: #22d3ee;
  border: 1px solid rgba(34,211,238,0.25);
  border-radius: 4px;
  padding: 2px 6px;
  text-transform: uppercase;
}

.module-title {
  font-size: 15px;
  font-weight: 600;
  color: #f5f3f0;
}

.module-toggle-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.module-duration {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #5e5c57;
}

.chevron {
  font-size: 18px;
  color: #5e5c57;
  transition: transform 0.2s;
  display: inline-block;
}

.chevron.open {
  transform: rotate(90deg);
}

/* ── Modul-innhold ─────────────────────────────── */
.module-body {
  background: #1a1a1a;
  padding: 24px 24px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.module-subtitle {
  font-size: 13px;
  color: #8a8a8a;
  margin-bottom: 12px;
  font-style: italic;
}

.module-goal {
  font-size: 14px;
  color: #c8c5bf;
  line-height: 1.65;
  margin-bottom: 24px;
}

.module-section {
  margin-top: 20px;
}

.module-section h4 {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c97a1a;
  margin-bottom: 12px;
}

.module-section ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-section ul li {
  font-size: 14px;
  line-height: 1.55;
  color: #c8c5bf;
}

.topic-note,
.resource-note {
  color: #8a8a8a;
}

.tag {
  display: inline-block;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
  vertical-align: middle;
}

.tag-free {
  background: rgba(46,125,79,0.15);
  color: #2e7d4f;
  border: 1px solid rgba(46,125,79,0.3);
}

.tag-tool {
  background: rgba(30,111,168,0.15);
  color: #1e6fa8;
  border: 1px solid rgba(30,111,168,0.3);
}

.module-section a {
  color: #1e6fa8;
  text-decoration: none;
}

.module-section a:hover {
  text-decoration: underline;
}

.exercise {
  background: #242424;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
}

.exercise strong {
  display: block;
  font-size: 14px;
  color: #f5f3f0;
  margin-bottom: 6px;
}

.exercise p {
  font-size: 13px;
  color: #8a8a8a;
  line-height: 1.6;
}

.milestone {
  margin-top: 20px;
  background: rgba(201,122,26,0.08);
  border: 1px solid rgba(201,122,26,0.2);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  color: #c8c5bf;
  line-height: 1.6;
}

.milestone strong {
  color: #c97a1a;
  display: block;
  margin-bottom: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.judgement {
  margin-top: 20px;
  background: #242424;
  border-left: 3px solid #c97a1a;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  font-size: 14px;
  color: #8a8a8a;
  line-height: 1.6;
}

.judgement strong {
  display: block;
  color: #f5f3f0;
  margin-bottom: 6px;
}

.specialization {
  background: #242424;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.specialization strong {
  display: block;
  font-size: 14px;
  color: #f5f3f0;
  margin-bottom: 4px;
}

.specialization p {
  font-size: 13px;
  color: #8a8a8a;
  line-height: 1.55;
}

.spec-rec {
  margin-top: 12px;
  font-size: 13px;
  color: #8a8a8a;
  font-style: italic;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .lp-header,
  .lp-main {
    padding-left: 24px;
    padding-right: 24px;
  }

  .home {
    padding: 32px 24px 64px;
  }
}
```

- [ ] **Steg 2: Commit**

```bash
git add frontend/src/pages/Laeringsplan.css
git commit -m "feat: add Laeringsplan CSS with brand styling"
```

---

## Task 4: ModuleCard-komponent

**Files:**
- Create: `frontend/src/components/laeringsplan/ModuleCard.jsx`

- [ ] **Steg 1: Opprett mappestruktur**

```bash
mkdir -p frontend/src/components/laeringsplan
```

- [ ] **Steg 2: Skriv `ModuleCard.jsx`**

Opprett `frontend/src/components/laeringsplan/ModuleCard.jsx`:

```jsx
import { useState } from 'react';

function ModuleCard({ module }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="module-card">
      <button className="module-toggle" onClick={() => setOpen((o) => !o)}>
        <div className="module-toggle-left">
          <span className="module-num">Modul {module.number}</span>
          {module.isNew && <span className="badge-new">NY</span>}
          <span className="module-title">{module.title}</span>
        </div>
        <div className="module-toggle-right">
          {module.duration && (
            <span className="module-duration">{module.duration}</span>
          )}
          <span className={`chevron${open ? ' open' : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="module-body">
          {module.subtitle && (
            <p className="module-subtitle">{module.subtitle}</p>
          )}
          {module.goal && (
            <p className="module-goal">{module.goal}</p>
          )}

          {module.topics?.length > 0 && (
            <section className="module-section">
              <h4>Emner</h4>
              <ul>
                {module.topics.map((topic, i) => (
                  <li key={i}>
                    <strong>{topic.text}</strong>
                    {topic.note && (
                      <span className="topic-note"> — {topic.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {module.resources?.length > 0 && (
            <section className="module-section">
              <h4>Ressurser</h4>
              <ul>
                {module.resources.map((r, i) => (
                  <li key={i}>
                    <span className={`tag tag-${r.tagType}`}>{r.tag}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      {r.title}
                    </a>
                    {r.note && (
                      <span className="resource-note"> — {r.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {module.exercises?.length > 0 && (
            <section className="module-section">
              <h4>Øvelser</h4>
              {module.exercises.map((ex, i) => (
                <div key={i} className="exercise">
                  <strong>{ex.title}</strong>
                  <p>{ex.desc}</p>
                </div>
              ))}
            </section>
          )}

          {module.milestone && (
            <div className="milestone">
              <strong>Milepæl</strong>
              {module.milestone}
            </div>
          )}

          {module.judgement && (
            <div className="judgement">
              <strong>{module.judgement.title}</strong>
              {module.judgement.text}
            </div>
          )}

          {module.specializations?.length > 0 && (
            <section className="module-section">
              <h4>Spesialiseringsretninger</h4>
              {module.specializations.map((s, i) => (
                <div key={i} className="specialization">
                  <strong>{s.title}</strong>
                  <p>{s.note}</p>
                </div>
              ))}
              {module.specializationRec && (
                <p className="spec-rec">{module.specializationRec}</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default ModuleCard;
```

- [ ] **Steg 3: Commit**

```bash
git add frontend/src/components/laeringsplan/ModuleCard.jsx
git commit -m "feat: add ModuleCard collapsible component"
```

---

## Task 5: PhaseBlock-komponent

**Files:**
- Create: `frontend/src/components/laeringsplan/PhaseBlock.jsx`

- [ ] **Steg 1: Skriv `PhaseBlock.jsx`**

Opprett `frontend/src/components/laeringsplan/PhaseBlock.jsx`:

```jsx
import ModuleCard from './ModuleCard';

function PhaseBlock({ phase }) {
  return (
    <section className={`phase-block ${phase.colorClass}`} id={phase.id}>
      <div className="phase-header">
        <span className="phase-number">{phase.number}</span>
        <div className="phase-header-content">
          <p className="phase-eyebrow">{phase.eyebrow}</p>
          <h2 className="phase-title">{phase.title}</h2>
          {phase.duration && (
            <span className="phase-duration">{phase.duration}</span>
          )}
          {/* goal kan inneholde <strong>-tagger fra JSON */}
          <p
            className="phase-goal"
            dangerouslySetInnerHTML={{ __html: phase.goal }}
          />
        </div>
      </div>
      <div className="phase-modules">
        {phase.modules.map((module) => (
          <ModuleCard key={module.number} module={module} />
        ))}
      </div>
    </section>
  );
}

export default PhaseBlock;
```

> `dangerouslySetInnerHTML` er trygt her fordi innholdet kommer fra en statisk JSON-fil vi selv kontrollerer.

- [ ] **Steg 2: Commit**

```bash
git add frontend/src/components/laeringsplan/PhaseBlock.jsx
git commit -m "feat: add PhaseBlock component"
```

---

## Task 6: Laeringsplan-side

**Files:**
- Create: `frontend/src/pages/Laeringsplan.jsx`

- [ ] **Steg 1: Skriv `Laeringsplan.jsx`**

Opprett `frontend/src/pages/Laeringsplan.jsx`:

```jsx
import data from '../data/laringsplan.json';
import PhaseBlock from '../components/laeringsplan/PhaseBlock';
import './Laeringsplan.css';

function Laeringsplan() {
  function scrollToPhase(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="laeringsplan">
      <header className="lp-header">
        <p className="lp-eyebrow">{data.meta.eyebrow}</p>
        <h1>{data.meta.title}</h1>
        <div className="lp-stats">
          {data.meta.stats.map((stat, i) => (
            <span key={i} className={`lp-stat${stat.color ? ` ${stat.color}` : ''}`}>
              <span className="stat-dot" />
              {stat.label}
            </span>
          ))}
        </div>
      </header>

      <nav className="lp-overview">
        {data.phases.map((phase) => (
          <button
            key={phase.id}
            className={`ov-card ${phase.colorClass}`}
            onClick={() => scrollToPhase(phase.id)}
          >
            <p className="ov-phase">{phase.eyebrow}</p>
            <p className="ov-title">{phase.title}</p>
            {phase.duration && <p className="ov-dur">{phase.duration}</p>}
          </button>
        ))}
      </nav>

      <main className="lp-main">
        {data.phases.map((phase) => (
          <PhaseBlock key={phase.id} phase={phase} />
        ))}
      </main>
    </div>
  );
}

export default Laeringsplan;
```

- [ ] **Steg 2: Verifiser i nettleseren**

Gå til `http://localhost:5173/laeringsplan`. Sjekk:
- Header vises med tittel og stats-badges
- Oversiktsgrid viser fire fasekort
- Klikk på et fasekort – siden scroller til riktig fase
- Fasene vises med riktige fargetemaer (lilla, grønn, gul, rød)
- Klikk på en modul – innholdet ekspanderer
- Klikk igjen – innholdet kollapser
- Emner, ressurser og øvelser vises korrekt
- «NY»-badge vises på nye moduler
- Lenker i ressurser åpner i ny fane

- [ ] **Steg 3: Commit**

```bash
git add frontend/src/pages/Laeringsplan.jsx
git commit -m "feat: add Laeringsplan page"
```

---

## Task 7: Rydding og slutt-verifisering

**Files:**
- Delete: `frontend/src/data/laringsplan.html`

- [ ] **Steg 1: Slett midlertidig HTML-referansefil**

```bash
rm frontend/src/data/laringsplan.html
```

- [ ] **Steg 2: Full gjennomgang i nettleseren**

Sjekk disse scenariene:
1. `http://localhost:5173/` → forside med to verktøykort
2. Klikk «md-to-docx» → konverteringsverktøy fungerer som før
3. Trykk tilbake → forside igjen
4. Klikk «Læringsplan» → læringsplan-siden
5. Alle fire fasekort i oversiktsgrid scroller til riktig fase
6. Minst én modul per fase: åpne og lukk
7. Ressurser-lenker åpner i ny fane

- [ ] **Steg 3: Commit**

```bash
git add -A
git commit -m "chore: remove temporary HTML reference file"
```
