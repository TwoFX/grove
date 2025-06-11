import { TemplateStrings, WidgetWithMetadata } from "../templates";
import { setupTemplates } from "../templates/client";
import { ProjectMetadata } from "../transfer/metadata";
import { Node } from "@/lib/transfer";

async function writeWidget<T>(
  projectMetadata: ProjectMetadata,
  dirHandle: FileSystemDirectoryHandle,
  widget: T,
  id: string,
  template: HandlebarsTemplateDelegate<WidgetWithMetadata<T>>,
): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(id + ".lean", {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  await writable.write(template({ widget: widget, metadata: projectMetadata }));
  await writable.close();
  return id;
}

export async function saveFiles(
  templateStrings: TemplateStrings,
  rootNode: Node,
  projectMetadata: ProjectMetadata,
) {
  const dirHandle = await window.showDirectoryPicker();

  const generatedDirHandle = await dirHandle.getDirectoryHandle("Generated", {
    create: true,
  });

  const templates = setupTemplates(templateStrings);

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
          projectMetadata,
          dirHandle,
          node.showDeclaration,
          node.showDeclaration.id,
          templates.showDeclaration,
        );
        return [id];
      case "text":
        return [];
    }
  }

  await traverse(generatedDirHandle, rootNode);
}
