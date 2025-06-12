import { readFileSync } from "fs";
import { TemplateStrings } from ".";

function readTemplate(path: string): string {
  return readFileSync(`./src/${path}`, "utf-8");
}

function readPartial(path: string): string {
  return readFileSync(`./src/lib/templates/partials/${path}`, "utf-8");
}

export const templates: TemplateStrings = {
  generatedFile: readTemplate("lib/templates/generatedFile.template"),
  showDeclaration: readTemplate(
    "widgets/show-declaration/save/showDeclaration.template",
  ),
  metadataPartial: readPartial("metadata.partial"),
  declarationPartial: readPartial("declaration.partial"),
};
