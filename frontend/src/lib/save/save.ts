import { useRenderShowDeclaration } from "@/widgets/show-declaration/save";
import { Templates } from "../templates";
import { ProjectMetadata } from "../transfer/metadata";
import { Node, ShowDeclarationDefinition } from "@/lib/transfer";

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

export interface Renderers {
  renderShowDeclaration: (definition: ShowDeclarationDefinition) => string;
}

export function useRenderers(metadata: ProjectMetadata, templates: Templates) {
  const renderShowDeclaration = useRenderShowDeclaration(metadata, templates);

  return {
    renderShowDeclaration,
  };
}

export async function saveFiles(rootNode: Node, renderers: Renderers) {
  const dirHandle = await window.showDirectoryPicker();

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
        const id = await writeWidget(
          dirHandle,
          node.showDeclaration.definition,
          node.showDeclaration.definition.id,
          renderers.renderShowDeclaration,
        );
        return [id];
      case "text":
        return [];
    }
  }

  await traverse(generatedDirHandle, rootNode);
}
