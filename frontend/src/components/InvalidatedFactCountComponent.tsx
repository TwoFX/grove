import { JSX } from "react";
import { InvalidatedFactCounts } from "@/lib/navigate/factcount";

export function InvalidatedFactCountComponent({
  invalidatedFacts,
  size = "lg",
}: {
  invalidatedFacts: InvalidatedFactCounts;
  size?: "sm" | "base" | "lg";
}): JSX.Element {
  const tooltipText = `${invalidatedFacts.newlyInvalidatedFacts} newly invalidated, ${invalidatedFacts.invalidatedFacts} invalidated, ${invalidatedFacts.badFacts} bad, ${invalidatedFacts.postponedFacts} postponed`;

  const sizeClass = `text-${size}`;

  return (
    <span className={sizeClass} title={tooltipText}>
      <span
        className={`font-bold ${invalidatedFacts.newlyInvalidatedFacts > 0 ? "text-status-error-text" : "text-text-tertiary"}`}
      >
        {invalidatedFacts.newlyInvalidatedFacts}
      </span>
      <span className="text-text-tertiary">|</span>
      <span
        className={`font-bold ${invalidatedFacts.invalidatedFacts > 0 ? "text-status-orange-text" : "text-text-tertiary"}`}
      >
        {invalidatedFacts.invalidatedFacts}
      </span>
      <span className="text-text-tertiary">|</span>
      <span
        className={`font-bold ${invalidatedFacts.badFacts > 0 ? "text-status-warning-text" : "text-text-tertiary"}`}
      >
        {invalidatedFacts.badFacts}
      </span>
      <span className="text-text-tertiary">|</span>
      <span
        className={`font-bold ${invalidatedFacts.postponedFacts > 0 ? "text-status-info-text" : "text-text-tertiary"}`}
      >
        {invalidatedFacts.postponedFacts}
      </span>
    </span>
  );
}
