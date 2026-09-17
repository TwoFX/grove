import {
  DataKind,
  Declaration,
  Node,
  StateSnapshot,
} from "@/lib/transfer/project/index";

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

export function declarationStateJson(
  declaration: Declaration,
  targetDataKind: DataKind,
): StateSnapshot {
  // Declarations are shared in the backend output; reconstruct their snapshot here.
  switch (targetDataKind) {
    case DataKind.Declaration:
      return { constructor: "declaration", declaration };
    case DataKind.Subexpression:
      return {
        constructor: "subexpressionDeclaration",
        subexpressionDeclaration: declaration,
      };
    case DataKind.Synthesis:
      throw new Error(
        "Declarations should never be serialized into synthesis results.",
      );
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
