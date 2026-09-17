import {
  AssertionDefinition,
  AssociationTableDefinition,
  ShowDeclarationDefinition,
  TableDefinition,
} from "@/lib/transfer/project";
import { ProjectMetadata } from "../transfer/contextdata";

export interface TemplateStrings {
  generatedFile: string;
  showDeclaration: string;
  associationTable: string;
  table: string;
  assertion: string;
}

export interface Widget<TDefinition> {
  metadata: ProjectMetadata;
  definition: TDefinition;
}

export interface Templates {
  generatedFile: HandlebarsTemplateDelegate<{
    metadata: ProjectMetadata;
    ids: string[];
  }>;
  showDeclaration: HandlebarsTemplateDelegate<
    Widget<ShowDeclarationDefinition>
  >;
  associationTable: HandlebarsTemplateDelegate<
    Widget<AssociationTableDefinition>
  >;
  table: HandlebarsTemplateDelegate<Widget<TableDefinition>>;
  assertion: HandlebarsTemplateDelegate<Widget<AssertionDefinition>>;
}
