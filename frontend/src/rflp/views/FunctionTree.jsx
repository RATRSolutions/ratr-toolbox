import { useState, useMemo } from 'react';

function normalizeKey(k) {
  return k.toLowerCase().replace(/\s+/g, '');
}

function getNodeStatus(node) {
  if (!node.metadata) return null;
  const key = Object.keys(node.metadata).find((k) => normalizeKey(k) === 'status');
  return key ? node.metadata[key] : null;
}

function nodeOrDescendantMatchesFilter(node, filter) {
  if (!filter) return true;
  if (getNodeStatus(node) === filter) return true;
  return node.children?.some((child) => nodeOrDescendantMatchesFilter(child, filter)) ?? false;
}

function collectStatuses(nodes, result = new Set()) {
  nodes.forEach((node) => {
    const s = getNodeStatus(node);
    if (s) result.add(s);
    if (node.children) collectStatuses(node.children, result);
  });
  return result;
}

function TreeNode({ node, selectedId, onSelect, depth, statusFilter }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const matchesSelf = !statusFilter || getNodeStatus(node) === statusFilter;
  const hasMatchingDescendant =
    !!statusFilter &&
    hasChildren &&
    node.children.some((child) => nodeOrDescendantMatchesFilter(child, statusFilter));
  const isExpanded = expanded || hasMatchingDescendant;
  const dimmed = !!statusFilter && !matchesSelf;

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node${selectedId === node.id ? ' selected' : ''}${dimmed ? ' dimmed' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          className="tree-expand"
          onClick={() => setExpanded((e) => !e)}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          aria-label={isExpanded ? 'Kollaps' : 'Ekspander'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <button className="tree-label" onClick={() => onSelect?.(node.id)}>
          <span className="node-id-tag">{node.id}</span>
          <span>{node.name || node.id}</span>
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              statusFilter={statusFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FunctionTree({ functions = [], selectedId, onSelect, fileName }) {
  const [statusFilter, setStatusFilter] = useState(null);

  const statuses = useMemo(() => [...collectStatuses(functions)].sort(), [functions]);

  return (
    <div className="function-tree">
      <div className="tree-header">
        <span className="tree-header-label">Funksjoner</span>
        {fileName && <span className="tree-header-file">{fileName}</span>}
      </div>
      {statuses.length > 0 && (
        <div className="tree-filter">
          <button
            className={`tree-filter-btn${!statusFilter ? ' active' : ''}`}
            onClick={() => setStatusFilter(null)}
          >
            Alle
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              className={`tree-filter-btn${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
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
            statusFilter={statusFilter}
          />
        ))}
      </div>
    </div>
  );
}

export default FunctionTree;
