/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Fact
import StdMetadata.Framework.Declaration

open Lean

namespace StdMetadata.Framework.Widget

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

def validate (s : ShowDeclaration) (f : Fact) : MetaM Fact.ValidationResult := do
  let currentState ← Declaration.fromName s.name

  if f.state == currentState then
    return .ok

  return .invalidated (Declaration.describeDifferences f.state currentState)

instance : Framework.Fact ShowDeclaration ShowDeclaration.Fact where
  validate := validate

end Fact

end ShowDeclaration

end StdMetadata.Framework.Widget
