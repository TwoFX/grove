"use client";

import "react-data-grid/lib/styles.css";
import { BreadcrumbContext } from "@/lib/navigate/breadcrumb";
import { GroveContext } from "@/lib/transfer/context";
import { AssertionResult } from "@/lib/transfer/project";
import { AssertionFactComponent } from "@/widgets/assertion/AssertionFactComponent";
import { useContext, useEffect } from "react";
import { Column, DataGrid } from "react-data-grid";
import { BsCheck } from "react-icons/bs";
import { ImCross } from "react-icons/im";

export function AssertionPage({ widgetId }: { widgetId: string }) {
  const context = useContext(GroveContext);
  const { setBreadcrumb } = useContext(BreadcrumbContext);

  const definition = context.assertionDefinition.byId[widgetId];

  if (!definition) {
    throw new Error("Unknown assertion");
  }

  useEffect(() => {
    setBreadcrumb({
      id: definition.widgetId,
      title: definition.title,
    });
  }, [setBreadcrumb, definition]);

  const columns: Column<AssertionResult>[] = [
    { key: "assertionId", name: "ID", resizable: true },
    { key: "description", name: "Description", resizable: true },
    {
      key: "passed",
      name: "Pass?",
      renderCell: ({ row }) => (row.passed ? <BsCheck /> : <ImCross />),
      resizable: true,
      width: 70,
    },
    { key: "message", name: "Message", resizable: true },
    {
      key: "__grove_fact_column",
      name: "Fact",
      renderCell: ({ row }) => (
        <AssertionFactComponent
          widgetId={widgetId}
          factId={row.assertionId}
          assertionId={row.assertionId}
          newState={row}
        />
      ),
      resizable: true,
    },
  ];

  return (
    <div>
      <div>{definition.description}</div>
      <DataGrid rows={definition.results} columns={columns} />
    </div>
  );
}
