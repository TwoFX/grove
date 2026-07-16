import { BreadcrumbContext } from "@/lib/navigate/breadcrumb";
import { sectionUrl } from "@/lib/navigate/urls";
import { GroveContext } from "@/lib/transfer/context";
import { JSX, useContext } from "react";
import { Link } from "react-router";

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
            <Link to={sectionUrl(id)} className="hover:underline">
              {context.section[id].title}
            </Link>
          </span>
          <span>/</span>
        </div>
      ))}

      <div className="font-bold">{breadcrumb.title}</div>
    </div>
  );
}
