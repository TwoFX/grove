import { ShowDeclarationDefinition, ShowDeclarationFact } from "@/lib/transfer";
import { ProjectMetadata } from "@/lib/transfer/metadata";

export interface TemplateStrings {
  showDeclaration: string;
  metadataPartial: string;
  declarationPartial: string;
}

export interface Widget<TDefinition, TFact> {
  metadata: ProjectMetadata;
  definition: TDefinition;
  facts: TFact[];
}

export interface Templates {
  showDeclaration: HandlebarsTemplateDelegate<
    Widget<ShowDeclarationDefinition, ShowDeclarationFact>
  >;
}
