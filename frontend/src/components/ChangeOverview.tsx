import { usePendingChanges } from "@/lib/state/pending";
import { PendingChange } from "@/lib/state/pendingchange";
import { useGroveStore } from "@/lib/state/state";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { JSX } from "react";
import { BsChevronDown, BsFillTrash3Fill } from "react-icons/bs";

function ChangeEntry({ change }: { change: PendingChange }): JSX.Element {
  const state = useGroveStore();

  return (
    <div className="flex items-center justify-between">
      {change.href ? (
        <a href={change.href}>{change.displayShort}</a>
      ) : (
        <span>{change.displayShort}</span>
      )}
      <button
        onClick={() => change.remove(state)}
        className="px-2 py-2 hover:bg-gray-200 cursor-pointer"
      >
        <BsFillTrash3Fill />
      </button>
    </div>
  );
}

export function ChangeOverview(): JSX.Element {
  const pendingChanges = usePendingChanges();

  const enabled = pendingChanges.length !== 0;

  return (
    <Popover className="group">
      <PopoverButton className="px-2 py-2" disabled={!enabled}>
        <BsChevronDown className="group-data-open:rotate-180" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom start"
        className="flex flex-col px-2 py-2 w-100 bg-white border border-black rounded-md mt-5"
      >
        {pendingChanges.length === 0 ? (
          <div className="italic">Nothing to show</div>
        ) : (
          pendingChanges.map((change) => (
            <ChangeEntry key={change.id} change={change} />
          ))
        )}
      </PopoverPanel>
    </Popover>
  );
}
