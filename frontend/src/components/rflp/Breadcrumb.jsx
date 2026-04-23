// path: [{id, name}, ...] from root to current function (inclusive)
function Breadcrumb({ path, onSelect }) {
  if (!path || path.length <= 1) return null;

  return (
    <nav className="breadcrumb">
      {path.map((item, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={item.id} className="breadcrumb-item">
            {i > 0 && <span className="breadcrumb-sep">›</span>}
            {isLast ? (
              <span className="breadcrumb-current">{item.id}</span>
            ) : (
              <button className="breadcrumb-link" onClick={() => onSelect?.(item.id)}>
                {item.id}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
