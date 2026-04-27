import { getLeLabel } from '../../utils/buildHierarchyGraph';
import './HierarchyPrintView.css';

function FunctionBlock({ node, model, depth, showLogicalElements }) {
  const funcData = model.getFunction(node.id);
  const les = showLogicalElements && funcData
    ? funcData.conceptDecisions.flatMap((cd) => cd._logicalElements)
    : [];

  return (
    <div className={`hpv-func${depth === 0 ? ' hpv-func--root' : ''}`}>
      <div className="hpv-func-header">
        <span className="hpv-func-id">{node.id}</span>
        <span className="hpv-func-name">{node.name}</span>
      </div>

      {les.map((le, i) => (
        <div key={i} className="hpv-le">
          <span className="hpv-le-label">Logisk enhet</span>
          <span className="hpv-le-name">{getLeLabel(le)}</span>
        </div>
      ))}

      {node.children.length > 0 && (
        <div className="hpv-children">
          {node.children.map((child) => (
            <FunctionBlock
              key={child.id}
              node={child}
              model={model}
              depth={depth + 1}
              showLogicalElements={showLogicalElements}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyPrintView({ model, showLogicalElements }) {
  const roots = model.getFunctionTree();

  return (
    <div className="hpv-root">
      {roots.map((root) => (
        <FunctionBlock
          key={root.id}
          node={root}
          model={model}
          depth={0}
          showLogicalElements={showLogicalElements}
        />
      ))}
    </div>
  );
}
