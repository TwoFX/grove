import { useCountPendingChanges } from "@/lib/state/pending";
import { useGroveStore } from "@/lib/state/state";
import { JSX } from "react";
import { BsFillTrash3Fill } from "react-icons/bs";

export function ClearButton(): JSX.Element {
  const numFacts = useCountPendingChanges();
  const clearAll = useGroveStore((state) => state.clearAll);

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-text-inverse focus:outline-none focus:ring-2 focus:ring-status-error-border focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-button-disabled-bg cursor-not-allowed"
          : "bg-status-error-bg hover:bg-status-error-border cursor-pointer"
      }`}
      onClick={clearAll}
    >
      <BsFillTrash3Fill />
    </button>
  );
}
