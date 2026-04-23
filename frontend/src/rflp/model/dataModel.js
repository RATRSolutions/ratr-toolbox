function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

function findVal(row, normalizedName) {
  const key = Object.keys(row).find((k) => nk(k) === normalizedName);
  return key != null ? row[key] : null;
}

function getStr(row, normalizedName) {
  const v = findVal(row, normalizedName);
  return v != null ? String(v) : null;
}

function indexByFk(rows, fkColNormalized) {
  const idx = {};
  rows.forEach((row) => {
    const fk = getStr(row, fkColNormalized);
    if (!fk) return;
    if (!idx[fk]) idx[fk] = [];
    idx[fk].push(row);
  });
  return idx;
}

function buildFunctionTree(funcRows) {
  if (!funcRows.length) return [];

  const firstRow = funcRows[0];
  const idKey = Object.keys(firstRow).find((k) => nk(k) === 'functionid');
  const parentKey = Object.keys(firstRow).find((k) => nk(k) === 'parentid');
  const nameKey = Object.keys(firstRow).find((k) =>
    ['functionname', 'name', 'description', 'title'].includes(nk(k))
  );

  if (!idKey) return [];

  const nodes = funcRows.map((row) => {
    const id = String(row[idKey] ?? '');
    const parentId = parentKey && row[parentKey] ? String(row[parentKey]) : null;
    const name = nameKey ? String(row[nameKey] ?? id) : id;
    const metadata = Object.fromEntries(
      Object.entries(row).filter(([k]) => k !== idKey && k !== parentKey && k !== nameKey)
    );
    return { id, parentId, name, metadata, children: [] };
  });

  const map = {};
  nodes.forEach((n) => { map[n.id] = n; });

  const roots = [];
  nodes.forEach((n) => {
    if (n.parentId && map[n.parentId]) {
      map[n.parentId].children.push(n);
    } else {
      roots.push(n);
    }
  });

  return roots;
}

function flattenTree(nodes, map) {
  nodes.forEach((n) => {
    map[n.id] = n;
    flattenTree(n.children, map);
  });
}

const DEDICATED_SHEETS = new Set([
  '10_Function',
  '20_ContextDescription',
  '30_UseCases',
  '40_Requirements',
  '51_ConceptDecisions',
]);

class RflpDataModel {
  constructor(rawSheets) {
    this._rawSheets = rawSheets;

    const s = (name) => rawSheets[name] ?? [];

    const funcRows = s('10_Function');
    const ctxRows  = s('20_ContextDescription');
    const ucRows   = s('30_UseCases');
    const reqRows  = s('40_Requirements');
    const coRows   = s('50_ConceptOptions');
    const cdRows   = s('51_ConceptDecisions');
    const leRows   = s('60_LogicalElements');
    const peRows   = s('70_PhysicalElements');

    this._funcTree = buildFunctionTree(funcRows);
    this._funcMap  = {};
    flattenTree(this._funcTree, this._funcMap);

    this._reqsByFunc = indexByFk(reqRows, 'functionid');
    this._ctxByFunc  = indexByFk(ctxRows, 'functionid');
    this._ucByFunc   = indexByFk(ucRows, 'functionid');

    this._optsByDecision = indexByFk(coRows, 'conceptdecisionid');
    this._lesByDecision  = indexByFk(leRows, 'conceptdecisionid');
    this._pesByLogical   = indexByFk(peRows, 'logicalid');

    this._cdsByFunc = {};
    this._buildCdIndex(cdRows, rawSheets);

    this._otherSectionsByFunc = this._buildOtherSections(rawSheets);
  }

  _buildCdIndex(cdRows, rawSheets) {
    if (!cdRows.length) return;

    const hasFuncId = cdRows.some((row) =>
      Object.keys(row).some((k) => nk(k) === 'functionid')
    );

    if (hasFuncId) {
      cdRows.forEach((cd) => {
        const funcId = getStr(cd, 'functionid');
        if (!funcId) return;
        if (!this._cdsByFunc[funcId]) this._cdsByFunc[funcId] = [];
        this._cdsByFunc[funcId].push(cd);
      });
      return;
    }

    // Fall back to junction table: any sheet that has both FunctionID and ConceptDecisionID
    const cdById = {};
    cdRows.forEach((cd) => {
      const id = getStr(cd, 'conceptdecisionid');
      if (id) cdById[id] = cd;
    });

    for (const [, rows] of Object.entries(rawSheets)) {
      if (!rows.length) continue;
      const keys = Object.keys(rows[0]).map(nk);
      if (!keys.includes('functionid') || !keys.includes('conceptdecisionid')) continue;

      rows.forEach((row) => {
        const funcId = getStr(row, 'functionid');
        const cdId   = getStr(row, 'conceptdecisionid');
        const cd     = cdId ? cdById[cdId] : null;
        if (!funcId || !cd) return;
        if (!this._cdsByFunc[funcId]) this._cdsByFunc[funcId] = [];
        if (!this._cdsByFunc[funcId].includes(cd)) {
          this._cdsByFunc[funcId].push(cd);
        }
      });
      break;
    }
  }

