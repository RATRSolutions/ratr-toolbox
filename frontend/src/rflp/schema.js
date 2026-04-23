// EKSEMPEL — ikke komplett. Alle ark legges til i Steg 1, spør underveis ved usikkerhet.
export const schema = {
  sheets: {
    Function: {
      source: '10_Function',
      idCol: 'FunctionID',
      parentCol: 'ParentID',
    },
    ContextDescription: {
      source: '20_ContextDescription',
      idCol: 'ContextID',
      fkCol: 'FunctionID',
      optional: true,
    },
    UseCases: {
      source: '30_UseCases',
      idCol: 'UseCaseID',
      fkCol: 'FunctionID',
      optional: true,
    },
    Requirements: {
      source: '40_Requirements',
      idCol: 'RequirementID',
      fkCol: 'FunctionID',
      optional: true,
    },
    ConceptOptions: {
      source: '50_ConceptOptions',
      idCol: 'ConceptOptionID',
      fkCol: 'ConceptDecisionID',
      optional: true,
    },
    ConceptDecisions: {
      source: '51_ConceptDecisions',
      idCol: 'ConceptDecisionID',
      fkCol: 'FunctionID',
      optional: true,
    },
    LogicalElements: {
      source: '60_LogicalElements',
      idCol: 'LogicalID',
      fkCol: 'ConceptDecisionID',
      optional: true,
    },
    PhysicalElements: {
      source: '70_PhysicalElements',
      idCol: 'PhysicalID',
      fkCol: 'LogicalID',
      optional: true,
    },
    Project: {
      source: '00_Project',
      optional: true,
    },
    Stakeholders: {
      source: '05_Stakeholders',
      optional: true,
    },
  },
  relations: [
    { from: 'Requirements',      to: 'Function',         via: 'FunctionID' },
    { from: 'ContextDescription', to: 'Function',        via: 'FunctionID' },
    { from: 'UseCases',          to: 'Function',         via: 'FunctionID' },
    { from: 'ConceptDecisions',  to: 'Function',         via: 'FunctionID' },
    { from: 'ConceptOptions',    to: 'ConceptDecisions', via: 'ConceptDecisionID' },
    { from: 'LogicalElements',   to: 'ConceptDecisions', via: 'ConceptDecisionID' },
    { from: 'PhysicalElements',  to: 'LogicalElements',  via: 'LogicalID' },
  ],
};
