import { usePersistenceStatus } from "@/lib/state/persistence";
import { JSX, ReactNode } from "react";

export function PersistenceGate({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const isLoading = usePersistenceStatus((state) => state.pending.length > 0);
  const loadFailed = usePersistenceStatus((state) => state.loadFailed);
  const writeFailed = usePersistenceStatus((state) => state.writeFailed);

  if (loadFailed) {
    return (
      <div role="alert" className="p-4">
        <p>Could not load your saved work. Reload the page to try again.</p>
        <button
          className="mt-2 cursor-pointer underline"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div role="status">Loading saved work...</div>;
  }

  return (
    <>
      {writeFailed && (
        <div
          role="alert"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 text-text-primary"
        >
          Your latest changes could not be saved in this browser. Keep this page
          open and use Save to export your work.
        </div>
      )}
      {children}
    </>
  );
}
