import { Declaration, FactStatus } from "@/lib/transfer/project";
import { Templates, TemplateStrings } from ".";
import Handlebars from "handlebars";

export function setupTemplates(templateStrings: TemplateStrings): Templates {
  Handlebars.registerHelper(
    "leanString",
    function (str: string): Handlebars.SafeString {
      return new Handlebars.SafeString(JSON.stringify(str));
    },
  );

  Handlebars.registerHelper(
    "leanName",
    function (str: string): Handlebars.SafeString {
      return new Handlebars.SafeString("`" + str);
    },
  );

  Handlebars.registerHelper(
    "declarationIsDefinition",
    function (decl: Declaration): boolean {
      return decl.constructor === "def";
    },
  );

  Handlebars.registerHelper(
    "declarationIsTheorem",
    function (decl: Declaration): boolean {
      return decl.constructor === "thm";
    },
  );

  Handlebars.registerHelper(
    "declarationIsMissing",
    function (decl: Declaration): boolean {
      return decl.constructor === "missing";
    },
  );

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
  Handlebars.registerPartial("declaration", templateStrings.declarationPartial);

  return {
    generatedFile: Handlebars.compile(templateStrings.generatedFile),
    showDeclaration: Handlebars.compile(templateStrings.showDeclaration),
  };
}
