import { ShowDeclaration } from "@/lib/transfer";
import { ProjectMetadata } from "@/lib/transfer/metadata";

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
