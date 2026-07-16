import { JSX } from "react";
import { Link, useRouteError } from "react-router";

// Rendered in place of the entire app when data loading or a page render
// fails, so it must not rely on GroveContext being available.
export function RouteError(): JSX.Element {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="p-4 flex flex-col gap-2 items-start">
      <span className="text-2xl font-bold">Something went wrong</span>
      <span>{message}</span>
      <Link to="/" className="underline">
        Back to overview
      </Link>
    </div>
  );
}
