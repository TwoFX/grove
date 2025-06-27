import { LeafWidget } from "@/components/LeafWidget";
import { Table } from "@/lib/transfer/project";
import { JSX } from "react";

export function TableWidget({ table }: { table: Table }): JSX.Element {
  return (
    <LeafWidget
      id={table.definition.widgetId}
      widgetType="Table"
      title={table.definition.title}
      link="table"
    >
      <p>
        {table.definition.description || (
          <i>Table does not have a description.</i>
        )}
      </p>
    </LeafWidget>
  );
}
