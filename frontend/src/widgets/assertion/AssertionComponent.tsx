import { LeafWidget } from "@/components/LeafWidget";
import { Assertion } from "@/lib/transfer/project";
import { JSX } from "react";

export function AssertionComponent({
  assertion,
}: {
  assertion: Assertion;
}): JSX.Element {
  return (
    <LeafWidget
      id={assertion.definition.widgetId}
      widgetType="Assertion"
      title={assertion.definition.title}
    >
      <>
        <div>{assertion.definition.description}</div>
        <div>
          {assertion.definition.results.filter((res) => res.passed).length}/
          {assertion.definition.results.length} assertions pass.
        </div>
      </>
    </LeafWidget>
  );
}
