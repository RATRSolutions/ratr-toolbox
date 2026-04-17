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
