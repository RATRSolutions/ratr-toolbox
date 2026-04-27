import { Handle, Position } from '@xyflow/react';
import './HierarchyNodes.css';

export default function LogicalElementNode({ data }) {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="hn-le">
        <div className="hn-le-label">Logical element</div>
        <div className="hn-le-name">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
