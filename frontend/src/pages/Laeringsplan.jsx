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
