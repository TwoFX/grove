"use client";

import "react-data-grid/lib/styles.css";
import { Fact } from "@/components/fact/Fact";
import { FactSummary } from "@/lib/fact/summary";
import { useFactSummaries } from "@/lib/state/pending";
import { JSX, useContext } from "react";
import { Column, DataGrid } from "react-data-grid";
import { FiExternalLink } from "react-icons/fi";
import { GroveContextData } from "@/lib/transfer/contextdata";
import { GroveContext } from "@/lib/transfer/context";
import { isNewlyInvalidatedFact } from "@/lib/fact/invalidated";

function isFactInSection(
  context: GroveContextData,
  fact: FactSummary,
  sectionId: string,
): boolean {
  let cur: string | undefined = fact.widgetId;
  while (cur) {
    if (cur === sectionId) {
      return true;
    }
    cur = context.parentSection[cur];
  }

  return false;
}

export function FactPage({ sectionId }: { sectionId: string }): JSX.Element {
  const context = useContext(GroveContext);
  const factSummaries = useFactSummaries();

  const newlyInvalidatedFacts = factSummaries.filter(
    (fact) =>
      fact.validationResult.constructor === "invalidated" &&
      isNewlyInvalidatedFact(context, fact) &&
      isFactInSection(context, fact, sectionId),
  );
  const invalidatedFacts = factSummaries.filter(
    (fact) =>
      fact.validationResult.constructor === "invalidated" &&
      !isNewlyInvalidatedFact(context, fact) &&
      isFactInSection(context, fact, sectionId),
  );

  const facts = [...newlyInvalidatedFacts, ...invalidatedFacts];

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

  return <DataGrid columns={columns} rows={facts} />;
}
