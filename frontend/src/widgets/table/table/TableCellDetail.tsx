import { JSX, useContext } from "react";
import {
  extractLayers,
  IndexableCellData,
  optionDisplayLong,
  optionDisplayShort,
  layerDataKey,
} from "./preprocess";
import {
  TableAssociation,
  TableCellOption,
  TableState,
} from "@/lib/transfer/project";
import { GroveContext } from "@/lib/transfer/context";
import { BsPin, BsTrash } from "react-icons/bs";
import { produce } from "immer";

function TableDetailEntry({
  cellOption,
  state,
  setState,
  selectedCellOptionsIndex,
  rowAssociationId,
  columnAssociationId,
  layerIdentifier,
  contained,
}: {
  cellOption: TableCellOption;
  state: TableState;
  setState: (state: TableState) => void;
  selectedCellOptionsIndex: number;
  rowAssociationId: string;
  columnAssociationId: string;
  layerIdentifier: string;
  contained: boolean;
}): JSX.Element {
  const context = useContext(GroveContext);

  const toggle: () => void = () => {
    if (contained) {
      setState(
        produce(state, (draft) => {
          const newSelectedOptions = draft.selectedCellOptions[
            selectedCellOptionsIndex
          ].selectedCellOptions.filter(
            (opt) => opt !== layerDataKey(cellOption),
          );

          if (newSelectedOptions.length === 0) {
            draft.selectedCellOptions.splice(selectedCellOptionsIndex, 1);
          } else {
            draft.selectedCellOptions[
              selectedCellOptionsIndex
            ].selectedCellOptions = newSelectedOptions;
          }
        }),
      );
    } else {
      if (selectedCellOptionsIndex === -1) {
        setState(
          produce(state, (draft) => {
            draft.selectedCellOptions.push({
              rowValue: rowAssociationId,
              columnValue: columnAssociationId,
              layerIdentifier: layerIdentifier,
              selectedCellOptions: [layerDataKey(cellOption)],
            });
          }),
        );
      } else {
        setState(
          produce(state, (draft) => {
            draft.selectedCellOptions[
              selectedCellOptionsIndex
            ].selectedCellOptions.push(layerDataKey(cellOption));
          }),
        );
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="cursor-pointer" onClick={toggle}>
        {contained ? <BsTrash size={18} /> : <BsPin size={18} />}
      </div>
      <pre className="font-mono mb-1">
        {optionDisplayLong(context, cellOption)}
      </pre>
    </div>
  );
}

function TableCellDetailForLayer({
  rowAssociation,
  columnAssociation,
  layerIdentifier,
  cellData,
  state,
  setState,
}: {
  rowAssociation: TableAssociation;
  columnAssociation: TableAssociation;
  layerIdentifier: string;
  cellData: IndexableCellData;
  state: TableState;
  setState: (state: TableState) => void;
}) {
  const context = useContext(GroveContext);

  const rowCol = extractLayers(
    cellData,
    layerIdentifier,
    rowAssociation,
    columnAssociation,
  );

  if (!rowCol) {
    return <></>;
  }

  const [rowLayer, , colLayer] = rowCol;

  const options =
    cellData.cellOptions[layerDataKey(rowLayer.data)]?.[
      layerDataKey(colLayer.data)
    ]?.[layerIdentifier];

  const selectedCellOptionsIndex = state.selectedCellOptions.findIndex(
    (op) =>
      op.rowValue === rowAssociation.id &&
      op.columnValue === columnAssociation.id &&
      op.layerIdentifier === layerIdentifier,
  );

  const selectedCellsSet = new Set(
    selectedCellOptionsIndex === -1
      ? []
      : state.selectedCellOptions[selectedCellOptionsIndex].selectedCellOptions,
  );

  return (
    <div className="overflow-y-auto border border-gray-200 flex flex-col gap-4">
      Expect: {optionDisplayShort(context, rowLayer.data)} to{" "}
      {optionDisplayShort(context, colLayer.data)}
      {options && (
        <>
          <div>
            Selected:
            {options
              .filter((opt) => selectedCellsSet.has(layerDataKey(opt)))
              .map((opt, index: number) => (
                <div
                  key={layerDataKey(opt)}
                  className={`overflow-y-auto ${index % 2 === 0 ? "bg-gray-100" : ""}`}
                >
                  <TableDetailEntry
                    cellOption={opt}
                    state={state}
                    setState={setState}
                    selectedCellOptionsIndex={selectedCellOptionsIndex}
                    rowAssociationId={rowAssociation.id}
                    columnAssociationId={columnAssociation.id}
                    layerIdentifier={layerIdentifier}
                    contained={true}
                  />
                </div>
              ))}
          </div>
          <div>
            Not selected:
            {options &&
              options
                .filter((opt) => !selectedCellsSet.has(layerDataKey(opt)))
                .map((opt, index: number) => (
                  <div
                    key={layerDataKey(opt)}
                    className={`overflow-y-auto ${index % 2 === 0 ? "bg-gray-100" : ""}`}
                  >
                    <TableDetailEntry
                      cellOption={opt}
                      state={state}
                      setState={setState}
                      selectedCellOptionsIndex={selectedCellOptionsIndex}
                      rowAssociationId={rowAssociation.id}
                      columnAssociationId={columnAssociation.id}
                      layerIdentifier={layerIdentifier}
                      contained={false}
                    />
                  </div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TableCellDetail({
  rowAssociation,
  columnAssociation,
  state,
  setState,
  cellData,
}: {
  rowAssociation: TableAssociation;
  columnAssociation: TableAssociation;
  state: TableState;
  setState: (state: TableState) => void;
  cellData: IndexableCellData;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-12">
      {state.selectedLayers.map((layerId) => (
        <TableCellDetailForLayer
          rowAssociation={rowAssociation}
          columnAssociation={columnAssociation}
          layerIdentifier={layerId}
          cellData={cellData}
          state={state}
          setState={setState}
          key={layerId}
        />
      ))}
    </div>
  );
}
