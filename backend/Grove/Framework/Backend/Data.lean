/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Grove.Framework.Basic
import Grove.Framework.Widget.State
public import Grove.JTD.Basic
public import Grove.Framework.Fact

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
