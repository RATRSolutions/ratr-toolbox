import { Handle, Position } from '@xyflow/react';
import './HierarchyNodes.css';

export default function FunctionNode({ data }) {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="hn-func">
        <div className="hn-func-id">{data.functionId}</div>
        <div className="hn-func-name">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
