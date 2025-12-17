import { StyledListbox, StyledListboxOption } from "@/components/StyledListbox";
import { useAssociations } from "@/lib/state/association";
import { TableDefinition, TableState } from "@/lib/transfer/project";
import { produce } from "immer";
import { JSX } from "react";

function FreeLayerSelector({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  return (
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
  );
}

function LayerCombinationSelector({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  const combinations =
    definition.allowedLayerCombinations.constructor === "some"
      ? definition.allowedLayerCombinations.some.allowedLayerCombinations
      : [];

  // Create a unique key for each combination by joining layer identifiers
  const combinationOptions: StyledListboxOption[] = combinations.map((combo, index) => ({
    key: `combo-${index}`,
    displayShort: combo.layerIdentifiers.join(", "),
  }));

  // Find the currently selected combination based on state.selectedLayers
  const findSelectedCombination = (): string[] => {
    const selectedSet = new Set(state.selectedLayers);
    const matchingIndex = combinations.findIndex((combo) => {
      return (
        combo.layerIdentifiers.length === state.selectedLayers.length &&
        combo.layerIdentifiers.every((id) => selectedSet.has(id))
      );
    });
    return matchingIndex >= 0 ? [`combo-${matchingIndex}`] : [];
  };

  return (
    <StyledListbox
      title="Layer Combination"
      options={combinationOptions}
      selectedOptions={findSelectedCombination()}
      setSelectedOptions={(selectedKeys) => {
        if (selectedKeys.length > 0) {
          const index = parseInt(selectedKeys[0].replace("combo-", ""), 10);
          const selectedCombination = combinations[index];
          setState(
            produce(state, (draft) => {
              draft.selectedLayers = selectedCombination.layerIdentifiers;
            }),
          );
        }
      }}
      displayMode="list"
      multiple={false}
    />
  );
}

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

  // Determine which layer selector to use
  const layerSelector =
    definition.allowedLayerCombinations.constructor === "some" ? (
      <LayerCombinationSelector
        definition={definition}
        state={state}
        setState={setState}
      />
    ) : (
      <FreeLayerSelector definition={definition} state={state} setState={setState} />
    );

  return (
    <div className="flex flex-row gap-2">
      {layerSelector}
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
