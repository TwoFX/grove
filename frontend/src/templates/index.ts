import { ShowDeclaration } from "@/transfer";

export interface TemplateStrings {
  showDeclaration: string;
  metadataPartial: string;
  declarationPartial: string;
}

export interface Templates {
  showDeclaration: HandlebarsTemplateDelegate<ShowDeclaration>;
}
