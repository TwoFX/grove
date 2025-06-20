import { Declaration, Node } from "@/lib/transfer/project/index";
import { Templates } from "../templates";

export function declarationName(declaration: Declaration): string {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.name;
    case "missing":
      return declaration.missing;
    case "thm":
      return declaration.thm.name;
  }
}

export function declarationDisplayShort(declaration: Declaration): string {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.name;
    case "missing":
      return declaration.missing;
    case "thm":
      return declaration.thm.name;
  }
}

export function declarationStateRepr(
  templates: Templates,
  declaration: Declaration,
): string {
  return templates.declaration(declaration);
}

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
    case "associationTable":
      return node.associationTable.definition.widgetId;
  }
}
