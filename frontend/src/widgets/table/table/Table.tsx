import { useAssociations } from "@/lib/state/association";
import "react-data-grid/lib/styles.css";
import {
  TableAssociation,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { JSX } from "react";
import { Column, DataGrid, RenderCellProps } from "react-data-grid";

interface Row {
  rowAssociationId: string;
  "left-hand": string;
}

export function Table({
  definition,
  state,
  setSelectedCell,
}: {
  definition: TableDefinition;
  state: TableState;
  setSelectedCell: (selectedCell: {
    rowAssociationId: string;
    columnAssociationId: string;
  }) => void;
}): JSX.Element {
  const rowAssociations = useAssociations(definition.rowSource);
  const columnAssociations = useAssociations(definition.columnSource);

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
        maxWidth: 60,
        name: assoc.title,
        renderHeaderCell({ column }: { column: Column<Row> }) {
          return <div className="rotate-90">{column.name}</div>;
        },
        renderCell({ row, column }: RenderCellProps<Row>) {
          const left: TableAssociation | undefined = rowAssociationsById.get(
            row.rowAssociationId,
          );
          const right: TableAssociation | undefined =
            columnAssociationsById.get(column.key);
          if (left && right) {
            return (
              <div className="h-full w-full justify-center items-center flex">
                <span>a</span>
              </div>
            );
          } else {
            return <div className="h-full w-full bg-amber-300 flex">b</div>;
          }
        },
      })),
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
      className="h-full"
      rowKeyGetter={(row) => row.rowAssociationId}
      headerRowHeight={200}
      onSelectedCellChange={({ row, column }) => {
        if (row) {
          setSelectedCell({
            rowAssociationId: row?.rowAssociationId,
            columnAssociationId: column.key,
          });
        }
      }}
    />
  );
}
