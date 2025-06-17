/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Basic
import Grove.Framework.Widget.State

open Lean

namespace Grove.Framework.Backend.Full

open Widget JTD

namespace Data

structure Assertion where
  id : String
  title : String
  success : Bool
  message : String

instance : SchemaFor Assertion :=
  .structure "assertion"
    [.single "id" Assertion.id,
     .single "title" Assertion.title,
     .single "success" Assertion.success,
     .single "message" Assertion.message]

structure Theorem where
  name : String
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool

instance : SchemaFor Theorem :=
  .structure "theorem"
    [.single "name" Theorem.name,
     .single "renderedStatement" Theorem.renderedStatement,
     .single "isSimp" Theorem.isSimp,
     .single "isDeprecated" Theorem.isDeprecated]

structure Definition where
  name : String
  renderedStatement : String
  isDeprecated : Bool

instance : SchemaFor Definition :=
  .structure "definition"
    [.single "name" Definition.name,
     .single "renderedStatement" Definition.renderedStatement,
     .single "isDeprecated" Definition.isDeprecated]

inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : String → Declaration

instance : SchemaFor Declaration :=
  .inductive "declaration"
    [.unary "thm" Theorem (fun | .thm t => some t | _ => none),
     .unary "def" Definition (fun | .def d => some d | _ => none),
     .unary "missing" String (fun | .missing s => some s | _ => none)]

structure ShowDeclaration.Fact where
  widgetId : String
  factId : String
  metadata : Fact.Metadata
  state : Declaration
  validationResult : Fact.ValidationResult

instance : SchemaFor ShowDeclaration.Fact :=
  .structure "showDeclarationFact"
    [.single "widgetId" ShowDeclaration.Fact.widgetId,
     .single "factId" ShowDeclaration.Fact.factId,
     .single "metadata" ShowDeclaration.Fact.metadata,
     .single "state" ShowDeclaration.Fact.state,
     .single "validationResult" ShowDeclaration.Fact.validationResult]

structure ShowDeclaration.Definition where
  id : String
  name : String
  declarationKey : String

instance : SchemaFor ShowDeclaration.Definition :=
  .structure "showDeclarationDefinition"
    [.single "id" ShowDeclaration.Definition.id,
     .single "name" ShowDeclaration.Definition.name,
     .single "declarationKey" ShowDeclaration.Definition.declarationKey]

structure ShowDeclaration where
  definition : ShowDeclaration.Definition
  facts : Array ShowDeclaration.Fact

instance : SchemaFor ShowDeclaration :=
  .structure "showDeclaration"
    [.single "definition" ShowDeclaration.definition,
     .arr "facts" ShowDeclaration.facts]

end Data

end Grove.Framework.Backend.Full
