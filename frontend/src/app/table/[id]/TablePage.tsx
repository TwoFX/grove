"use client";

import { BreadcrumbContext } from "@/lib/navigate/breadcrumb";
import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { usePendingTableState } from "@/widgets/table/state/pending";
import { TableComponent } from "@/widgets/table/table/TableComponent";
import { JSX, useContext, useEffect } from "react";

export function TablePage({ widgetId }: { widgetId: string }): JSX.Element {
  const context = useContext(GroveContext);
  const tableState = usePendingTableState()(widgetId);
  const setTableState = useGroveStore((state) => state.setPendingTableState);
  const { setBreadcrumb } = useContext(BreadcrumbContext);

  if (!tableState) {
    throw new Error("Unknown table");
  }

  const tableDefinition = context.tableDefinition.byId[widgetId];

  useEffect(() => {
    setBreadcrumb({
      id: tableDefinition.widgetId,
      title: tableDefinition.title,
    });
  }, [setBreadcrumb, tableDefinition]);

  return (
    <TableComponent
      definition={tableDefinition}
      state={tableState}
      setState={(state) => setTableState(context, widgetId, state)}
    />
  );
}
