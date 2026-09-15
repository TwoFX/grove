import { useAssociations } from "@/lib/state/association";
import "react-data-grid/lib/styles.css";
import "./table-overrides.css";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { JSX } from "react";
import { Column, DataGrid, RenderCellProps } from "react-data-grid";
import { IndexableCellData } from "./preprocess";
import { TableCell } from "./TableCell";
import { BsCheckLg } from "react-icons/bs";

interface Row {
  rowAssociationId: string;
  "left-hand": string;
}

export function Table({
  definition,
  cellData,
  state,
  setSelectedCell,
  onAssertRow,
}: {
  definition: TableDefinition;
  cellData: IndexableCellData;
  state: TableState;
  onAssertRow: (rowAssociationId: string) => void;
  setSelectedCell: (selectedCell: {
    rowAssociationId: string;
    columnAssociationId: string;
  }) => void;
}): JSX.Element {
  const associations = useAssociations();

  const rowAssociations = associations(definition.rowSource);
  const columnAssociations = associations(definition.columnSource);

  const rowAssociationsById = new Map(
    rowAssociations.map((row) => [row.id, row]),
  );
  const columnAssociationsById = new Map(
    columnAssociations.map((column) => [column.id, column]),
  );

  const selectedRowAssociationIds = new Set(state.selectedRowAssociations);
  const selectedColumnAssociationIds = new Set(
    state.selectedColumnAssociations,
  );

  const columns: Column<Row>[] = [
    { name: "", key: "left-hand", resizable: true },
    ...columnAssociations
      .filter((assoc) => selectedColumnAssociationIds.has(assoc.id))
      .map((assoc) => ({
        key: assoc.id,
        minWidth: 60,
        maxWidth: 100,
        resizable: true,
        name: assoc.title,
        renderHeaderCell({ column }: { column: Column<Row> }) {
          return <div className="rotate-90">{column.name}</div>;
        },
        renderCell({ row, column }: RenderCellProps<Row>) {
          const rowAssociation = rowAssociationsById.get(row.rowAssociationId);
          const columnAssociation = columnAssociationsById.get(column.key);

          return (
            <TableCell
              definition={definition}
              state={state}
              cellData={cellData}
              rowAssociation={rowAssociation}
              columnAssociation={columnAssociation}
            />
          );
        },
      })),
    {
      key: "assert-row",
      name: "",
      width: 44,
      renderHeaderCell: () => <span className="sr-only">Row actions</span>,
      renderCell({ row, tabIndex }) {
        return (
          <button
            type="button"
            className="flex h-full w-full items-center justify-center cursor-pointer hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
            tabIndex={tabIndex}
            title="Select first options and assert every cell in this row as done"
            aria-label={`Select first options and assert every cell in ${row["left-hand"]} as done`}
            onClick={(event) => {
              event.stopPropagation();
              onAssertRow(row.rowAssociationId);
            }}
          >
            <BsCheckLg aria-hidden="true" />
          </button>
        );
      },
    },
  ];

  const rows: Row[] = rowAssociations
    .filter((assoc) => selectedRowAssociationIds.has(assoc.id))
    .map((assoc) => ({
      rowAssociationId: assoc.id,
      "left-hand": assoc.title,
    }));

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      style={{ height: "100%" }}
      rowKeyGetter={(row) => row.rowAssociationId}
      headerRowHeight={200}
      onSelectedCellChange={({ row, column }) => {
        setSelectedCell({
          rowAssociationId: row?.rowAssociationId ?? "",
          columnAssociationId: row ? column.key : "",
        });
      }}
    />
  );
}
