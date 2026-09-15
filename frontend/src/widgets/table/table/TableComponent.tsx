import { JSX, KeyboardEvent, useState } from "react";
import { LayerRowColumnSelector } from "./LayerRowColumnSelector";
import {
  FactStatus,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { Fact } from "@/components/fact/Fact";
import { Table } from "./Table";
import { useTableFact } from "./useTableFact";
import { TableCellDetail } from "./TableCellDetail";
import { useAssociations } from "@/lib/state/association";
import { computeIndexableCellData } from "./preprocess";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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

  const indexableCellData = computeIndexableCellData(definition.cells);
  const tableFact = useTableFact({
    definition,
    cellData: indexableCellData,
    state,
    selectedCell,
  });

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

    if (event.key !== "Enter" && event.key.toLowerCase() !== "k") return;

    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;

    if (event.key === "Enter") {
      setFactDialogOpen(true);
    } else {
      tableFact.onAssert(FactStatus.Done, "");
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
