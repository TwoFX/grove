/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

import Grove.Framework.Basic
import Grove.Framework.Widget.State
public import Grove.JTD.Basic
public import Grove.Framework.Fact
public import Grove.Framework.DataSource.Basic
public import Grove.Framework.Declaration.Basic

open Lean

namespace Grove.Framework.Backend.Full

open Widget JTD

namespace Data

public structure Theorem where
  name : String
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool

public instance : SchemaFor Theorem :=
  .structure "theorem"
    [.single "name" Theorem.name,
     .single "renderedStatement" Theorem.renderedStatement,
     .single "isSimp" Theorem.isSimp,
     .single "isDeprecated" Theorem.isDeprecated]

public structure Definition where
  name : String
  renderedStatement : String
  isDeprecated : Bool

public instance : SchemaFor Definition :=
  .structure "definition"
    [.single "name" Definition.name,
     .single "renderedStatement" Definition.renderedStatement,
     .single "isDeprecated" Definition.isDeprecated]

public inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : String → Declaration

public instance : SchemaFor Declaration :=
  .inductive "declaration"
    [.unary "thm" Theorem (fun | .thm t => some t | _ => none),
     .unary "def" Definition (fun | .def d => some d | _ => none),
     .unary "missing" String (fun | .missing s => some s | _ => none)]

public def Declaration.ofDeclaration : Grove.Framework.Declaration → Declaration
  | .thm t => .thm { t with name := t.name.toString }
  | .def d => .def { d with name := d.name.toString }
  | .missing n => .missing n.toString

public instance : SchemaFor PredicateSubexpression.State :=
  .structure "predicateState"
    [.single "key" PredicateSubexpression.State.key,
     .single "displayShort" PredicateSubexpression.State.displayShort]

public instance : SchemaFor Synthesis.Result :=
  .structure "synthesisResult"
    [.single "head" Synthesis.Result.head,
     .single "term" Synthesis.Result.term,
     .arr "usedInstances" Synthesis.Result.usedInstances]

/-- A typed snapshot for the frontend. The discriminant distinguishes every shape, including
failed synthesis. Saving converts it back to the corresponding `DataKind.State` JSON. -/
public inductive StateSnapshot where
  | declaration : Declaration → StateSnapshot
  | subexpressionDeclaration : Declaration → StateSnapshot
  | subexpressionPredicate : PredicateSubexpression.State → StateSnapshot
  | synthesisSuccess : Synthesis.Result → StateSnapshot
  | synthesisFailure : StateSnapshot

public instance : SchemaFor StateSnapshot :=
  .inductive "stateSnapshot"
    [.unary "declaration" Declaration (fun | .declaration d => some d | _ => none),
     .unary "subexpressionDeclaration" Declaration (fun | .subexpressionDeclaration d => some d | _ => none),
     .unary "subexpressionPredicate" PredicateSubexpression.State (fun | .subexpressionPredicate p => some p | _ => none),
     .unary "synthesisSuccess" Synthesis.Result (fun | .synthesisSuccess r => some r | _ => none),
     .nullary "synthesisFailure" (fun | .synthesisFailure => true | _ => false)]

public def StateSnapshot.ofState : (kind : DataKind) → kind.State → StateSnapshot
  | .declaration, d => .declaration (.ofDeclaration d)
  | .subexpression, .declaration d => .subexpressionDeclaration (.ofDeclaration d)
  | .subexpression, .predicate p => .subexpressionPredicate p
  | .synthesis, ⟨some r⟩ => .synthesisSuccess r
  | .synthesis, ⟨none⟩ => .synthesisFailure

public structure ShowDeclaration.Fact where
  widgetId : String
  factId : String
  metadata : Fact.Metadata
  state : Declaration
  validationResult : Fact.ValidationResult

public instance : ValidatedFact ShowDeclaration.Fact where
  widgetId := ShowDeclaration.Fact.widgetId
  factId := ShowDeclaration.Fact.factId
  validationResult := ShowDeclaration.Fact.validationResult
  status f := f.metadata.status

public instance : SchemaFor ShowDeclaration.Fact :=
  .structure "showDeclarationFact"
    [.single "widgetId" ShowDeclaration.Fact.widgetId,
     .single "factId" ShowDeclaration.Fact.factId,
     .single "metadata" ShowDeclaration.Fact.metadata,
     .single "state" ShowDeclaration.Fact.state,
     .single "validationResult" ShowDeclaration.Fact.validationResult]

public structure ShowDeclaration.Definition where
  id : String
  name : String
  declarationKey : String

public instance schemaForShowDeclarationDefinition : SchemaFor ShowDeclaration.Definition :=
  .structure "showDeclarationDefinition"
    [.single "id" ShowDeclaration.Definition.id,
     .single "name" ShowDeclaration.Definition.name,
     .single "declarationKey" ShowDeclaration.Definition.declarationKey]

public structure ShowDeclaration where
  definition : ShowDeclaration.Definition
  facts : Array ShowDeclaration.Fact

public instance schemaForShowDeclaration : SchemaFor ShowDeclaration :=
  .structure "showDeclaration"
    [.single "definition" ShowDeclaration.definition,
     .arr "facts" ShowDeclaration.facts]

public structure Text where
  id : String
  content : String

public instance : SchemaFor Text :=
  .structure "text"
    [.single "id" Text.id,
     .single "content" Text.content]

end Data

end Grove.Framework.Backend.Full
