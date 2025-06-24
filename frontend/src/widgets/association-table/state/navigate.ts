import { Templates } from "@/lib/templates";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  AssociationTableColumnDescription,
  AssociationTableCellOption,
  DataKind,
  AssociationTableRow,
  AssociationTableCell,
} from "@/lib/transfer/project";
import {
  declarationName,
  declarationDisplayShort,
  declarationStateRepr,
} from "@/lib/transfer/util";

export function columnDescriptionFor(
  columnDescriptions: AssociationTableColumnDescription[],
  columnIdentifier: string,
): AssociationTableColumnDescription | undefined {
  // TODO: performance
  return columnDescriptions.find(
    (descr) => descr.identifier === columnIdentifier,
  );
}

export function optionFor(
  context: GroveContextData,
  columnDescription: AssociationTableColumnDescription,
  cellValue: string,
): AssociationTableCellOption | undefined {
  // TODO: performance
  return columnDescription.options.find(
    (opt) => optionKey(context, opt) === cellValue,
  );
}

export function optionKey(
  context: GroveContextData,
  opt: AssociationTableCellOption,
): string {
  switch (opt.constructor) {
    case "declaration":
      return declarationName(context.declarations[opt.declaration]);
    case "other":
      return opt.other.value;
  }
}

export function optionDisplayShort(
  context: GroveContextData,
  opt: AssociationTableCellOption,
): string {
  switch (opt.constructor) {
    case "declaration":
      return declarationDisplayShort(context.declarations[opt.declaration]);
    case "other":
      return opt.other.shortDescription;
  }
}

export function optionStateRepr(
  context: GroveContextData,
  templates: Templates,
  opt: AssociationTableCellOption,
  dataKind: DataKind,
): string {
  switch (opt.constructor) {
    case "declaration":
      return declarationStateRepr(
        templates,
        context.declarations[opt.declaration],
        dataKind,
      );
    case "other":
      return opt.other.stateRepr;
  }
}

export function cellFor(
  row: AssociationTableRow,
  columnIdent: string,
): AssociationTableCell | undefined {
  // TODO: performance
  return row.columns.find((col) => col.columnIdentifier === columnIdent);
}
