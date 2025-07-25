import { AssociationTableFactCellState } from "@/lib/transfer/project";

function associationTableFactCellStateEqual(
  first: AssociationTableFactCellState,
  second: AssociationTableFactCellState,
): boolean {
  return (
    first.columnIdentifier === second.columnIdentifier &&
    first.cellValue === second.cellValue
  );
}

export function associationTableFactStatesEqual(
  first: AssociationTableFactCellState[],
  second: AssociationTableFactCellState[],
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  for (let i = 0; i < first.length; i++) {
    if (!associationTableFactCellStateEqual(first[i], second[i])) {
      return false;
    }
  }
  return true;
}
