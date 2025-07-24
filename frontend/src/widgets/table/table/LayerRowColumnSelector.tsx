import { StyledListbox, StyledListboxOption } from "@/components/StyledListbox";
import { useAssociations } from "@/lib/state/association";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { produce } from "immer";
import { JSX } from "react";

export function LayerRowColumnSelector({
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

  const possibleRows: StyledListboxOption[] = rowAssociations.map((assoc) => ({
    key: assoc.id,
    displayShort: assoc.title,
  }));
  const possibleCols: StyledListboxOption[] = columnAssociations.map(
    (assoc) => ({
      key: assoc.id,
      displayShort: assoc.title,
    }),
  );

  return (
    <div className="flex flex-row gap-2">
      <StyledListbox
        title="Layer"
        options={definition.layerIdentifiers.map((id) => ({
          key: id,
          displayShort: id,
        }))}
        selectedOptions={state.selectedLayers}
        setSelectedOptions={(newSelectedLayers) => {
          const uniqueLayers = new Set(newSelectedLayers);
          setState(
            produce(state, (draft) => {
              // Make sure that selectedLayers always has the same order as layerIdentifiers
              draft.selectedLayers = definition.layerIdentifiers.filter((id) =>
                uniqueLayers.has(id),
              );
            }),
          );
        }}
        displayMode="list"
      />
      <StyledListbox
        title="Row"
        options={possibleRows}
        selectedOptions={state.selectedRowAssociations}
        setSelectedOptions={(newSelectedRows) => {
          const uniqueRows = new Set(newSelectedRows);
          setState(
            produce(state, (draft) => {
              // Make sure that selectedRowAssociations always has the same order as rowAssociations
              draft.selectedRowAssociations = rowAssociations
                .map((assoc) => assoc.id)
                .filter((id) => uniqueRows.has(id));
            }),
          );
        }}
        displayMode="title"
      />
      <StyledListbox
        title="Column"
        options={possibleCols}
        selectedOptions={state.selectedColumnAssociations}
        setSelectedOptions={(newSelectedColumns) => {
          const uniqueColumns = new Set(newSelectedColumns);
          setState(
            produce(state, (draft) => {
              // Make sure that selectedColumnAssociations always has the same order as columnAssociations
              draft.selectedColumnAssociations = columnAssociations
                .map((assoc) => assoc.id)
                .filter((id) => uniqueColumns.has(id));
            }),
          );
        }}
        displayMode="title"
      />
    </div>
  );
}
