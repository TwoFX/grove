import { AssociationTable } from "@/lib/transfer/project";

export function useRenderAssociationTable(): (
  //   metadata: ProjectMetadata,
  //   templates: Templates,
  associationTable: AssociationTable,
) => string {
  return (associationTable) => {
    return associationTable.widgetId;
  };
}
