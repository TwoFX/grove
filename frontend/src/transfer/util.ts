import { Node } from "@/transfer/index";

export function nodeKey(node: Node): string {
  switch (node.constructor) {
    case "assertion":
      return node.assertion.id;
    case "namespace":
      return node.namespace; //  TODO
    case "section":
      return node.section.id;
    case "showDeclaration":
      return node.showDeclaration.id;
    case "text":
      return node.text; // TODO
  }
}
