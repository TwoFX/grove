import { createContext } from "react";
import { GroveContextData } from "./metadata";

export const GroveContext = createContext<GroveContextData>({
  projectMetadata: {
    hash: "",
    projectNamespace: "",
  },
  rootNode: {
    constructor: "text",
    text: "This is the dummy root node created when there is no context available.",
  },
  section: {},
  showDeclarationFact: {},
});
