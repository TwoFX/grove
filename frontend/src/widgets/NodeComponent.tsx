import { JSX } from "react";
import { Node } from "@/transfer/index";
import { SectionComponent } from "./section/SectionComponent";

export function NodeComponent({
  node,
  depth,
}: {
  node: Node;
  depth: number;
}): JSX.Element {
  switch (node.constructor) {
    case "assertion":
      return <div>Assertion</div>;
    case "namespace":
      return <div>Namespace</div>;
    case "section":
      return <SectionComponent section={node.section} depth={depth} />;
    case "showDeclaration":
      return <div>ShowDeclaration</div>;
    case "text":
      return <div>Text</div>;
  }
}
