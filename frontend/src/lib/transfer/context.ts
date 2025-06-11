import { createContext } from "react";
import { GroveContextData } from "./metadata";

export const GroveContext = createContext<GroveContextData>({
  showDeclarationFact: {},
});
