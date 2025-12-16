import { createContext } from "react";
import {
  emptyFactRegistry,
  emptyStateRegistry,
  GroveContextData,
} from "./contextdata";

export const GroveContext = createContext<GroveContextData>({
  declarations: {},
  upstreamInvalidatedFacts: undefined,
  upstreamNeedAttentionFacts: undefined,
  projectMetadata: {
    hash: "",
    projectNamespace: "",
  },
  rootNode: {
    constructor: "text",
    text: {
      id: "dummy-root",
      content:
        "This is the dummy root node created when there is no context available.",
    },
  },
  section: {},
  showDeclarationFact: emptyFactRegistry(),
  showDeclarationDefinition: emptyStateRegistry(),
  associationTableFact: emptyFactRegistry(),
  associationTableState: emptyStateRegistry(),
  associationTableDefinition: emptyStateRegistry(),
  assertionDefinition: emptyStateRegistry(),
  assertionFact: emptyFactRegistry(),
  tableFact: emptyFactRegistry(),
  tableState: emptyStateRegistry(),
  tableDefinition: emptyStateRegistry(),
  parentSection: {},
});
