import { TableFactIdentifier } from "@/lib/transfer/project";

export function buildFactId(identifier: TableFactIdentifier): string {
  return (
    identifier.rowAssociationId +
    ":::" +
    identifier.columnAssociationId +
    ":::" +
    identifier.selectedLayers.join("::")
  );
}

export function buildFactIdentifier(
  rowAssociationId: string,
  columnAssociationId: string,
  selectedLayers: string[],
): TableFactIdentifier {
  return {
    rowAssociationId,
    columnAssociationId,
    selectedLayers: selectedLayers,
  };
}
