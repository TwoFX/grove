import { createContext } from "react";
import { Templates } from ".";

export const GroveTemplateContext = createContext<Templates>({
  generatedFile: () => "missing template context",
  showDeclaration: () => "missing template context",
  associationTable: () => "missing template context",
  declaration: () => "missing template context",
});
