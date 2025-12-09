import { DataKind, Declaration, Node } from "@/lib/transfer/project/index";
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

export function declarationDisplayLong(declaration: Declaration): string {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.renderedStatement;
    case "missing":
      return declaration.missing;
    case "thm":
      return declaration.thm.renderedStatement;
  }
}

export function declarationIsDeprecated(declaration: Declaration): boolean {
  switch (declaration.constructor) {
    case "def":
      return declaration.def.isDeprecated;
    case "missing":
      return true;
    case "thm":
      return declaration.thm.isDeprecated;
  }
}

export function declarationStateRepr(
  templates: Templates,
  declaration: Declaration,
  targetDataKind: DataKind,
): string {
  /*
  This is an optimization. When a table mentions a declaration, we want the data about the declaration
  to be transmitted exactly once in the global declarations object. However, this means that in the
  places where we need it, we do not have access to the relevant "stateRepr" object to put the
  declaration back into a fact state. So we build something equivalent to it here in the frontend.
  This duplicates backend logic and doesn't even generate an equivalent result (because the formatting
  is different), but it's a necessary optimization to keep the JSON small.
  */
  const declarationStr = templates.declaration(declaration);
  switch (targetDataKind) {
    case DataKind.Declaration:
      return declarationStr;
    case DataKind.Subexpression:
      return ".declaration (" + declarationStr + ")";
  }
}

export function nodeKey(node: Node): string {
  switch (node.constructor) {
    case "assertion":
      return node.assertion.definition.widgetId;
    case "namespace":
      return node.namespace;
    case "section":
      return node.section.id;
    case "showDeclaration":
      return node.showDeclaration.definition.id;
    case "text":
      return node.text.id;
    case "associationTable":
      return node.associationTable.definition.widgetId;
    case "table":
      return node.table.definition.widgetId;
  }
}
