/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Fact
public import Grove.Framework.Declaration.Basic

open Lean

namespace Grove.Framework.Widget

public structure ShowDeclaration where
  id : String
  name : Lean.Name

namespace ShowDeclaration

public structure Fact where
  widgetId : String
  factId : String
  metadata : Fact.Metadata
  state : Declaration

namespace Fact

public def validate (currentState : Declaration) (f : Fact) : Fact.ValidationResult :=
  match Declaration.describeDifferences f.state currentState with
  | none => .ok
  | some message => .invalidated ⟨"Declaration has changed", message⟩

end Fact

end ShowDeclaration

end Grove.Framework.Widget
