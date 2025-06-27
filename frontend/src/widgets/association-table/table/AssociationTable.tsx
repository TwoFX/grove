"use client";

import "react-data-grid/lib/styles.css";
import {
  Column,
  DataGrid,
  RenderRowProps,
  SelectColumn,
  textEditor,
} from "react-data-grid";
import { JSX, useCallback, useContext, useState } from "react";
import { DraggableRowRenderer } from "./DraggableRowRenderer";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";
import {
  AssociationTableColumnDescription,
  AssociationTableFactCellState,
  AssociationTableRow,
  DataKind,
} from "@/lib/transfer/project";
import { GroveContext } from "@/lib/transfer/context";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { produce } from "immer";
import { AssociationTableFactComponent } from "../AssociationTableFactComponent";
import { Templates } from "@/lib/templates";
import { GroveTemplateContext } from "@/lib/templates/context";
import {
  columnDescriptionFor,
  optionFor,
  optionStateRepr,
  cellFor,
  optionDisplayShort,
  optionKey,
} from "../state/navigate";

function rowKeyGetter(row: AssociationTableRow) {
  return row.uuid;
}

function rowFactState(
  context: GroveContextData,
  templates: Templates,
  columnDefinitions: AssociationTableColumnDescription[],
  row: AssociationTableRow,
  dataKind: DataKind,
): AssociationTableFactCellState[] {
  return row.columns.flatMap((cell) => {
    const columnDescription = columnDescriptionFor(
      columnDefinitions,
      cell.columnIdentifier,
    );
    if (!columnDescription) {
      return [];
    }
    const option = optionFor(columnDescription, cell.cellValue);
    if (!option) {
      return [];
    }
    return [
      {
        cellValue: cell.cellValue,
        columnIdentifier: cell.columnIdentifier,
        stateRepr: optionStateRepr(context, templates, option, dataKind),
      },
    ];
  });
}

function updateRow(
  row: AssociationTableRow,
  columnIdent: string,
  newValue: string,
): AssociationTableRow {
  // TODO: performance
  const result = produce(row, (draft) => {
    let found = false;
    for (const col of draft.columns) {
      if (col.columnIdentifier === columnIdent) {
        col.cellValue = newValue;
        found = true;
      }
    }
    if (!found) {
      draft.columns.push({
        columnIdentifier: columnIdent,
        cellValue: newValue,
      });
    }
  });
  return result;
}

export function AssociationTable({
  widgetId,
  columnDefinitions,
  tableRows,
  setTableRows,
  dataKind,
  setSelectedCell,
}: {
  widgetId: string;
  columnDefinitions: AssociationTableColumnDescription[];
  tableRows: AssociationTableRow[];
  setTableRows: (rows: AssociationTableRow[]) => void;
  dataKind: DataKind;
  setSelectedCell: (selectedCell: {
    rowIdentifier: string;
    columnIdentifier: string;
  }) => void;
}): JSX.Element {
  const context = useContext(GroveContext);
  const templates = useContext(GroveTemplateContext);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const columns: Column<AssociationTableRow>[] = [
    SelectColumn,
    {
      key: "title",
      name: "Title",
      renderEditCell: textEditor,
    },
    ...columnDefinitions.map((columnDescription) => {
      return {
        key: columnDescription.identifier,
        name: columnDescription.shortDescription,
        renderCell: ({ row }: { row: AssociationTableRow }) => {
          const cell = cellFor(row, columnDescription.identifier);
          if (!cell) return null;
          const option = optionFor(columnDescription, cell.cellValue);
          return option ? optionDisplayShort(context, option) : cell.cellValue;
        },
        renderEditCell: ({
          row,
          onRowChange,
        }: {
          row: AssociationTableRow;
          onRowChange: (row: AssociationTableRow) => void;
        }) => (
          <select
            className="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={cellFor(row, columnDescription.identifier)?.cellValue}
            onChange={(e) =>
              onRowChange(
                updateRow(row, columnDescription.identifier, e.target.value),
              )
            }
          >
            <option value=""></option>
            {columnDescription.options.map((option) => (
              <option key={optionKey(option)} value={optionKey(option)}>
                {optionDisplayShort(context, option)}
              </option>
            ))}
          </select>
        ),
      };
    }),
    {
      key: "__grove_fact_column",
      name: "Fact",
      editable: false,
      renderCell: ({ row }) => {
        return (
          <AssociationTableFactComponent
            widgetId={widgetId}
            rowId={row.uuid}
            factId={row.uuid}
            newState={() =>
              rowFactState(context, templates, columnDefinitions, row, dataKind)
            }
          />
        );
      },
    },
  ];

  const renderRow = useCallback(
    (key: React.Key, props: RenderRowProps<AssociationTableRow>) => {
      function onRowReorder(fromIndex: number, toIndex: number) {
        const newRows = [...tableRows];
        newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0]);
        setTableRows(newRows);
      }

      return (
        <DraggableRowRenderer
          key={key}
          {...props}
          onRowReorder={onRowReorder}
        />
      );
    },
    [tableRows, setTableRows],
  );

  const addEmptyRow = () => {
    const emptyRow: AssociationTableRow = {
      uuid: uuidv4(),
      title: "",
      columns: [],
    };

    const newRows = [...tableRows, emptyRow];
    setTableRows(newRows);
  };

  const deleteSelectedRows = () => {
    const newRows = tableRows.filter((row) => !selectedRows.has(row.uuid));
    setTableRows(newRows);
  };

  const handleRowsChange = (rows: AssociationTableRow[]) => {
    setTableRows(rows);
  };

  const handleSelectionChange = (rows: ReadonlySet<string>) => {
    setSelectedRows(rows);
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex-grow">
        <DndProvider backend={HTML5Backend}>
          <DataGrid
            columns={columns}
            rows={tableRows}
            onRowsChange={handleRowsChange}
            renderers={{ renderRow }}
            selectedRows={selectedRows}
            onSelectedRowsChange={handleSelectionChange}
            rowKeyGetter={rowKeyGetter}
            className="h-full"
            onSelectedCellChange={({ row, column }) => {
              if (row) {
                setSelectedCell({
                  rowIdentifier: row.uuid,
                  columnIdentifier: column.key,
                });
              }
            }}
          />
        </DndProvider>
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={addEmptyRow}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Row
        </button>
        <button
          onClick={deleteSelectedRows}
          disabled={selectedRows.size === 0}
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Delete Selected Rows
        </button>
      </div>
    </div>
  );
}
