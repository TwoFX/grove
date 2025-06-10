import { FactStatus } from "@/transfer";
import { Templates, TemplateStrings } from ".";
import Handlebars from "handlebars";

export function setupTemplates(templateStrings: TemplateStrings): Templates {
  Handlebars.registerHelper("leanEscape", function (str: string): string {
    return JSON.stringify(str).slice(1, -1);
  });

  Handlebars.registerHelper("status", function (status: FactStatus): string {
    switch (status) {
      case FactStatus.Bad:
        return ".bad";
      case FactStatus.Done:
        return ".done";
      case FactStatus.BelievedGood:
        return ".believedGood";
      case FactStatus.NothingToDo:
        return ".nothingToDo";
      case FactStatus.Postponed:
        return ".postponed";
    }
  });

  Handlebars.registerPartial("metadata", templateStrings.metadataPartial);

  return {
    showDeclaration: Handlebars.compile(templateStrings.showDeclaration),
  };
}
