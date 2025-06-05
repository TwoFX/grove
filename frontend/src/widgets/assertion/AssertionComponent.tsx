import { Assertion } from "@/transfer";
import { JSX } from "react";

export function AssertionComponent({
  assertion,
}: {
  assertion: Assertion;
}): JSX.Element {
  if (assertion.success) {
    return <div>Success: {assertion.message}</div>;
  } else {
    return <div>Failure: {assertion.message}</div>;
  }
}
