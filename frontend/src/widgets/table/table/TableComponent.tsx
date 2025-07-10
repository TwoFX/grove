import { JSX, useState } from "react";
import { LayerRowColumnSelector } from "./LayerRowColumnSelector";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { Table } from "./Table";
import { TableFactComponent } from "./TableFactComponent";
import { TableCellDetail } from "./TableCellDetail";
import { useAssociations } from "@/lib/state/association";
import { computeIndexableCellData } from "./preprocess";

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

  return (
    <div className="m-2 flex flex-col">
      <div className="flex gap-4 justify-between flex-none">
        <TableFactComponent
          definition={definition}
          cellData={indexableCellData}
          state={state}
          selectedCell={selectedCell}
        />
        <LayerRowColumnSelector
          definition={definition}
          state={state}
          setState={setState}
        />
      </div>
      <div className="flex-grow">
        <Table
          definition={definition}
          state={state}
          setSelectedCell={setSelectedCell}
          cellData={indexableCellData}
        />
      </div>
      {rowAssociation && columnAssociation && (
        <div className="flex-none">
          <TableCellDetail
            rowAssociation={rowAssociation}
            columnAssociation={columnAssociation}
            state={state}
            setState={setState}
            cellData={indexableCellData}
          />
        </div>
      )}
    </div>
  );
}
