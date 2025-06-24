import { StyledListbox, StyledListboxOption } from "@/components/StyledListbox";
import {
  AssociationTableRow,
  TableAssociation,
  TableAssociationSource,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import { produce } from "immer";
import { JSX } from "react";

function convertRow(source: AssociationTableRow): TableAssociation {
  return {
    id: source.uuid,
    title: source.title,
    layers: source.columns.map((cell) => ({
      layerIdentifier: cell.columnIdentifier,
      layerValue: cell.cellValue,
    })),
  };
}

function useAssociations(source: TableAssociationSource): TableAssociation[] {
  const pendingTableState = usePendingAssociationTableState();

  switch (source.constructor) {
    case "table":
      const state = pendingTableState(source.table);
      if (state) {
        return state.rows.map(convertRow);
      } else {
        return [];
      }
    case "const":
      return source.const.associations;
  }
}

export function Table({
  definition,
  state,
  setState,
}: {
  definition: TableDefinition;
  state: TableState;
  setState: (state: TableState) => void;
}): JSX.Element {
  const rowAssociations = useAssociations(definition.rowSource);
  const columnAssociations = useAssociations(definition.columnSource);

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
    <div className="flex flex-row gap-4">
      <StyledListbox
        title="Layer"
        options={definition.layerIdentifiers.map((id) => ({
          key: id,
          displayShort: id,
        }))}
        selectedOptions={state.selectedLayers}
        setSelectedOptions={(newSelectedLayers) =>
          setState(
            produce(state, (draft) => {
              draft.selectedLayers = newSelectedLayers;
            }),
          )
        }
        displayMode="list"
      />
      <StyledListbox
        title="Row"
        options={possibleRows}
        selectedOptions={state.selectedRowAssociations}
        setSelectedOptions={(newSelectedRows) =>
          setState(
            produce(state, (draft) => {
              draft.selectedRowAssociations = newSelectedRows;
            }),
          )
        }
        displayMode="title"
      />
      <StyledListbox
        title="Column"
        options={possibleCols}
        selectedOptions={state.selectedColumnAssociations}
        setSelectedOptions={(newSelectedColumns) =>
          setState(
            produce(state, (draft) => {
              draft.selectedColumnAssociations = newSelectedColumns;
            }),
          )
        }
        displayMode="title"
      />
    </div>
  );
  // Top bar: three dropdowns (rows, columns, layers)
}
