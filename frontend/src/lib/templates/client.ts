import { DataKind } from "@/lib/transfer/project";
import { Templates, TemplateStrings } from ".";
import Handlebars from "handlebars";

export function setupTemplates(templateStrings: TemplateStrings): Templates {
  Handlebars.registerHelper("dataKind", function (dataKind: DataKind): string {
    switch (dataKind) {
      case DataKind.Declaration:
        return ".declaration";
      case DataKind.Subexpression:
        return ".subexpression";
      case DataKind.Synthesis:
        return ".synthesis";
    }
  });

  return {
    generatedFile: Handlebars.compile(templateStrings.generatedFile),
    showDeclaration: Handlebars.compile(templateStrings.showDeclaration),
    associationTable: Handlebars.compile(templateStrings.associationTable),
    table: Handlebars.compile(templateStrings.table),
    assertion: Handlebars.compile(templateStrings.assertion),
  };
}
