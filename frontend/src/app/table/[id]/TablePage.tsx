"use client";

import { useGroveStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { usePendingTableState } from "@/widgets/table/state/pending";
import { Table } from "@/widgets/table/table/Table";
import { JSX, useContext } from "react";

export function TablePage({ widgetId }: { widgetId: string }): JSX.Element {
  const context = useContext(GroveContext);
  const tableState = usePendingTableState()(widgetId);
  const setTableState = useGroveStore((state) => state.setPendingTableState);

  if (!tableState) {
    throw new Error("Unknown table");
  }

  const tableDefinition = context.tableDefinition.byId[widgetId];

  return (
    <Table
      definition={tableDefinition}
      state={tableState}
      setState={(state) => setTableState(widgetId, state)}
    />
  );
}
