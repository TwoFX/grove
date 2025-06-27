import { LeafWidget } from "@/components/LeafWidget";
import { AssociationTable } from "@/lib/transfer/project";
import { JSX } from "react";

export function AssociationTableComponent({
  associationTable,
}: {
  associationTable: AssociationTable;
}): JSX.Element {
  return (
    <LeafWidget
      id={associationTable.definition.widgetId}
      widgetType="Association table"
      title={associationTable.definition.title}
      link="association"
    >
      <p>
        {associationTable.definition.description || (
          <i>Association table does not have a description.</i>
        )}
      </p>
    </LeafWidget>
  );
}
