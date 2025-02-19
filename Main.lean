/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Prototype
import Lean
import Std

open Lean

def hashMaps : Array Name := #[`Std.DHashMap, `Std.HashMap, `Std.HashSet]
def numericTypes : Array Name := #[``Nat, ``Int, ``Fin, ``BitVec, ``UInt8, ``UInt16, ``UInt32, ``UInt64, ``USize,
  ``Int8, ``Int16, ``Int32, ``Int64, ``ISize]

-- def doIt (types : Array Name) : MetaM Unit := do
--   let nameset : NameSet := types.foldl (init := NameSet.empty) (fun s n => s.insert n)
--   let json : String := (← types.mapM (namespaceInfo · nameset)) |> toJson |> toString
--   IO.FS.writeFile "/home/markus/api-manager.json" json

def perform : MetaM String := do
  let json := toJson (← StdMetadata.Prototype.calculateExternalResult numericTypes)
  return toString json

def main : IO Unit := do
  Lean.initSearchPath (← Lean.findSysroot)
  let env: Environment ← importModules
    (imports := #[`Init, `Std, `Lean])
    (opts := {})
    (trustLevel := 1)
  let coreContext: Lean.Core.Context := {
    currNamespace := `Example
    openDecls := [],     -- No 'open' directives needed
    fileName := "<stdin>",
    fileMap := { source := "", positions := #[0] }
  }
  match ← (perform.run'.run' coreContext { env }).toBaseIO with
  | .error exception =>
    IO.println s!"{← exception.toMessageData.toString}"
  | .ok s => IO.println s
