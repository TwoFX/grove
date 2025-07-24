import { GroveContext } from "@/lib/transfer/context";
import { AssertionResult, FactStatus } from "@/lib/transfer/project";
import { JSX, useContext } from "react";
import {
  computeAssertionFactSummary,
  usePendingAssertionFact,
} from "./state/pending";
import { useGroveStore } from "@/lib/state/state";
import { Fact } from "@/components/fact/Fact";

export function AssertionFactComponent({
  widgetId,
  factId,
  assertionId,
  newState,
}: {
  widgetId: string;
  factId: string;
  assertionId: string;
  newState: AssertionResult;
}): JSX.Element {
  const context = useContext(GroveContext);
  const fact = usePendingAssertionFact()(widgetId, factId);
  const setPendingFact = useGroveStore(
    (state) => state.setPendingAssertionFact,
  );

  const onAssert: (status: FactStatus, message: string) => void = (
    status,
    message,
  ) =>
    setPendingFact(context, widgetId, factId, {
      widgetId: widgetId,
      factId: factId,
      assertionId: assertionId,
      metadata: { status: status, comment: message },
      state: newState,
      validationResult: {
        constructor: "new",
      },
    });

  return (
    <Fact
      fact={fact && computeAssertionFactSummary(context, fact)}
      onAssert={onAssert}
    />
  );
}