  _buildOtherSections(rawSheets) {
    const byFunc = {};

    Object.entries(rawSheets).forEach(([sheetName, rows]) => {
      if (DEDICATED_SHEETS.has(sheetName)) return;
      if (!rows.length) return;

      const hasFuncId = Object.keys(rows[0]).some((k) => nk(k) === 'functionid');
      if (!hasFuncId) return;

      const sectionName = sheetName.replace(/^\d+_/, '').replace(/_/g, ' ');
      if (nk(sectionName) === 'functionconceptallocation') return;

      rows.forEach((row) => {
        const funcId = getStr(row, 'functionid');
        if (!funcId) return;
        if (!byFunc[funcId]) byFunc[funcId] = {};
        if (!byFunc[funcId][sectionName]) byFunc[funcId][sectionName] = [];
        byFunc[funcId][sectionName].push(row);
      });
    });

    return byFunc;
  }

  _resolveConceptDecisions(funcId) {
    return (this._cdsByFunc[funcId] ?? []).map((cd) => {
      const cdId = getStr(cd, 'conceptdecisionid') ?? '';
      return {
        ...cd,
        _options: this._optsByDecision[cdId] ?? [],
        _logicalElements: (this._lesByDecision[cdId] ?? []).map((le) => {
          const leId = getStr(le, 'logicalid') ?? '';
          return { ...le, _physicalElements: this._pesByLogical[leId] ?? [] };
        }),
      };
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  getFunctionTree() {
    return this._funcTree;
  }

  getFunction(id) {
    const node = this._funcMap[id];
    if (!node) return null;

    const otherSectionsMap = this._otherSectionsByFunc[id] ?? {};
    const otherSections = Object.entries(otherSectionsMap).map(([title, rows]) => ({ title, rows }));

    return {
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      metadata: node.metadata,
      children: node.children,
      requirements: this._reqsByFunc[id] ?? [],
      contextDescriptions: this._ctxByFunc[id] ?? [],
      useCases: this._ucByFunc[id] ?? [],
      conceptDecisions: this._resolveConceptDecisions(id),
      otherSections,
    };
  }

  getRequirements(filter = {}) {
    const allReqs = Object.values(this._reqsByFunc).flat();
    return allReqs.filter((req) => {
      if (filter.sourceType && getStr(req, 'sourcetype') !== filter.sourceType) return false;
      if (filter.functionId && getStr(req, 'functionid') !== filter.functionId) return false;
      if (filter.status && getStr(req, 'status') !== filter.status) return false;
      return true;
    });
  }

  getAllRequirements() {
    return Object.values(this._reqsByFunc).flat();
  }

  getUseCases(functionId) {
    return this._ucByFunc[functionId] ?? [];
  }

  getConceptDecision(functionId) {
    const cds = this._resolveConceptDecisions(functionId);
    return cds.length ? cds[0] : null;
  }

  getAllConceptDecisions() {
    const result = {};
    Object.keys(this._cdsByFunc).forEach((funcId) => {
      result[funcId] = this._resolveConceptDecisions(funcId);
    });
    return result;
  }

  getAllContextDescriptions() {
    return this._ctxByFunc;
  }

  getAncestorPath(id) {
    const path = [];
    let node = this._funcMap[id];
    while (node) {
      path.unshift({ id: node.id, name: node.name });
      node = node.parentId ? this._funcMap[node.parentId] : null;
    }
    return path;
  }

  getTraceability(functionId) {
    const reqs = [];
    const visited = new Set();
    const collect = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      (this._reqsByFunc[id] ?? []).forEach((r) => reqs.push(r));
      const node = this._funcMap[id];
      if (node) node.children.forEach((c) => collect(c.id));
    };
    collect(functionId);
    return reqs;
  }
}

export function buildDataModel(rawSheets) {
  return new RflpDataModel(rawSheets);
}
