import { FactSummary } from "@/lib/fact/summary";
import { FactMetadata, FactStatus } from "@/lib/transfer/project";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { JSX, ReactElement, useState } from "react";
import {
  BsCheckLg,
  BsClock,
  BsEmojiSmile,
  BsExclamationLg,
} from "react-icons/bs";

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

function factColor(fact: FactSummary): string {
  if (fact.validationResult.constructor === "invalidated") {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  switch (fact.metadata.status) {
    case FactStatus.Done:
      return "bg-green-100 text-green-800 border-green-200";
    case FactStatus.Bad:
      return "bg-red-100 text-red-800 border-red-200";
    case FactStatus.BelievedGood:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case FactStatus.NothingToDo:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case FactStatus.Postponed:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
      {factMetadata.comment && <span>{factMetadata.comment}</span>}
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
  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 rounded-full text-xs font-medium border ${factColor(fact)}`}
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
  onAssert: (status: FactStatus, comment: string) => void;
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
      <div className="fixed inset-0 bg-black/30 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit fact
          </DialogTitle>
          <hr className="border-gray-200" />
          {children}
          <hr className="border-gray-200" />
          <div className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as FactStatus)
                }
                className="mt-1 block w-full rounded-sm border-gray-300 border-1 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {Object.values(FactStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
                className="mt-1 block w-full border-gray-300 border-1 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
  onAssert: (status: FactStatus, message: string) => void;
}): JSX.Element {
  const [diagOpen, setDiagOpen] = useState(false);

  const initialStatus: FactStatus = fact?.metadata.status ?? FactStatus.Done;
  const initialMessage: string = fact?.metadata.comment ?? "Blub";

  return (
    <>
      <div
        className="cursor-pointer p-1 rounded-md transition-colors"
        onClick={() => setDiagOpen(true)}
      >
        {fact && <FactBar fact={fact} />}
        {!fact && (
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
            <pre className="font-mono bg-gray-50 p-4 rounded-md border border-gray-200 overflow-x-auto whitespace-pre">
              {fact.validationResult.invalidated.longDescription}
            </pre>
          )}
        </>
      </FactDialog>
    </>
  );
}
