import { JSX } from "react";
import { Node } from "@/lib/transfer/index";
import { SectionComponent } from "./section/SectionComponent";
import { TextComponent } from "./text/TextComponent";
import { ShowDeclarationComponent } from "./show-declaration/ShowDeclarationComponent";
import { AssertionComponent } from "./assertion/AssertionComponent";

export function NodeComponent({
  node,
  depth,
}: {
  node: Node;
  depth: number;
}): JSX.Element {
  switch (node.constructor) {
    case "assertion":
      return <AssertionComponent assertion={node.assertion} />;
    case "namespace":
      return <div>Namespace</div>;
    case "section":
      return <SectionComponent section={node.section} depth={depth} />;
    case "showDeclaration":
      return (
        <ShowDeclarationComponent showDeclaration={node.showDeclaration} />
      );
    case "text":
      return <TextComponent text={node.text} />;
  }
}
