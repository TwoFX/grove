import {
  DataKind,
  FactStatus,
  FactValidationResult,
  TableAssociation,
  TableAssociationLayer,
  TableCellOption,
  TableDefinition,
  TableFact,
  TableFactLayerState,
  TableFactOptionalSingleState,
  TableFactSingleState,
  TableFactState,
  TableSelectedCellOptions,
  TableState,
} from "@/lib/transfer/project";
import { useContext } from "react";
import { computeTableFactSummary, usePendingTableFact } from "../state/pending";
import { useAssociations } from "@/lib/state/association";
import { useGroveStore } from "@/lib/state/state";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { GroveContext } from "@/lib/transfer/context";
import { declarationStateJson } from "@/lib/transfer/util";
import { buildFactId, buildFactIdentifier, tableFactStatesEqual } from "./fact";
import {
  extractLayers,
  IndexableCellData,
  lookupCellOptions,
} from "./preprocess";
import { FactSummary } from "@/lib/fact/summary";

function buildAssociationState(
  context: GroveContextData,
  dataKind: DataKind,
  layerIdentifier: string,
  assoc: TableAssociation,
): TableFactOptionalSingleState {
  const layer = assoc.layers.find(
    (lay) => lay.layerIdentifier === layerIdentifier,
  );

  if (!layer) {
    return { constructor: "none" };
  }

  switch (layer.data.constructor) {
    case "declaration":
      return {
        constructor: "some",
        some: {
          stateJson: declarationStateJson(
            context.declarations[layer.data.declaration],
            dataKind,
          ),
          value: layer.data.declaration,
        },
      };
    case "other":
      return {
        constructor: "some",
        some: {
          stateJson: layer.data.other.stateJson,
          value: layer.data.other.value,
        },
      };
  }
}

function optionKey(opt: TableCellOption): string {
  switch (opt.constructor) {
    case "declaration":
      return opt.declaration;
    case "other":
      return opt.other.value;
  }
}

function tableCellOptionState(
  context: GroveContextData,
  opt: TableCellOption,
  dataKind: DataKind,
): TableFactSingleState {
  switch (opt.constructor) {
    case "declaration":
      return {
        stateJson: declarationStateJson(
          context.declarations[opt.declaration],
          dataKind,
        ),
        value: opt.declaration,
      };
    case "other":
      return {
        stateJson: opt.other.stateJson,
        value: opt.other.value,
      };
  }
}

function computeSingleStates(
  context: GroveContextData,
  definition: TableDefinition,
  cellData: IndexableCellData,
  layerIdentifier: string,
  selectedCellOptions: TableSelectedCellOptions[],
  rowLayer: TableAssociationLayer,
  colLayer: TableAssociationLayer,
): TableFactSingleState[] {
  const relevantOptions =
    lookupCellOptions(cellData, layerIdentifier, rowLayer, colLayer) ?? [];

  const relevantSelectedCellOptionIds =
    selectedCellOptions.find((opt) => opt.layerIdentifier === layerIdentifier)
      ?.selectedCellOptions ?? [];

  // Saved selections can refer to options that are no longer available.
  const relevantTableCellOptions = relevantSelectedCellOptionIds
    .map((id) => relevantOptions.find((opt) => optionKey(opt) === id))
    .filter((opt) => opt !== undefined);

  return relevantTableCellOptions.map((opt) =>
    tableCellOptionState(context, opt, definition.cellKind),
  );
}

function buildLayerState(
  context: GroveContextData,
  definition: TableDefinition,
  cellData: IndexableCellData,
  layerIdentifier: string,
  rowAssociation: TableAssociation,
  columnAssociation: TableAssociation,
  selectedCellOptions: TableSelectedCellOptions[],
): TableFactLayerState {
  const rowCol = extractLayers(
    cellData,
    layerIdentifier,
    rowAssociation,
    columnAssociation,
  );

  return {
    layerIdentifier: layerIdentifier,
    rowState: buildAssociationState(
      context,
      definition.rowKind,
      layerIdentifier,
      rowAssociation,
    ),
    columnState: buildAssociationState(
      context,
      definition.columnKind,
      layerIdentifier,
      columnAssociation,
    ),
    selectedCellStates: rowCol
      ? computeSingleStates(
          context,
          definition,
          cellData,
          layerIdentifier,
          selectedCellOptions,
          rowCol[0],
          rowCol[2],
        )
      : [],
  };
}

