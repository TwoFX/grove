import type {
  AssertionDefinition,
  AssociationTableDefinition,
  Node,
  ShowDeclarationDefinition,
  TableDefinition,
} from "../transfer/project";
import type { RenderedWidget } from "./json";

async function writeFile(
  dirHandle: FileSystemDirectoryHandle,
  name: string,
  contents: string,
) {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

async function writeWidget<T>(
  dirHandle: FileSystemDirectoryHandle,
  widget: T,
  id: string,
  render: (t: T) => RenderedWidget,
): Promise<string> {
  const rendered = render(widget);
  await writeFile(dirHandle, id + ".json", rendered.json);
  await writeFile(dirHandle, id + ".lean", rendered.lean);
  return id;
}

export interface Renderers {
  renderShowDeclaration: (
    definition: ShowDeclarationDefinition,
  ) => RenderedWidget;
  renderGeneratedFile: (ids: string[]) => string;
  renderAssociationTable: (
    associationTable: AssociationTableDefinition,
  ) => RenderedWidget;
  renderTable: (table: TableDefinition) => RenderedWidget;
  renderAssertion: (assertion: AssertionDefinition) => RenderedWidget;
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
      case "namespace":
        return [];
      case "section": {
        const childResults = await Promise.all(
          node.section.children.map((child) => traverse(dirHandle, child)),
        );
        return childResults.flat();
      }
      case "showDeclaration": {
        const showDeclarationId = await writeWidget(
          dirHandle,
          node.showDeclaration.definition,
          node.showDeclaration.definition.id,
          renderers.renderShowDeclaration,
        );
        return [showDeclarationId];
      }
      case "associationTable": {
        const associationTableId = await writeWidget(
          dirHandle,
          node.associationTable.definition,
          node.associationTable.definition.widgetId,
          renderers.renderAssociationTable,
        );
        return [associationTableId];
      }
      case "assertion": {
        const assertionId = await writeWidget(
          dirHandle,
          node.assertion.definition,
          node.assertion.definition.widgetId,
          renderers.renderAssertion,
        );
        return [assertionId];
      }
      case "table": {
        const tableId = await writeWidget(
          dirHandle,
          node.table.definition,
          node.table.definition.widgetId,
          renderers.renderTable,
        );
        return [tableId];
      }
      case "text":
        return [];
    }
  }

  const allIds = await traverse(generatedDirHandle, rootNode);

  await writeFile(
    dirHandle,
    "Generated.lean",
    renderers.renderGeneratedFile(allIds),
  );
}
