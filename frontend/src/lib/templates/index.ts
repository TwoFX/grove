import {
  AssociationTableDefinition,
  AssociationTableFact,
  AssociationTableState,
  ShowDeclarationDefinition,
  ShowDeclarationFact,
} from "@/lib/transfer/project";
import { ProjectMetadata } from "../transfer/contextdata";

export interface TemplateStrings {
  generatedFile: string;
  showDeclaration: string;
  associationTable: string;
  metadataPartial: string;
  declarationPartial: string;
}

export interface Widget<TDefinition, TState, TFact> {
  metadata: ProjectMetadata;
  definition: TDefinition;
  state: TState;
  facts: TFact[];
}

export interface Templates {
  generatedFile: HandlebarsTemplateDelegate<{
    metadata: ProjectMetadata;
    ids: string[];
  }>;
  showDeclaration: HandlebarsTemplateDelegate<
    Widget<ShowDeclarationDefinition, void, ShowDeclarationFact>
  >;
  associationTable: HandlebarsTemplateDelegate<
    Widget<
      AssociationTableDefinition,
      AssociationTableState,
      AssociationTableFact
    >
  >;
}
