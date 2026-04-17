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
