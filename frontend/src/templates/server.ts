import { readFileSync } from "fs";
import { TemplateStrings } from ".";

function readTemplate(path: string): string {
  return readFileSync(`./src/templates/${path}`, "utf-8");
}

export const templates: TemplateStrings = {
  showDeclaration: readTemplate("showDeclaration.template"),
  metadataPartial: readTemplate("metadata.partial"),
};
