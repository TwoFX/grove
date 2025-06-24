import {
  DataKind,
  FactStatus,
  TableAssociation,
  TableCellOption,
  TableDefinition,
  TableFactIdentifier,
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
import { declarationName, declarationStateRepr } from "@/lib/transfer/util";
import { Fact } from "@/components/fact/Fact";

function buildFactId(identifier: TableFactIdentifier): string {
  return (
    identifier.rowAssociationId +
    ":::" +
    identifier.columnAssociationId +
    ":::" +
    identifier.selectedLayers.join("::")
  );
}

function buildFactIdentifier(
  rowAssociationId: string,
  columnAssociationId: string,
  state: TableState,
): TableFactIdentifier {
  return {
    rowAssociationId,
    columnAssociationId,
    selectedLayers: state.selectedLayers,
  };
}

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

function optionKey(context: GroveContextData, opt: TableCellOption): string {
  switch (opt.constructor) {
    case "declaration":
      return declarationName(context.declarations[opt.declaration]);
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

function buildLayerState(
  context: GroveContextData,
  templates: Templates,
  definition: TableDefinition,
  layerIdentifier: string,
  rowAssociation: TableAssociation,
  columnAssociation: TableAssociation,
  selectedCellOptions: TableSelectedCellOptions[],
): TableFactLayerState {
  const relevantOptions: TableCellOption[] = definition.cells
    .filter((forLayer) => forLayer.sourceLayerIdentifier === layerIdentifier)
    .flatMap((forLayer) =>
      forLayer.rows.filter(
        (forRowValue) => forRowValue.rowKey === rowAssociation.id,
      ),
    )
    .flatMap((forRowValue) =>
      forRowValue.cellEntries.filter(
        (cellEntry) => cellEntry.columnKey === columnAssociation.id,
      ),
    )
    .flatMap((cellEntry) => cellEntry.options);

  const relevantSelectedCellOptionIds =
    selectedCellOptions.find((opt) => opt.layerIdentifier === layerIdentifier)
      ?.selectedCellOptions ?? [];

  const relevantTableCellOptions = relevantSelectedCellOptionIds.map(
    (id) => relevantOptions.find((opt) => optionKey(context, opt) === id)!,
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
    selectedCellStates: relevantTableCellOptions.map((opt) =>
      tableCellOptionState(templates, context, opt, definition.cellKind),
    ),
  };
}

function buildFactState(
  context: GroveContextData,
  templates: Templates,
  definition: TableDefinition,
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
  state,
  selectedCell,
}: {
  definition: TableDefinition;
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
  const rowAssociations = useAssociations(definition.rowSource);
  const columnAssociations = useAssociations(definition.columnSource);

  const identifier = buildFactIdentifier(
    selectedCell.rowAssociationId,
    selectedCell.columnAssociationId,
    state,
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
    <Fact fact={fact && computeTableFactSummary(fact)} onAssert={onAssert} />
  );
}
