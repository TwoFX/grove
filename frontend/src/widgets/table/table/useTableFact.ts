import {
  DataKind,
  FactStatus,
  FactValidationResult,
  TableAssociation,
  TableAssociationLayer,
  TableCellOption,
  TableDefinition,
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
import { GroveTemplateContext } from "@/lib/templates/context";
import { Templates } from "@/lib/templates";
import { declarationStateRepr } from "@/lib/transfer/util";
import { buildFactId, buildFactIdentifier, tableFactStatesEqual } from "./fact";
import { extractLayers, IndexableCellData, layerDataKey } from "./preprocess";
import { FactSummary } from "@/lib/fact/summary";

function buildAssociationState(
  context: GroveContextData,
  templates: Templates,
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
          stateRepr: declarationStateRepr(
            templates,
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
          stateRepr: layer.data.other.stateRepr,
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
  templates: Templates,
  context: GroveContextData,
  opt: TableCellOption,
  dataKind: DataKind,
): TableFactSingleState {
  switch (opt.constructor) {
    case "declaration":
      return {
        stateRepr: declarationStateRepr(
          templates,
          context.declarations[opt.declaration],
          dataKind,
        ),
        value: opt.declaration,
      };
    case "other":
      return {
        stateRepr: opt.other.stateRepr,
        value: opt.other.value,
      };
  }
}

function computeSingleStates(
  context: GroveContextData,
  templates: Templates,
  definition: TableDefinition,
  cellData: IndexableCellData,
  layerIdentifier: string,
  selectedCellOptions: TableSelectedCellOptions[],
  rowLayer: TableAssociationLayer,
  colLayer: TableAssociationLayer,
): TableFactSingleState[] {
  const relevantOptions =
    cellData.cellOptions[layerDataKey(rowLayer.data)]?.[
      layerDataKey(colLayer.data)
    ]?.[layerIdentifier] ?? [];

  const relevantSelectedCellOptionIds =
    selectedCellOptions.find((opt) => opt.layerIdentifier === layerIdentifier)
      ?.selectedCellOptions ?? [];

  // Saved selections can refer to options that are no longer available.
  const relevantTableCellOptions = relevantSelectedCellOptionIds
    .map((id) => relevantOptions.find((opt) => optionKey(opt) === id))
    .filter((opt) => opt !== undefined);

  return relevantTableCellOptions.map((opt) =>
    tableCellOptionState(templates, context, opt, definition.cellKind),
  );
}

function buildLayerState(
  context: GroveContextData,
  templates: Templates,
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
      templates,
      definition.rowKind,
      layerIdentifier,
      rowAssociation,
    ),
    columnState: buildAssociationState(
      context,
      templates,
      definition.columnKind,
      layerIdentifier,
      columnAssociation,
    ),
    selectedCellStates: rowCol
      ? computeSingleStates(
          context,
          templates,
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
  templates: Templates,
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
        templates,
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

export function useAssertTableFact({
  definition,
  cellData,
}: {
  definition: TableDefinition;
  cellData: IndexableCellData;
}) {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const setPendingFact = useGroveStore((state) => state.setPendingTableFact);

  return (
    state: TableState,
    rowAssociation: TableAssociation,
    columnAssociation: TableAssociation,
    status: FactStatus,
    comment: string,
  ) => {
    const identifier = buildFactIdentifier(
      rowAssociation.id,
      columnAssociation.id,
      state.selectedLayers,
    );
    const factId = buildFactId(identifier);

    setPendingFact(context, definition.widgetId, factId, {
      widgetId: definition.widgetId,
      factId,
      metadata: { status, comment },
      identifier,
      state: buildFactState(
        context,
        templates,
        definition,
        cellData,
        rowAssociation,
        columnAssociation,
        state,
      ),
      validationResult: { constructor: "new" },
    });
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
  const templates = useContext(GroveTemplateContext);
  const pendingFact = usePendingTableFact();
  const assertTableFact = useAssertTableFact({ definition, cellData });
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
    templates,
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
