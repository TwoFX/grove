import { LeafWidget } from "@/components/LeafWidget";
import { Table } from "@/lib/transfer/project";
import { JSX } from "react";

export function TableComponent({ table }: { table: Table }): JSX.Element {
  return (
    <LeafWidget
      id={table.definition.widgetId}
      widgetType="Table"
      title={table.definition.widgetId}
    >
      <>
        Hello, there is a table with the id {table.definition.widgetId},{" "}
        <a
          href={`/table/${table.definition.widgetId}`}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          yes please take me there.
        </a>
      </>
    </LeafWidget>
  );
}
