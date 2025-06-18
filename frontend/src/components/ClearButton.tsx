import {
  useClearPendingChanges,
  useCountPendingChanges,
} from "@/lib/state/pending";
import { JSX } from "react";
import { BsFillTrash3Fill } from "react-icons/bs";

export function ClearButton(): JSX.Element {
  const numFacts = useCountPendingChanges();
  const clearFacts = useClearPendingChanges();

  return (
    <button
      disabled={numFacts === 0}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
        numFacts === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700 cursor-pointer"
      }`}
      onClick={clearFacts}
    >
      <BsFillTrash3Fill />
    </button>
  );
}
