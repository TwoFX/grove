import { useRenderShowDeclaration } from "@/widgets/show-declaration/save";
import { Templates } from "../templates";
import {
  AssociationTableDefinition,
  Node,
  ShowDeclarationDefinition,
} from "@/lib/transfer/project";
import { ProjectMetadata } from "../transfer/contextdata";
import { useRenderAssociationTable } from "@/widgets/association-table/save";

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

export function useRenderGeneratedFile(
  metadata: ProjectMetadata,
  templates: Templates,
): (ids: string[]) => string {
  return (ids) => {
    return templates.generatedFile({ metadata, ids });
  };
}

export interface Renderers {
  renderShowDeclaration: (definition: ShowDeclarationDefinition) => string;
  renderGeneratedFile: (ids: string[]) => string;
  renderAssociationTable: (
    associationTable: AssociationTableDefinition,
  ) => string;
}

export function useRenderers(
  metadata: ProjectMetadata,
  templates: Templates,
): Renderers {
  const renderShowDeclaration = useRenderShowDeclaration(metadata, templates);
  const renderGeneratedFile = useRenderGeneratedFile(metadata, templates);
  const renderAssociationTable = useRenderAssociationTable(metadata, templates);

  return {
    renderShowDeclaration,
    renderGeneratedFile,
    renderAssociationTable,
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