function buildFactState(
  context: GroveContextData,
  definition: TableDefinition,
  cellData: IndexableCellData,
  rowAssociation: TableAssociation,
  columnAssociation: TableAssociation,
  state: TableState,
): TableFactState {
  const selectedCellOptions = state.selectedCellOptions.filter(
    (opt) =>
      opt.rowValue === rowAssociation.id &&
      opt.columnValue === columnAssociation.id,
  );

  return {
    layerStates: state.selectedLayers.map((layer) =>
      buildLayerState(
        context,
        definition,
        cellData,
        layer,
        rowAssociation,
        columnAssociation,
        selectedCellOptions,
      ),
    ),
  };
}

export function useTableFactAssertions({
  definition,
  cellData,
}: {
  definition: TableDefinition;
  cellData: IndexableCellData;
}) {
  const context = useContext(GroveContext);
  const setPendingFact = useGroveStore((state) => state.setPendingTableFact);
  const setPendingRow = useGroveStore((state) => state.setPendingTableRow);

  const buildFact = (
    state: TableState,
    rowAssociation: TableAssociation,
    columnAssociation: TableAssociation,
    status: FactStatus,
    comment: string,
  ): TableFact => {
    const identifier = buildFactIdentifier(
      rowAssociation.id,
      columnAssociation.id,
      state.selectedLayers,
    );
    const factId = buildFactId(identifier);

    return {
      widgetId: definition.widgetId,
      factId,
      metadata: { status, comment },
      identifier,
      state: buildFactState(
        context,
        definition,
        cellData,
        rowAssociation,
        columnAssociation,
        state,
      ),
      validationResult: { constructor: "new" },
    };
  };

  return {
    assertTableFact: (
      state: TableState,
      rowAssociation: TableAssociation,
      columnAssociation: TableAssociation,
      status: FactStatus,
      comment: string,
    ) => {
      const fact = buildFact(
        state,
        rowAssociation,
        columnAssociation,
        status,
        comment,
      );
      setPendingFact(context, definition.widgetId, fact.factId, fact);
    },
    assertTableRow: (
      state: TableState,
      rowAssociation: TableAssociation,
      columnAssociations: TableAssociation[],
    ) => {
      if (columnAssociations.length === 0) return;

      const facts = columnAssociations.map((columnAssociation) =>
        buildFact(
          state,
          rowAssociation,
          columnAssociation,
          FactStatus.Done,
          "",
        ),
      );
      setPendingRow(context, definition.widgetId, state, facts);
    },
  };
}

export function useTableFact({
  definition,
  cellData,
  state,
  selectedCell,
}: {
  definition: TableDefinition;
  cellData: IndexableCellData;
  state: TableState;
  selectedCell: {
    rowAssociationId: string;
    columnAssociationId: string;
  };
}):
  | {
      fact: FactSummary | undefined;
      onAssert: (status: FactStatus, comment: string) => void;
    }
  | undefined {
  const context = useContext(GroveContext);
  const pendingFact = usePendingTableFact();
  const { assertTableFact } = useTableFactAssertions({ definition, cellData });
  const associations = useAssociations();

  const rowAssociations = associations(definition.rowSource);
  const columnAssociations = associations(definition.columnSource);

  const identifier = buildFactIdentifier(
    selectedCell.rowAssociationId,
    selectedCell.columnAssociationId,
    state.selectedLayers,
  );

  const factId = buildFactId(identifier);

  const fact = pendingFact(definition.widgetId, factId);

  const rowAssociation = rowAssociations.find(
    (assoc) => assoc.id === selectedCell.rowAssociationId,
  );

  const columnAssociation = columnAssociations.find(
    (assoc) => assoc.id === selectedCell.columnAssociationId,
  );

  if (!rowAssociation || !columnAssociation) {
    return undefined;
  }

  const currentState: TableFactState = buildFactState(
    context,
    definition,
    cellData,
    rowAssociation,
    columnAssociation,
    state,
  );

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    assertTableFact(state, rowAssociation, columnAssociation, status, message);

  let factWithInvalidation: FactSummary | undefined;
  if (fact) {
    factWithInvalidation = computeTableFactSummary(context, associations, fact);
    if (
      factWithInvalidation.validationResult.constructor !== "invalidated" &&
      !tableFactStatesEqual(fact.state, currentState)
    ) {
      const newInvalidation: FactValidationResult = {
        constructor: "invalidated",
        invalidated: {
          shortDescription: "State changed",
          longDescription: "State was changed in the frontend",
        },
      };
      factWithInvalidation = {
        ...factWithInvalidation,
        validationResult: newInvalidation,
      };
    }
  } else {
    factWithInvalidation = undefined;
  }

  return { fact: factWithInvalidation, onAssert };
}
