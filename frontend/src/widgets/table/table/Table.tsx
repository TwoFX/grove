import { useAssociations } from "@/lib/state/association";
import "react-data-grid/lib/styles.css";
import "./table-overrides.css";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { JSX } from "react";
import { Column, DataGrid, RenderCellProps } from "react-data-grid";
import { IndexableCellData } from "./preprocess";
import { TableCell } from "./TableCell";

interface Row {
  rowAssociationId: string;
  "left-hand": string;
}

export function Table({
  definition,
  cellData,
  state,
  setSelectedCell,
}: {
  definition: TableDefinition;
  cellData: IndexableCellData;
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
          const rowAssociation = rowAssociationsById.get(row.rowAssociationId);
          const columnAssociation = columnAssociationsById.get(column.key);

          return (
            <TableCell
              widgetId={definition.widgetId}
              selectedLayers={state.selectedLayers}
              cellData={cellData}
              rowAssociation={rowAssociation}
              columnAssociation={columnAssociation}
            />
          );
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
