import { JSX } from "react";
import { Node } from "@/lib/transfer/project/index";
import { SectionComponent } from "./section/SectionComponent";
import { TextComponent } from "./text/TextComponent";
import { ShowDeclarationComponent } from "./show-declaration/ShowDeclarationComponent";
import { AssertionComponent } from "./assertion/AssertionComponent";
import { AssociationTableComponent } from "./association-table/AssociationTableComponent";
import { TableComponent } from "./table/TableComponent";

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
    case "associationTable":
      return (
        <AssociationTableComponent associationTable={node.associationTable} />
      );
    case "table":
      return <TableComponent table={node.table} />;
  }
}
