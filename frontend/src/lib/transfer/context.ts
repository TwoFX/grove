import { createContext } from "react";
import {
  emptyFactRegistry,
  emptyStateRegistry,
  GroveContextData,
} from "./contextdata";

export const GroveContext = createContext<GroveContextData>({
  declarations: {},
  upstreamInvalidatedFacts: undefined,
  projectMetadata: {
    hash: "",
    projectNamespace: "",
  },
  rootNode: {
    constructor: "text",
    text: "This is the dummy root node created when there is no context available.",
  },
  section: {},
  showDeclarationFact: emptyFactRegistry(),
  showDeclarationDefinition: emptyStateRegistry(),
  associationTableFact: emptyFactRegistry(),
  associationTableState: emptyStateRegistry(),
  associationTableDefinition: emptyStateRegistry(),
  tableFact: emptyFactRegistry(),
  tableState: emptyStateRegistry(),
  tableDefinition: emptyStateRegistry(),
  parentSection: {},
});
