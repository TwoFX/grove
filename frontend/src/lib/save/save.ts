import { useRenderShowDeclaration } from "@/widgets/show-declaration/save";
import {
  AssociationTableDefinition,
  Node,
  ShowDeclarationDefinition,
  TableDefinition,
} from "@/lib/transfer/project";
import { useRenderAssociationTable } from "@/widgets/association-table/save";
import { GroveTemplateContext } from "../templates/context";
import { GroveContext } from "../transfer/context";
import { useContext } from "react";
import { useRenderTable } from "@/widgets/table/save";

async function writeWidget<T>(
  dirHandle: FileSystemDirectoryHandle,
  widget: T,
  id: string,
  render: (t: T) => string,
): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(id + ".lean", {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  await writable.write(render(widget));
  await writable.close();
  return id;
}

export function useRenderGeneratedFile(): (ids: string[]) => string {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);

  return (ids) => {
    return templates.generatedFile({ metadata: context.projectMetadata, ids });
  };
}

export interface Renderers {
  renderShowDeclaration: (definition: ShowDeclarationDefinition) => string;
  renderGeneratedFile: (ids: string[]) => string;
  renderAssociationTable: (
    associationTable: AssociationTableDefinition,
  ) => string;
  renderTable: (table: TableDefinition) => string;
}

export function useRenderers(): Renderers {
  const renderShowDeclaration = useRenderShowDeclaration();
  const renderGeneratedFile = useRenderGeneratedFile();
  const renderAssociationTable = useRenderAssociationTable();
  const renderTable = useRenderTable();

  return {
    renderShowDeclaration,
    renderGeneratedFile,
    renderAssociationTable,
    renderTable,
  };
}

export async function saveFiles(rootNode: Node, renderers: Renderers) {
  const dirHandle = await window.showDirectoryPicker({
    mode: "readwrite",
  });

  const generatedDirHandle = await dirHandle.getDirectoryHandle("Generated", {
    create: true,
  });

  async function traverse(
    dirHandle: FileSystemDirectoryHandle,
    node: Node,
  ): Promise<string[]> {
    switch (node.constructor) {
      case "assertion":
        return [];
      case "namespace":
        return [];
      case "section":
        const childResults = await Promise.all(
          node.section.children.map((child) => traverse(dirHandle, child)),
        );
        return childResults.flat();
      case "showDeclaration":
        const showDeclarationId = await writeWidget(
          dirHandle,
          node.showDeclaration.definition,
          node.showDeclaration.definition.id,
          renderers.renderShowDeclaration,
        );
        return [showDeclarationId];
      case "associationTable":
        const associationTableId = await writeWidget(
          dirHandle,
          node.associationTable.definition,
          node.associationTable.definition.widgetId,
          renderers.renderAssociationTable,
        );
        return [associationTableId];
      case "table":
        const tableId = await writeWidget(
          dirHandle,
          node.table.definition,
          node.table.definition.widgetId,
          renderers.renderTable,
        );
        return [tableId];
      case "text":
        return [];
    }
  }

  const allIds = await traverse(generatedDirHandle, rootNode);

  await writeWidget(
    dirHandle,
    allIds,
    "Generated",
    renderers.renderGeneratedFile,
  );
}
