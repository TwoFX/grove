import { ShowDeclaration } from "@/transfer";

export interface TemplateStrings {
  showDeclaration: string;
  metadataPartial: string;
}

export interface Templates {
  showDeclaration: HandlebarsTemplateDelegate<ShowDeclaration>;
}
