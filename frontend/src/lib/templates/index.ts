import {
  ShowDeclarationDefinition,
  ShowDeclarationFact,
} from "@/lib/transfer/project";
import { ProjectMetadata } from "../transfer/contextdata";

export interface TemplateStrings {
  generatedFile: string;
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
  generatedFile: HandlebarsTemplateDelegate<{
    metadata: ProjectMetadata;
    ids: string[];
  }>;
  showDeclaration: HandlebarsTemplateDelegate<
    Widget<ShowDeclarationDefinition, ShowDeclarationFact>
  >;
}
