import type {
  AssertionFact,
  AssociationTableFact,
  AssociationTableState,
  Declaration,
  PredicateState,
  ShowDeclarationFact,
  StateSnapshot,
  SynthesisResult,
  TableFact,
  TableFactOptionalSingleState,
  TableFactSingleState,
  TableState,
} from "../transfer/project";

export interface RenderedWidget {
  lean: string;
  json: string;
}

export type SavedWidget =
  | ReturnType<typeof tableData>
  | ReturnType<typeof associationTableData>
  | ReturnType<typeof assertionData>
  | ReturnType<typeof showDeclarationData>;

// The on-disk representation is Lean's DataKind.State JSON, without the transfer tags.
type SavedSnapshot =
  | Declaration
  | { declaration: Declaration }
  | { predicate: PredicateState }
  | { result: SynthesisResult }
  | Record<string, never>;

export function renderWidget(lean: string, data: SavedWidget): RenderedWidget {
  return { lean, json: JSON.stringify(data, null, 2) + "\n" };
}

function snapshot(stateJson: StateSnapshot): SavedSnapshot {
  if (stateJson === undefined) {
    throw new Error(
      "This fact uses an older snapshot format. Reassert it before saving.",
    );
  }
  switch (stateJson.constructor) {
    case "declaration":
      return stateJson.declaration;
    case "subexpressionDeclaration":
      return { declaration: stateJson.subexpressionDeclaration };
    case "subexpressionPredicate":
      return { predicate: stateJson.subexpressionPredicate };
    case "synthesisSuccess":
      return { result: stateJson.synthesisSuccess };
    case "synthesisFailure":
      return {};
  }
  // Also fail clearly if an older browser store supplies an untagged snapshot.
  const unsupported: never = stateJson;
  throw new Error(
    `Unsupported snapshot format (${unsupported}). Reassert this fact before saving.`,
  );
}

function singleState(state: TableFactSingleState) {
  return { value: state.value, state: snapshot(state.stateJson) };
}

function optionalState(state: TableFactOptionalSingleState) {
  return state.constructor === "none" ? null : singleState(state.some);
}

export function tableData(
  widgetId: string,
  state: TableState,
  facts: TableFact[],
) {
  return {
    widgetId,
    ...state,
    facts: facts.map((fact) => ({
      widgetId,
      factId: fact.factId,
      ...fact.identifier,
      layerStates: fact.state.layerStates.map((layer) => ({
        layerIdentifier: layer.layerIdentifier,
        rowState: optionalState(layer.rowState),
        columnState: optionalState(layer.columnState),
        selectedCellStates: layer.selectedCellStates.map(singleState),
      })),
      metadata: fact.metadata,
    })),
  };
}

export function associationTableData(
  widgetId: string,
  state: AssociationTableState,
  facts: AssociationTableFact[],
) {
  return {
    widgetId,
    rows: state.rows,
    facts: facts.map((fact) => ({
      widgetId,
      factId: fact.factId,
      rowId: fact.rowId,
      rowState: fact.state.map((cell) => ({
        columnIdentifier: cell.columnIdentifier,
        cellValue: cell.cellValue,
        cellState: snapshot(cell.stateJson),
      })),
      metadata: fact.metadata,
    })),
  };
}

export function assertionData(widgetId: string, facts: AssertionFact[]) {
  return {
    widgetId,
    facts: facts.map((fact) => ({
      widgetId,
      factId: fact.factId,
      assertionId: fact.assertionId,
      state: fact.state,
      metadata: fact.metadata,
    })),
  };
}

export function showDeclarationData(
  widgetId: string,
  facts: ShowDeclarationFact[],
) {
  return {
    facts: facts.map((fact) => ({
      widgetId,
      factId: fact.factId,
      state: fact.state,
      metadata: fact.metadata,
    })),
  };
}
