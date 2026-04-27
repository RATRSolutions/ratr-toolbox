import { BaseEdge } from '@xyflow/react';

const TRUNK_OFFSET = 40;

export default function OrthogonalBranchEdge({ sourceX, sourceY, targetX, targetY }) {
  const trunkY = sourceY + TRUNK_OFFSET;
  const d = [
    `M ${sourceX} ${sourceY}`,
    `L ${sourceX} ${trunkY}`,
    `L ${targetX} ${trunkY}`,
    `L ${targetX} ${targetY}`,
  ].join(' ');

  return <BaseEdge path={d} />;
}
