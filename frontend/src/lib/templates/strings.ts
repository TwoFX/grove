import assertion from "@/widgets/assertion/save/assertion.template?raw";
import associationTable from "@/widgets/association-table/save/associationTable.template?raw";
import showDeclaration from "@/widgets/show-declaration/save/showDeclaration.template?raw";
import table from "@/widgets/table/save/table.template?raw";
import { TemplateStrings } from ".";
import generatedFile from "./generatedFile.template?raw";

export const templates: TemplateStrings = {
  generatedFile,
  showDeclaration,
  associationTable,
  table,
  assertion,
};
