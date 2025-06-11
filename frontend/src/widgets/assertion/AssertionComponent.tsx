import { LeafWidget } from "@/components/LeafWidget";
import { Assertion } from "@/lib/transfer";
import { JSX } from "react";

export function AssertionComponent({
  assertion,
}: {
  assertion: Assertion;
}): JSX.Element {
  return (
    <LeafWidget
      id={assertion.id}
      widgetType="Assertion"
      title={assertion.title}
    >
      <>
        <span className="font-bold">
          {assertion.success ? "Success: " : "Failure: "}
        </span>
        <span>{assertion.message}</span>
      </>
    </LeafWidget>
  );
}
