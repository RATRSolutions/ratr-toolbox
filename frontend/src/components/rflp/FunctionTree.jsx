import { useState } from 'react';

function TreeNode({ node, selectedId, onSelect, depth }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node${selectedId === node.id ? ' selected' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          className="tree-expand"
          onClick={() => setExpanded((e) => !e)}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          aria-label={expanded ? 'Kollaps' : 'Ekspander'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <button className="tree-label" onClick={() => onSelect(node.id)}>
          {node.name || node.id}
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FunctionTree({ functions, selectedId, onSelect, fileName }) {
  return (
    <div className="function-tree">
      <div className="tree-header">
        <span className="tree-header-label">Funksjoner</span>
        {fileName && <span className="tree-header-file">{fileName}</span>}
      </div>
      <div className="tree-body">
        {functions.length === 0 && (
          <p className="tree-empty">Ingen funksjoner funnet.</p>
        )}
        {functions.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

export default FunctionTree;
