import { ShowDeclaration } from "@/transfer";
import { ProjectMetadata } from "@/transfer/metadata";

export interface TemplateStrings {
  showDeclaration: string;
  metadataPartial: string;
  declarationPartial: string;
}

export interface WidgetWithMetadata<T> {
  metadata: ProjectMetadata;
  widget: T;
}

export interface Templates {
  showDeclaration: HandlebarsTemplateDelegate<
    WidgetWithMetadata<ShowDeclaration>
  >;
}
