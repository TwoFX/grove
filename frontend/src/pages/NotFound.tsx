import { JSX } from "react";
import { Link } from "react-router";

export function NotFound({
  kind,
  id,
}: {
  kind?: string;
  id?: string;
}): JSX.Element {
  return (
    <div className="p-4 flex flex-col gap-2 items-start">
      <span className="text-2xl font-bold">{kind ?? "Page"} not found</span>
      {id !== undefined && (
        <span>
          There is no {(kind ?? "page").toLowerCase()} with id &quot;{id}&quot;
          in this Grove.
        </span>
      )}
      <Link to="/" className="underline">
        Back to overview
      </Link>
    </div>
  );
}
