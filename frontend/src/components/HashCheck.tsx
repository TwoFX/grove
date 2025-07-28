import { useCountPendingChanges, usePendingChanges } from "@/lib/state/pending";
import { useGroveAdminStore } from "@/lib/state/state";
import { GroveContext } from "@/lib/transfer/context";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { JSX, ReactNode, useContext, useEffect } from "react";
import { ClearButton } from "./ClearButton";

function HashConflictDialog(): JSX.Element {
  const basisHash = useContext(GroveContext).projectMetadata.hash;
  const storedHash = useGroveAdminStore((state) => state.hash);
  const setStoredHash = useGroveAdminStore((state) => state.setHash);
  const pendingChanges = usePendingChanges();
  const pendingCount = useCountPendingChanges();
  const hasHydrated = useGroveAdminStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && (storedHash === "" || pendingCount === 0)) {
      setStoredHash(basisHash);
    }
  }, [hasHydrated, storedHash, pendingCount, setStoredHash, basisHash]);

  const hashesDiffer = basisHash !== storedHash;

  return (
    <Dialog open={hashesDiffer} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            State conflict
          </DialogTitle>
          <p>
            You have pending work based on library hash <b>{storedHash}</b>, but
            the copy of Grove you have opened was generated from the library
            hash <b>{basisHash}</b>.
          </p>
          <p>Specifically, there are the following pending changes:</p>
          <ul>
            {pendingChanges.map((change) => (
              <li key={change.id}>{change.displayShort}</li>
            ))}
          </ul>
          <p>You have several options:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Close this copy of Grove now and open one that was built from{" "}
              <b>{storedHash}</b>, then save your work.
            </li>
            <li>
              Clear (= lose!) all unsaved data. This is the right thing to do if
              you have previously saved the pending changes.
            </li>
            <li>
              Work with the pending data on top of the new library, possibly
              introducing inconsistencies.
            </li>
          </ul>
          <hr className="border-gray-200" />
          <div className="flex justify-end gap-4">
            <ClearButton />
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              onClick={() => setStoredHash(basisHash)}
            >
              Continue with old data
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function HashCheck({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      {children}
      <HashConflictDialog></HashConflictDialog>
    </>
  );
}
