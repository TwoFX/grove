/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Full
import Lean
import Std

open Lean

namespace Grove.Framework

def perform (rootNode : Node) (addFacts : FactStateM Unit) : MetaM String :=
  Grove.Framework.Backend.Full.render rootNode addFacts

def main (rootNode : Node) (addFacts : FactStateM Unit) (imports : Array Name) : IO Unit := do
  Lean.initSearchPath (← Lean.findSysroot)
  unsafe enableInitializersExecution
  let env: Environment ← importModules
    (imports := imports.map ({ module := · }))
    (opts := {})
    (trustLevel := 1)
    (loadExts := true)
  let coreContext: Lean.Core.Context := {
    currNamespace := `Example
    openDecls := [],     -- No 'open' directives needed
    fileName := "<stdin>",
    fileMap := { source := "", positions := #[0] }
  }
  match ← ((perform rootNode addFacts).run'.run' coreContext { env }).toBaseIO with
  | .error exception =>
    IO.println s!"{← exception.toMessageData.toString}"
  | .ok s => IO.println s

end Grove.Framework
