import { AssociationTable } from "@/lib/transfer/project";
import { JSX } from "react";

export function AssociationTableComponent({
  associationTable,
}: {
  associationTable: AssociationTable;
}): JSX.Element {
  return (
    <p>
      Hello, there is an association table with the id{" "}
      {associationTable.definition.widgetId},{" "}
      <a
        href={`/association/${associationTable.definition.widgetId}`}
        className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        yes please take me there.
      </a>
    </p>
  );
}
