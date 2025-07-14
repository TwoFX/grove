import { FactSummary } from "@/lib/fact/summary";
import { GroveContext } from "@/lib/transfer/context";
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
import { JSX, ReactElement, useContext, useState } from "react";
import {
  BsCheckLg,
  BsClock,
  BsEmojiSmile,
  BsExclamationLg,
  BsChevronDown,
} from "react-icons/bs";
import Markdown from "react-markdown";

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
      {factMetadata.comment && <Markdown>{factMetadata.comment}</Markdown>}
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
  const context = useContext(GroveContext);

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
  initialStatus,
  initialComment,
  onAssert,
  diagOpen,
  setDiagOpen,
}: {
  children: ReactElement;
  initialStatus: FactStatus;
  initialComment: string;
  onAssert: ((status: FactStatus, comment: string) => void) | undefined;
  diagOpen: boolean;
  setDiagOpen: (open: boolean) => void;
}): JSX.Element {
  const [selectedStatus, setSelectedStatus] =
    useState<FactStatus>(initialStatus);
  const [comment, setComment] = useState(initialComment);

  return (
    <Dialog
      open={diagOpen}
      onClose={() => setDiagOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
        <DialogPanel className="w-6xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {onAssert ? "Edit fact" : "View fact"}
          </DialogTitle>
          <hr className="border-gray-200" />
          <div className="max-h-[70vh] overflow-y-auto">{children}</div>
          <hr className="border-gray-200" />
          {onAssert && (
            <>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                    <div className="relative mt-1">
                      <ListboxButton
                        className={`relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm ${getStatusColors(selectedStatus)}`}
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
                      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-gray-500 ring-opacity-5 focus:outline-none sm:text-sm">
                        {Object.values(FactStatus).map((status) => (
                          <ListboxOption
                            key={status}
                            value={status}
                            className={({ focus }) =>
                              `relative cursor-default select-none py-1 ${
                                focus ? "bg-blue-100" : ""
                              }`
                            }
                          >
                            {({ selected }) => (
                              <div
                                className={`flex items-center space-x-2 px-2 py-1 text-xs font-medium border ${getStatusColors(status)} ${selected ? "ring-2 ring-blue-500" : ""}`}
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 border-1 focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                  />
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-end gap-4">
                <button
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setDiagOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setDiagOpen(false);
                    onAssert(selectedStatus, comment);
                  }}
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
}: {
  fact: FactSummary | undefined;
  onAssert: ((status: FactStatus, message: string) => void) | undefined;
}): JSX.Element {
  const [diagOpen, setDiagOpen] = useState(false);

  const initialStatus: FactStatus = fact?.metadata.status ?? FactStatus.Done;
  const initialMessage: string = fact?.metadata.comment ?? "";

  return (
    <>
      <div
        className="cursor-pointer p-1 rounded-md transition-colors"
        onClick={() => setDiagOpen(true)}
      >
        {fact && <FactBar fact={fact} />}
        {!fact && onAssert && (
          <div className="inline-flex items-center px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors">
            <span>Click here to assert fact</span>
          </div>
        )}
      </div>
      <FactDialog
        initialStatus={initialStatus}
        initialComment={initialMessage}
        onAssert={onAssert}
        diagOpen={diagOpen}
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
    </>
  );
}
