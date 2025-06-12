import { Node } from "@/lib/transfer/project/index";

export function nodeKey(node: Node): string {
  switch (node.constructor) {
    case "assertion":
      return node.assertion.id;
    case "namespace":
      return node.namespace; //  TODO
    case "section":
      return node.section.id;
    case "showDeclaration":
      return node.showDeclaration.definition.id;
    case "text":
      return node.text; // TODO
  }
}
