import { AssociationTableDefinition } from "@/lib/transfer/project";

export function useRenderAssociationTable(): (
  //   metadata: ProjectMetadata,
  //   templates: Templates,
  associationTable: AssociationTableDefinition,
) => string {
  return (associationTable) => {
    return associationTable.widgetId;
  };
}
