"use client";

import { FactSummary } from "@/lib/fact/summary";
import { useFactSummaries } from "@/lib/state/pending";
import { JSX } from "react";

function FactSummaryComponent({
  factSummary,
}: {
  factSummary: FactSummary;
}): JSX.Element {
  return (
    <div>
      Summary for {factSummary.widgetId}/{factSummary.factId}
    </div>
  );
}

export default function Home(): JSX.Element {
  const factSummaries = useFactSummaries();

  const invalidatedFacts = factSummaries.filter(
    (fact) => fact.validationResult.constructor === "invalidated",
  );

  return (
    <ul>
      {invalidatedFacts.map((fact) => (
        <FactSummaryComponent
          key={fact.widgetId + "/" + fact.factId}
          factSummary={fact}
        />
      ))}
    </ul>
  );
}
