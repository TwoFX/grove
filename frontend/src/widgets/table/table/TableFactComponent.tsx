import {
  DataKind,
  FactStatus,
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
import { JSX, useContext } from "react";
import { computeTableFactSummary, usePendingTableFact } from "../state/pending";
import { useAssociations } from "@/lib/state/association";
import { useGroveStore } from "@/lib/state/state";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { GroveContext } from "@/lib/transfer/context";
import { GroveTemplateContext } from "@/lib/templates/context";
import { Templates } from "@/lib/templates";
import { declarationStateRepr } from "@/lib/transfer/util";
import { Fact } from "@/components/fact/Fact";
import { buildFactId, buildFactIdentifier } from "./fact";
import { extractLayers, IndexableCellData, layerDataKey } from "./preprocess";

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

  const relevantTableCellOptions = relevantSelectedCellOptionIds.map(
    (id) => relevantOptions.find((opt) => optionKey(opt) === id)!,
  );

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
  selectedCellOptions: TableSelectedCellOptions[],
  selectedLayers: string[],
): TableFactState {
  return {
    layerStates: selectedLayers.map((layer) =>
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

export function TableFactComponent({
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
}): JSX.Element {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const pendingFact = usePendingTableFact();
  const setPendingFact = useGroveStore((state) => state.setPendingTableFact);
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
    return <div>Cannot assert fact for this.</div>;
  }

  const selectedCellOptions = state.selectedCellOptions.filter(
    (opt) =>
      opt.rowValue === selectedCell.rowAssociationId &&
      opt.columnValue === selectedCell.columnAssociationId,
  );

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(definition.widgetId, factId, {
      widgetId: definition.widgetId,
      factId: factId,
      metadata: { status: status, comment: message },
      identifier: identifier,
      state: buildFactState(
        context,
        templates,
        definition,
        cellData,
        rowAssociation,
        columnAssociation,
        selectedCellOptions,
        state.selectedLayers,
      ),
      validationResult: {
        constructor: "new",
      },
    });

  return (
    <Fact
      fact={fact && computeTableFactSummary(context, associations, fact)}
      onAssert={onAssert}
    />
  );
}
