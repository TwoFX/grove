import { readFileSync } from "fs";
import { Templates } from ".";

const showDeclarationPrecompiled = readFileSync(
  "./src/templates/showDeclaration.template",
  "utf-8",
);

export const templates: Templates = {
  showDeclaration: showDeclarationPrecompiled,
};
