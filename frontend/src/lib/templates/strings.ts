import assertion from "@/widgets/assertion/save/assertion.template?raw";
import associationTable from "@/widgets/association-table/save/associationTable.template?raw";
import showDeclaration from "@/widgets/show-declaration/save/showDeclaration.template?raw";
import table from "@/widgets/table/save/table.template?raw";
import { TemplateStrings } from ".";
import declaration from "./declaration.template?raw";
import generatedFile from "./generatedFile.template?raw";
import declarationPartial from "./partials/declaration.partial?raw";
import metadataPartial from "./partials/metadata.partial?raw";

export const templates: TemplateStrings = {
  generatedFile,
  showDeclaration,
  associationTable,
  table,
  declaration,
  metadataPartial,
  declarationPartial,
  assertion,
};
