import { FactSummary } from "@/lib/fact/summary";
import { FactMetadata, FactStatus } from "@/lib/transfer/project";
import { factColor, getStatusColors } from "@/lib/fact/color";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { JSX, ReactElement, useContext, useEffect, useState } from "react";
import {
  BsCheckLg,
  BsClock,
  BsEmojiSmile,
  BsExclamationLg,
  BsChevronDown,
  BsBell,
} from "react-icons/bs";
import Markdown from "react-markdown";
import { InvalidatedFactsContext } from "@/lib/fact/invalidated/context";
import { createStore } from "zustand/vanilla";

// Remember dialog defaults for this session, outside persisted facts and undo history.
const factDialogDefaults = createStore<FactMetadata>(() => ({
  status: FactStatus.Done,
  comment: "",
}));

function FactStatusIcon({
  factStatus,
}: {
  factStatus: FactStatus;
}): JSX.Element {
  switch (factStatus) {
    case FactStatus.Done:
      return <BsCheckLg />;
    case FactStatus.Bad:
      return <BsExclamationLg />;
    case FactStatus.BelievedGood:
      return <BsEmojiSmile />;
    case FactStatus.NothingToDo:
      return <BsCheckLg />;
    case FactStatus.Postponed:
      return <BsClock />;
    case FactStatus.NeedsAttention:
      return <BsBell />;
  }
}

function FactMetadataContent({
  factMetadata,
}: {
  factMetadata: FactMetadata;
}): JSX.Element {
  return (
    <div className="inline-flex items-center space-x-1">
      <FactStatusIcon factStatus={factMetadata.status} />
      {factMetadata.comment && (
        <Markdown components={{ p: "span" }}>{factMetadata.comment}</Markdown>
      )}
    </div>
  );
}

function FactContent({ fact }: { fact: FactSummary }): JSX.Element {
  switch (fact.validationResult.constructor) {
    case "invalidated":
      return (
        <>
          <BsExclamationLg />
          <span>{fact.validationResult.invalidated.shortDescription}</span>
          <div className="inline-flex items-center">
            <span>(</span>
            <div className="inline-flex items-center space-x-1">
              <span>was:</span>
              <FactMetadataContent factMetadata={fact.metadata} />
            </div>
            <span>)</span>
          </div>
        </>
      );
    case "new":
      return (
        <div className="inline-flex items-center space-x-1">
          <FactMetadataContent factMetadata={fact.metadata} />
          <span>(New)</span>
        </div>
      );
    case "ok":
      return <FactMetadataContent factMetadata={fact.metadata} />;
  }
}

function FactBar({ fact }: { fact: FactSummary }): JSX.Element {
  const context = useContext(InvalidatedFactsContext);

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 rounded-full text-xs font-medium border ${factColor(
        context,
        fact.widgetId,
        fact.factId,
        fact.validationResult,
        fact.metadata.status,
      )}`}
    >
      <FactContent fact={fact} />
    </div>
  );
}

function FactDialog({
  children,
  factMetadata,
  onAssert,
  setDiagOpen,
}: {
  children: ReactElement;
  factMetadata: FactMetadata | undefined;
  onAssert: ((status: FactStatus, comment: string) => void) | undefined;
  setDiagOpen: (open: boolean) => void;
}): JSX.Element {
  const [initialMetadata] = useState(
    () => factMetadata ?? factDialogDefaults.getState(),
  );
  const [selectedStatus, setSelectedStatus] = useState<FactStatus>(
    initialMetadata.status,
  );
  const [comment, setComment] = useState(initialMetadata.comment);

  useEffect(() => {
    factDialogDefaults.setState(initialMetadata);
  }, [initialMetadata]);

  const handleAssert = () => {
    if (onAssert) {
      factDialogDefaults.setState({ status: selectedStatus, comment });
      setDiagOpen(false);
      onAssert(selectedStatus, comment);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onAssert) return;

    const isTextarea = (e.target as HTMLElement).tagName === "TEXTAREA";

    // Ctrl+Enter or Cmd+Enter anywhere (including textarea) should submit
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAssert();
    }
    // Plain Enter outside of textarea should submit
    else if (e.key === "Enter" && !e.shiftKey && !isTextarea) {
      e.preventDefault();
      handleAssert();
    }
  };

  return (
    <Dialog
      open
      onClose={() => setDiagOpen(false)}
      className="relative z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-overlay flex items-center justify-center p-4">
        <DialogPanel className="w-6xl space-y-4 rounded-lg border border-border bg-surface p-6 shadow-lg">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            {onAssert ? "Edit fact" : "View fact"}
          </DialogTitle>
          <hr className="border-border" />
          <div className="max-h-[70vh] overflow-y-auto">{children}</div>
          <hr className="border-border" />
          {onAssert && (
            <>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-text-secondary"
                  >
                    Status
                  </label>
                  <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                    <div className="relative mt-1">
                      <ListboxButton
                        className={`relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm ${getStatusColors(selectedStatus)}`}
                      >
                        <span className="flex items-center space-x-2">
                          <FactStatusIcon factStatus={selectedStatus} />
                          <span className="block truncate">
                            {selectedStatus}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <BsChevronDown
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </span>
                      </ListboxButton>
                      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-surface py-1 text-base shadow-lg ring-1 ring-border-strong ring-opacity-5 focus:outline-none sm:text-sm">
                        {Object.values(FactStatus).map((status) => (
                          <ListboxOption
                            key={status}
                            value={status}
                            className={({ focus }) =>
                              `relative cursor-default select-none py-1 ${
                                focus ? "bg-primary-light" : ""
                              }`
                            }
                          >
                            {({ selected }) => (
                              <div
                                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium border ${getStatusColors(status)} ${selected ? "ring-2 ring-focus-ring" : ""}`}
                              >
                                <FactStatusIcon factStatus={status} />
                                <span className="block truncate">{status}</span>
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-text-secondary"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    data-autofocus
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-border border-1 focus:border-border-focus focus:ring-focus-ring sm:text-sm font-mono"
                  />
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex justify-end gap-4">
                <button
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                  onClick={() => setDiagOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-inverse hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                  onClick={handleAssert}
                >
                  Assert
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function Fact({
  fact,
  onAssert,
  open,
  onOpenChange,
}: {
  fact: FactSummary | undefined;
  onAssert: ((status: FactStatus, message: string) => void) | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}): JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false);
  const diagOpen = open ?? internalOpen;
  const setDiagOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      <div
        className="cursor-pointer p-1 rounded-md transition-colors"
        onClick={() => setDiagOpen(true)}
      >
        {fact && <FactBar fact={fact} />}
        {!fact && onAssert && (
          <div className="inline-flex items-center px-3 rounded-full text-xs font-medium bg-status-neutral-bg text-status-neutral-text border border-status-neutral-border hover:bg-surface-active transition-colors">
            <span>Click here to assert fact</span>
          </div>
        )}
      </div>
      {diagOpen && (
        <FactDialog
          factMetadata={fact?.metadata}
          onAssert={onAssert}
          setDiagOpen={setDiagOpen}
        >
          <>
            {fact && fact.validationResult.constructor === "invalidated" && (
              <div className="overflow-y-auto space-y-4">
                <Markdown>
                  {fact.validationResult.invalidated.longDescription}
                </Markdown>
              </div>
            )}
          </>
        </FactDialog>
      )}
    </>
  );
}
