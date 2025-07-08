import { BreadcrumbContext } from "@/lib/navigate/breadcrumb";
import { GroveContext } from "@/lib/transfer/context";
import { JSX, useContext } from "react";

export function Breadcrumbs(): JSX.Element {
  const { breadcrumb } = useContext(BreadcrumbContext);
  const context = useContext(GroveContext);

  if (!breadcrumb.id) {
    return <div>{breadcrumb.title}</div>;
  }

  const parents: string[] = [];
  let parent: string | undefined = context.parentSection[breadcrumb.id];
  while (parent) {
    parents.push(parent);
    parent = context.parentSection[parent];
  }

  parents.reverse();

  return (
    <div className="inline-flex gap-2">
      {parents.map((id) => (
        <div className="inline-flex gap-2" key={id}>
          <span>
            <a href={`/section/${id}`} className="hover:underline">
              {context.section[id].title}
            </a>
          </span>
          <span>/</span>
        </div>
      ))}

      <div className="font-bold">{breadcrumb.title}</div>
    </div>
  );
}
