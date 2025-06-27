import { Templates } from "@/lib/templates";
import { GroveContextData } from "@/lib/transfer/contextdata";
import {
  AssociationTableColumnDescription,
  AssociationTableCellOption,
  DataKind,
  AssociationTableRow,
  AssociationTableCell,
  Reference,
} from "@/lib/transfer/project";
import {
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
  columnDescription: AssociationTableColumnDescription,
  cellValue: string,
): AssociationTableCellOption | undefined {
  // TODO: performance
  return columnDescription.options.find((opt) => optionKey(opt) === cellValue);
}

export function optionKey(opt: AssociationTableCellOption): string {
  switch (opt.constructor) {
    case "declaration":
      return opt.declaration;
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

export function optionReference(option: AssociationTableCellOption): Reference {
  switch (option.constructor) {
    case "declaration":
      return {
        constructor: "declaration",
        declaration: option.declaration,
      };
    case "other":
      return option.other.reference;
  }
}

export function cellFor(
  row: AssociationTableRow,
  columnIdent: string,
): AssociationTableCell | undefined {
  // TODO: performance
  return row.columns.find((col) => col.columnIdentifier === columnIdent);
}
