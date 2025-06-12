"use client";

import { LeafWidget } from "@/components/LeafWidget";
import { useGroveStore } from "@/lib/state/state";
import {
  Declaration,
  FactMetadata,
  FactStatus,
  FactValidationResult,
  ShowDeclaration,
  ShowDeclarationFact,
} from "@/lib/transfer/project";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { JSX, ReactElement, useState } from "react";
import {
  BsCheckLg,
  BsClock,
  BsEmojiSmile,
  BsExclamationLg,
  BsStar,
} from "react-icons/bs";
import { usePendingShowDeclarationFact } from "./state/pending";

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

function FactMetadataBar({
  factMetadata,
}: {
  factMetadata: FactMetadata;
}): JSX.Element {
  return (
    <div className="flex items-center space-x-1">
      <FactStatusIcon factStatus={factMetadata.status} />
      <span>{factMetadata.comment}</span>
    </div>
  );
}

function FactValidationBar({
  validationResult,
}: {
  validationResult: FactValidationResult;
}): JSX.Element {
  switch (validationResult.constructor) {
    case "invalidated":
      return (
        <div className="flex items-center">
          <BsExclamationLg />
          <span>{validationResult.invalidated.shortDescription}</span>
        </div>
      );
    case "new":
      return <BsStar />;
    case "ok":
      return <BsCheckLg />;
  }
}

function FactBar({ fact }: { fact: ShowDeclarationFact }): JSX.Element {
  return (
    <div className="flex items-center">
      <FactMetadataBar factMetadata={fact.metadata} />
      <FactValidationBar validationResult={fact.validationResult} />
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
  widgetId,
  factId,
  newState,
}: {
  widgetId: string;
  factId: string;
  newState: Declaration;
}): JSX.Element {
  const fact = usePendingShowDeclarationFact()(widgetId, factId);
  const setPendingFact = useGroveStore(
    (state) => state.setPendingShowDeclarationFact,
  );

  const [diagOpen, setDiagOpen] = useState(false);

  const initialStatus: FactStatus = fact?.metadata.status ?? FactStatus.Done;
  const initialMessage: string = fact?.metadata.comment ?? "Blub";

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(widgetId, factId, {
      factId: factId,
      metadata: { status: status, comment: message },
      state: newState,
      validationResult: {
        constructor: "new",
      },
    });

  return (
    <>
      <div
        className="hover:bg-gray-100 cursor-pointer"
        onClick={() => setDiagOpen(true)}
      >
        {fact && <FactBar fact={fact} />}
        {!fact && <span>Click here to assert fact</span>}
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

function statement(declaration: Declaration): string {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.renderedStatement;
    case "thm":
      return declaration.thm.renderedStatement;
    case "missing":
      return "Missing: " + declaration.missing;
  }
}

export function ShowDeclarationComponent({
  showDeclaration,
}: {
  showDeclaration: ShowDeclaration;
}): JSX.Element {
  return (
    <LeafWidget
      widgetType="Declaration"
      id={showDeclaration.definition.id}
      title={showDeclaration.definition.name}
    >
      <div>
        <p className="font-mono">
          {statement(showDeclaration.definition.declaration)}
        </p>
        <Fact
          factId="0"
          widgetId={showDeclaration.definition.id}
          newState={showDeclaration.definition.declaration}
        ></Fact>
      </div>
    </LeafWidget>
  );
}
