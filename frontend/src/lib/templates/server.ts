import { readFileSync } from "fs";
import { TemplateStrings } from ".";

function readTemplate(path: string): string {
  return readFileSync(`./src/lib/templates/${path}`, "utf-8");
}

export const templates: TemplateStrings = {
  showDeclaration: readTemplate("showDeclaration.template"),
  metadataPartial: readTemplate("metadata.partial"),
  declarationPartial: readTemplate("declaration.partial"),
};
