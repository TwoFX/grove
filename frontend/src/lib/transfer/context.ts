import { createContext } from "react";
import { GroveContextData } from "./metadata";

export const GroveContext = createContext<GroveContextData>({
  projectMetadata: {
    hash: "",
    projectNamespace: "",
  },
  showDeclarationFact: {},
});
