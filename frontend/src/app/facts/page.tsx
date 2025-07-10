"use client";

import "react-data-grid/lib/styles.css";
import { Fact } from "@/components/fact/Fact";
import { FactSummary } from "@/lib/fact/summary";
import { useFactSummaries } from "@/lib/state/pending";
import { JSX } from "react";
import { Column, DataGrid } from "react-data-grid";
import { FiExternalLink } from "react-icons/fi";

export default function Home(): JSX.Element {
  const factSummaries = useFactSummaries();

  const invalidatedFacts = factSummaries.filter(
    (fact) => fact.validationResult.constructor === "invalidated",
  );

  const columns: Column<FactSummary>[] = [
    {
      key: "__grove_link_column",
      name: "Go",
      width: 20,
      renderCell: ({ row }) => (
        <a href={row.href}>
          <FiExternalLink />
        </a>
      ),
    },
    { key: "widgetTitle", name: "Widget title", width: 500, resizable: true },
    {
      key: "summary",
      name: "Location",
      width: 500,
      resizable: true,
    },
    {
      key: "__grove_fact_column",
      name: "Fact",
      renderCell: ({ row }) => <Fact fact={row} onAssert={undefined} />,
    },
  ];

  return (
    <DataGrid columns={columns} rows={invalidatedFacts} />
    // <ul>
    //   {invalidatedFacts.map((fact) => (
    //     <FactSummaryComponent
    //       key={fact.widgetId + "/" + fact.factId}
    //       factSummary={fact}
    //     />
    //   ))}
    // </ul>
  );
}
