import { useMemo, useCallback, useEffect, useState } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, Panel, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildHierarchyGraph } from '../utils/buildHierarchyGraph';
import FunctionNode from './hierarchy/FunctionNode';
import LogicalElementNode from './hierarchy/LogicalElementNode';
import OrthogonalBranchEdge from './hierarchy/OrthogonalBranchEdge';
import HierarchyPrintView from './hierarchy/HierarchyPrintView';
import './FunctionHierarchyView.css';

const nodeTypes = {
  functionNode: FunctionNode,
  logicalElementNode: LogicalElementNode,
};

const edgeTypes = {
  orthogonalBranch: OrthogonalBranchEdge,
};

function HierarchyFlow({ nodes, edges, onSelectFunction, showLogicalElements, onToggleLogicalElements }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const before = () => fitView({ padding: 0.15, duration: 0 });
    window.addEventListener('beforeprint', before);
    return () => window.removeEventListener('beforeprint', before);
  }, [fitView]);

  const handleNodeClick = useCallback(
    (_event, node) => {
      if (node.type === 'functionNode' && onSelectFunction) {
        onSelectFunction(node.data.functionId);
      }
    },
    [onSelectFunction]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#2a2a2a" gap={20} />
      <Controls className="fhv-controls" showInteractive={false} />
      <Panel position="top-right">
        <button
          className={`fhv-le-toggle${showLogicalElements ? ' active' : ''}`}
          onClick={onToggleLogicalElements}
          title={showLogicalElements ? 'Skjul logiske enheter' : 'Vis logiske enheter'}
        >
          {showLogicalElements ? 'Skjul logiske enheter' : 'Vis logiske enheter'}
        </button>
      </Panel>
    </ReactFlow>
  );
}

export default function FunctionHierarchyView({ model, onSelectFunction }) {
  const [showLogicalElements, setShowLogicalElements] = useState(true);
  const { nodes, edges } = useMemo(
    () => buildHierarchyGraph(model, null, showLogicalElements),
    [model, showLogicalElements]
  );

  return (
    <>
      <div className="fhv-container fhv-screen-only">
        <ReactFlowProvider>
          <HierarchyFlow
            nodes={nodes}
            edges={edges}
            onSelectFunction={onSelectFunction}
            showLogicalElements={showLogicalElements}
            onToggleLogicalElements={() => setShowLogicalElements((v) => !v)}
          />
        </ReactFlowProvider>
      </div>

      <div className="fhv-print-only">
        <HierarchyPrintView model={model} showLogicalElements={showLogicalElements} />
      </div>
    </>
  );
}
