/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Fact
import Grove.Framework.Declaration

open Lean

namespace Grove.Framework.Widget

structure ShowDeclaration where
  id : String
  name : Lean.Name

namespace ShowDeclaration

structure Fact where
  widgetId : String
  factId : String
  metadata : Fact.Metadata
  state : Declaration

namespace Fact

def validate (currentState : Declaration) (f : Fact) : MetaM Fact.ValidationResult := do
  if f.state == currentState then
    return .ok

  return .invalidated (Declaration.describeDifferences f.state currentState)

end Fact

end ShowDeclaration

end Grove.Framework.Widget
