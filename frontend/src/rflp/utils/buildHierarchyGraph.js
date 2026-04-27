const NODE_WIDTH = 200;
const FUNC_HEIGHT = 50;
const LE_HEIGHT = 40;
const H_SPACING = 60;
const V_FUNC_TO_LE = 50;   // tight: function and LE feel like one unit
const V_LE_TO_CHILD = 110; // generous: clear separation before children
const ROW_HEIGHT = FUNC_HEIGHT + V_FUNC_TO_LE + LE_HEIGHT + V_LE_TO_CHILD; // 250

function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

export function getLeLabel(le) {
  const candidates = ['logicalname', 'name', 'title', 'description'];
  for (const c of candidates) {
    const key = Object.keys(le).find((k) => nk(k) === c);
    if (key && le[key]) return String(le[key]);
  }
  const idKey = Object.keys(le).find((k) => nk(k) === 'logicalid');
  return idKey ? String(le[idKey] ?? 'LE') : 'LE';
}

function countLeaves(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
}

function layoutSubtree(node, model, nodes, edges, depth, xCenter, showLogicalElements) {
  const funcNodeId = `func-${node.id}`;

  nodes.push({
    id: funcNodeId,
    type: 'functionNode',
    position: { x: xCenter - NODE_WIDTH / 2, y: depth * ROW_HEIGHT },
    data: { label: node.name, functionId: node.id, depth },
  });

  const funcData = model.getFunction(node.id);
  const les = showLogicalElements && funcData
    ? funcData.conceptDecisions.flatMap((cd) => cd._logicalElements)
    : [];

  // Place LE node(s) below the function; spread horizontally if multiple
  const yLe = depth * ROW_HEIGHT + FUNC_HEIGHT + V_FUNC_TO_LE;
  les.forEach((le, i) => {
    const leNodeId = `le-${node.id}-${i}`;
    const xOffset = les.length > 1 ? (i - (les.length - 1) / 2) * (NODE_WIDTH + 20) : 0;

    nodes.push({
      id: leNodeId,
      type: 'logicalElementNode',
      position: { x: xCenter + xOffset - NODE_WIDTH / 2, y: yLe },
      data: { label: getLeLabel(le), depth },
    });

    edges.push({
      id: `e-${funcNodeId}-${leNodeId}`,
      source: funcNodeId,
      target: leNodeId,
      type: 'smoothstep',
    });
  });

  if (!node.children || node.children.length === 0) return;

  // Edges to children originate from the LE bottom (if one exists) so all
  // child-lines emerge from one central point before branching out.
  const childEdgeSource = les.length > 0 ? `le-${node.id}-0` : funcNodeId;

  const leafCounts = node.children.map(countLeaves);
  const totalLeaves = leafCounts.reduce((a, b) => a + b, 0);
  const totalWidth = totalLeaves * NODE_WIDTH + (totalLeaves - 1) * H_SPACING;

  let xCursor = xCenter - totalWidth / 2;
  node.children.forEach((child, i) => {
    const childWidth = leafCounts[i] * NODE_WIDTH + (leafCounts[i] - 1) * H_SPACING;
    const childCenter = xCursor + childWidth / 2;

    layoutSubtree(child, model, nodes, edges, depth + 1, childCenter, showLogicalElements);

    edges.push({
      id: `e-${childEdgeSource}-func-${child.id}`,
      source: childEdgeSource,
      target: `func-${child.id}`,
      type: 'orthogonalBranch',
    });

    xCursor += childWidth + H_SPACING;
  });
}

export function buildHierarchyGraph(model, rootFunctionId = null, showLogicalElements = true) {
  const nodes = [];
  const edges = [];

  const tree = model.getFunctionTree();

  let roots;
  if (rootFunctionId) {
    const flat = {};
    const flatten = (ns) => ns.forEach((n) => { flat[n.id] = n; flatten(n.children); });
    flatten(tree);
    roots = flat[rootFunctionId] ? [flat[rootFunctionId]] : tree;
  } else {
    roots = tree;
  }

  const leafCounts = roots.map(countLeaves);
  const totalLeaves = leafCounts.reduce((a, b) => a + b, 0);
  const totalWidth = totalLeaves * NODE_WIDTH + (totalLeaves - 1) * H_SPACING;

  let xCursor = -totalWidth / 2;
  roots.forEach((root, i) => {
    const rootWidth = leafCounts[i] * NODE_WIDTH + (leafCounts[i] - 1) * H_SPACING;
    layoutSubtree(root, model, nodes, edges, 0, xCursor + rootWidth / 2, showLogicalElements);
    xCursor += rootWidth + H_SPACING;
  });

  return { nodes, edges };
}
