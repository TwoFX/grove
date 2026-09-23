import { JSX, KeyboardEvent, useMemo, useState } from "react";
import { LayerRowColumnSelector } from "./LayerRowColumnSelector";
import {
  FactStatus,
  TableAssociation,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { Fact } from "@/components/fact/Fact";
import { Table } from "./Table";
import { useTableFactAssertions, useTableFact } from "./useTableFact";
import { TableCellDetail } from "./TableCellDetail";
import { useAssociations } from "@/lib/state/association";
import {
  computeIndexableCellData,
  extractLayers,
  layerDataKey,
  lookupCellOptions,
} from "./preprocess";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { produce } from "immer";

export function TableComponent({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  const associations = useAssociations();
  const [factDialogOpen, setFactDialogOpen] = useState(false);

  const rowAssociations = associations(definition.rowSource);
  const columnAssociations = associations(definition.columnSource);

  const [selectedCell, setSelectedCell] = useState({
    rowAssociationId: "",
    columnAssociationId: "",
  });

  const rowAssociation = rowAssociations.find(
    (assoc) => assoc.id === selectedCell.rowAssociationId,
  );
  const columnAssociation = columnAssociations.find(
    (assoc) => assoc.id === selectedCell.columnAssociationId,
  );

  const indexableCellData = useMemo(
    () => computeIndexableCellData(definition.cells),
    [definition.cells]
  );
  const { assertTableRow } = useTableFactAssertions({
    definition,
    cellData: indexableCellData,
  });
  const tableFact = useTableFact({
    definition,
    cellData: indexableCellData,
    state,
    selectedCell,
  });

  const selectFirstOptions = (
    rowAssociation: TableAssociation,
    columns: TableAssociation[],
  ): TableState =>
    produce(state, (draft) => {
      for (const columnAssociation of columns) {
        for (const layerIdentifier of state.selectedLayers) {
          const layers = extractLayers(
            indexableCellData,
            layerIdentifier,
            rowAssociation,
            columnAssociation,
          );
          if (!layers) continue;

          const [rowLayer, , columnLayer] = layers;
          const firstOption = lookupCellOptions(
            indexableCellData,
            layerIdentifier,
            rowLayer,
            columnLayer,
          )?.[0];
          if (!firstOption) continue;

          const optionId = layerDataKey(firstOption);
          const selection = draft.selectedCellOptions.find(
            (opt) =>
              opt.rowValue === rowAssociation.id &&
              opt.columnValue === columnAssociation.id &&
              opt.layerIdentifier === layerIdentifier,
          );

          if (selection) {
            if (!selection.selectedCellOptions.includes(optionId)) {
              selection.selectedCellOptions.push(optionId);
            }
          } else {
            draft.selectedCellOptions.push({
              rowValue: rowAssociation.id,
              columnValue: columnAssociation.id,
              layerIdentifier,
              selectedCellOptions: [optionId],
            });
          }
        }
      }
    });

  const assertRow = (rowAssociationId: string) => {
    const rowAssociation = rowAssociations.find(
      (assoc) => assoc.id === rowAssociationId,
    );
    if (!rowAssociation) return;

    const columns = columnAssociations.filter((assoc) =>
      state.selectedColumnAssociations.includes(assoc.id),
    );
    const nextState = selectFirstOptions(rowAssociation, columns);
    assertTableRow(nextState, rowAssociation, columns);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !tableFact ||
      !rowAssociation ||
      !columnAssociation ||
      !state.selectedRowAssociations.includes(rowAssociation.id) ||
      !state.selectedColumnAssociations.includes(columnAssociation.id) ||
      event.defaultPrevented ||
      !event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      !event.currentTarget.contains(target) ||
      target.isContentEditable ||
      target.closest(
        'input, textarea, select, [role="textbox"], [role="dialog"], [role="alertdialog"], [role="listbox"]',
      )
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key !== "enter" && key !== "k" && key !== "j") return;

    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;

    if (key === "enter") {
      setFactDialogOpen(true);
    } else if (key === "k") {
      tableFact.onAssert(FactStatus.Done, "");
    } else if (key === "j") {
      const nextState = selectFirstOptions(rowAssociation, [columnAssociation]);
      if (nextState !== state) setState(nextState);
    }
  };

  return (
    <div className="p-2 h-full" onKeyDownCapture={handleKeyDown}>
      <PanelGroup direction="vertical">
        <Panel defaultSize={50} minSize={20} className="flex flex-col h-full">
          <div className="flex gap-4 justify-between flex-none">
            {tableFact ? (
              <Fact
                fact={tableFact.fact}
                onAssert={tableFact.onAssert}
                open={factDialogOpen}
                onOpenChange={setFactDialogOpen}
              />
            ) : (
              <div>Cannot assert fact for this.</div>
            )}
            <LayerRowColumnSelector
              definition={definition}
              state={state}
              setState={setState}
            />
          </div>
          <div className="flex-1 min-h-0">
            <Table
              definition={definition}
              state={state}
              setSelectedCell={setSelectedCell}
              cellData={indexableCellData}
              onAssertRow={assertRow}
            />
          </div>
        </Panel>
        {rowAssociation && columnAssociation && (
          <>
            <PanelResizeHandle className="h-1 bg-border hover:bg-primary cursor-row-resize transition-colors" />
            <Panel defaultSize={50} minSize={20} className="flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                <TableCellDetail
                  rowAssociation={rowAssociation}
                  columnAssociation={columnAssociation}
                  state={state}
                  setState={setState}
                  cellData={indexableCellData}
                />
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
