/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.Backend.Full

open StdMetadata.JTD

def main : IO Unit := do
  IO.println (schemaJson StdMetadata.Framework.Backend.Full.Data.Node)
