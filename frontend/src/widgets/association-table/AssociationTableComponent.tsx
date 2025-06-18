import { AssociationTable } from "@/lib/transfer/project";
import { JSX } from "react";

export function AssociationTableComponent({
  associationTable,
}: {
  associationTable: AssociationTable;
}): JSX.Element {
  return <p>{associationTable.definition.widgetId}</p>;
}
