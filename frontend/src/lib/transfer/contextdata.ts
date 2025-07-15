import { InvalidatedFact } from "./invalidated";
import {
  AssertionDefinition,
  AssertionFact,
  AssociationTableDefinition,
  AssociationTableFact,
  AssociationTableState,
  Declaration,
  Section,
  ShowDeclarationDefinition,
  ShowDeclarationFact,
  TableDefinition,
  TableFact,
  TableState,
} from "./project";
import { Node } from "@/lib/transfer/project/index";

export interface FactRegistry<T> {
  byId: { [widgetId: string]: { [factId: string]: T } };
  all: T[];
}

export function emptyFactRegistry<T>(): FactRegistry<T> {
  return {
    byId: {},
    all: [],
  };
}

export function addToFactRegistry<T>(
  reg: FactRegistry<T>,
  widgetId: string,
  factId: string,
  fact: T,
) {
  if (!reg.byId[widgetId]) {
    reg.byId[widgetId] = {};
  }
  reg.byId[widgetId][factId] = fact;
  reg.all.push(fact);
}

export interface StateRegistry<T> {
  byId: { [widgetId: string]: T };
  all: T[];
}

export function emptyStateRegistry<T>(): StateRegistry<T> {
  return {
    byId: {},
    all: [],
  };
}

export function addToStateRegistry<T>(
  reg: StateRegistry<T>,
  widgetId: string,
  data: T,
) {
  reg.byId[widgetId] = data;
  reg.all.push(data);
}

export interface ProjectMetadata {
  hash: string;
  projectNamespace: string;
}

export interface GroveContextData {
  upstreamInvalidatedFacts: InvalidatedFact[] | undefined;
  rootNode: Node;
  projectMetadata: ProjectMetadata;
  declarations: { [key: string]: Declaration };
  section: {
    [sectionId: string]: Section;
  };
  showDeclarationDefinition: StateRegistry<ShowDeclarationDefinition>;
  showDeclarationFact: FactRegistry<ShowDeclarationFact>;
  associationTableFact: FactRegistry<AssociationTableFact>;
  associationTableState: StateRegistry<AssociationTableState>;
  associationTableDefinition: StateRegistry<AssociationTableDefinition>;
  assertionDefinition: StateRegistry<AssertionDefinition>;
  assertionFact: FactRegistry<AssertionFact>;
  tableFact: FactRegistry<TableFact>;
  tableState: StateRegistry<TableState>;
  tableDefinition: StateRegistry<TableDefinition>;
  parentSection: {
    [id: string]: string;
  };
}
