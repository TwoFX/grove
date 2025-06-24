import { JSX, useState } from "react";
import { LayerRowColumnSelector } from "./LayerRowColumnSelector";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { Table } from "./Table";
import { TableFactComponent } from "./TableFactComponent";

export function TableComponent({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  const [selectedCell, setSelectedCell] = useState({
    rowAssociationId: "",
    columnAssociationId: "",
  });

  return (
    <div className="m-2 flex flex-col">
      <div className="flex gap-4 justify-between flex-none">
        <TableFactComponent
          definition={definition}
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
        />
      </div>
      <div className="flex-none">
        Selected: ({selectedCell.rowAssociationId},{" "}
        {selectedCell.columnAssociationId}).
      </div>
    </div>
  );
}
