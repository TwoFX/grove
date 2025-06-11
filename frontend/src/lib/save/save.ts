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
) {
  const fileHandle = await dirHandle.getFileHandle(id + ".lean", {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  await writable.write(template({ widget: widget, metadata: projectMetadata }));
  await writable.close();
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

  async function traverse(dirHandle: FileSystemDirectoryHandle, node: Node) {
    switch (node.constructor) {
      case "assertion":
        return;
      case "namespace":
        return;
      case "section":
        await Promise.all(
          node.section.children.map((child) => traverse(dirHandle, child)),
        );
        return;
      case "showDeclaration":
        await writeWidget(
          projectMetadata,
          dirHandle,
          node.showDeclaration,
          node.showDeclaration.id,
          templates.showDeclaration,
        );
        return;
      case "text":
        return;
    }
  }

  traverse(generatedDirHandle, rootNode);
}
