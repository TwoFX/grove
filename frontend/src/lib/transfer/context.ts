import { createContext } from "react";
import { emptyRegistry, GroveContextData } from "./contextdata";

export const GroveContext = createContext<GroveContextData>({
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
  showDeclarationFact: emptyRegistry(),
});
