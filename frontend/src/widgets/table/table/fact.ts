import {
  TableFactIdentifier,
  TableFactLayerState,
  TableFactOptionalSingleState,
  TableFactSingleState,
  TableFactState,
} from "@/lib/transfer/project";

// Sync with `backend/Grove/Framework/Backend/Process/Table.lean`
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

function tableFactSingleStateEqual(
  first: TableFactSingleState,
  second: TableFactSingleState,
): boolean {
  // Intentionally not checking stateRepr here
  return first.value === second.value;
}

function optionalSingleStateEqual(
  first: TableFactOptionalSingleState,
  second: TableFactOptionalSingleState,
): boolean {
  if (first.constructor !== second.constructor) {
    return false;
  }

  if (first.constructor === "some" && second.constructor === "some") {
    return tableFactSingleStateEqual(first.some, second.some);
  } else {
    return true;
  }
}

function layerStatesEqual(
  first: TableFactLayerState,
  second: TableFactLayerState,
): boolean {
  if (first.layerIdentifier !== second.layerIdentifier) {
    return false;
  }

  if (!optionalSingleStateEqual(first.rowState, second.rowState)) {
    return false;
  }

  if (!optionalSingleStateEqual(first.columnState, second.columnState)) {
    return false;
  }

  if (first.selectedCellStates.length !== second.selectedCellStates.length) {
    return false;
  }

  for (let i = 0; i < first.selectedCellStates.length; i++) {
    if (
      !tableFactSingleStateEqual(
        first.selectedCellStates[i],
        second.selectedCellStates[i],
      )
    ) {
      return false;
    }
  }
  return true;
}

export function tableFactStatesEqual(
  first: TableFactState,
  second: TableFactState,
): boolean {
  if (first.layerStates.length !== second.layerStates.length) {
    return false;
  }

  for (let i = 0; i < first.layerStates.length; i++) {
    if (!layerStatesEqual(first.layerStates[i], second.layerStates[i])) {
      return false;
    }
  }
  return true;
}
