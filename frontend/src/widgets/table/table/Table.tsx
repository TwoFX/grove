import {
  AssociationTableRow,
  TableAssociation,
  TableAssociationSource,
  TableDefinition,
  TableState,
} from "@/lib/transfer/project";
import { usePendingAssociationTableState } from "@/widgets/association-table/state/pending";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { produce } from "immer";
import { JSX } from "react";
import { BsCheck, BsChevronDown } from "react-icons/bs";

interface ListboxOption {
  key: string;
  displayShort: string;
}

function TableListbox({
  title,
  options,
  selectedOptions,
  setSelectedOptions,
  displayMode = "list",
}: {
  title: string;
  options: ListboxOption[];
  selectedOptions: string[];
  setSelectedOptions: (selectedOptions: string[]) => void;
  displayMode?: "title" | "list";
}): JSX.Element {
  const selectedCount = selectedOptions.length;

  let displayText: string;
  if (displayMode === "title") {
    displayText = `${selectedCount} ${title}${selectedCount === 1 ? "" : "s"}`;
  } else {
    // "list" mode
    if (selectedCount === 0) {
      displayText = `Select ${title}s`;
    } else {
      const selectedDisplayValues = selectedOptions
        .map(
          (key) => options.find((opt) => opt.key === key)?.displayShort || key,
        )
        .join(", ");
      displayText = selectedDisplayValues;
    }
  }

  return (
    <div className="relative min-w-[300px]">
      <Listbox value={selectedOptions} onChange={setSelectedOptions} multiple>
        <ListboxButton className="relative w-full cursor-pointer rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-left focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <span className="block truncate text-gray-900">{displayText}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <BsChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-200 bg-white py-1 shadow-lg focus:outline-none">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <ListboxOption
                key={option.key}
                value={option.key}
                className="relative cursor-pointer select-none py-2 pl-8 pr-3 hover:bg-gray-50 data-[focus]:bg-gray-100"
              >
                {({ selected }) => (
                  <>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <BsCheck className="h-4 w-4 text-black font-bold" />
                      </span>
                    )}
                    <span
                      className={`block truncate ${selected ? "font-bold" : "font-normal"}`}
                    >
                      {option.displayShort}
                    </span>
                  </>
                )}
              </ListboxOption>
            ))
          )}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

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

  const possibleRows: ListboxOption[] = rowAssociations.map((assoc) => ({
    key: assoc.id,
    displayShort: assoc.title,
  }));
  const possibleCols: ListboxOption[] = columnAssociations.map((assoc) => ({
    key: assoc.id,
    displayShort: assoc.title,
  }));

  return (
    <div className="flex flex-row gap-4">
      <TableListbox
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
      <TableListbox
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
      <TableListbox
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
