/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Full

open Grove.JTD

def main : IO Unit := do
  IO.println (schemaJson Grove.Framework.Backend.Full.Data.Project)
