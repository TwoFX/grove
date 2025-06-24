import { JSX } from "react";
import { LayerRowColumnSelector } from "./LayerRowColumnSelector";
import { TableDefinition, TableState } from "@/lib/transfer/project";

export function TableComponent({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  return (
    <div className="m-2 space-y-2">
      <LayerRowColumnSelector
        definition={definition}
        state={state}
        setState={setState}
      />
      <div>Here is the rest of the stuff.</div>
    </div>
  );
}
