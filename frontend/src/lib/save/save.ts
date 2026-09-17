import { useRenderShowDeclaration } from "@/widgets/show-declaration/save";
import { useRenderAssociationTable } from "@/widgets/association-table/save";
import { GroveTemplateContext } from "../templates/context";
import { GroveContext } from "../transfer/context";
import { useContext } from "react";
import { useRenderTable } from "@/widgets/table/save";
import { useRenderAssertion } from "@/widgets/assertion/save";
import { Renderers } from "./files";
export { saveFiles } from "./files";

export function useRenderGeneratedFile(): (ids: string[]) => string {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);

  return (ids) => {
    return templates.generatedFile({ metadata: context.projectMetadata, ids });
  };
}

export function useRenderers(): Renderers {
  const renderShowDeclaration = useRenderShowDeclaration();
  const renderGeneratedFile = useRenderGeneratedFile();
  const renderAssociationTable = useRenderAssociationTable();
  const renderTable = useRenderTable();
  const renderAssertion = useRenderAssertion();

  return {
    renderShowDeclaration,
    renderGeneratedFile,
    renderAssociationTable,
    renderTable,
    renderAssertion,
  };
}
