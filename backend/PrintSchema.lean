/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Full
import Grove.Cli

open Grove.JTD Cli

def printSchema (args : Parsed) : IO UInt32 := do
  if let some fullFileName := args.flagAs? "full" String then
    IO.FS.writeFile fullFileName
      (toString <| schemaJson Grove.Framework.Backend.Full.Data.Project)

  if let some invalidatedFileName := args.flagAs? "invalidated" String then
    IO.FS.writeFile invalidatedFileName
      (toString <| schemaJson Grove.Framework.Backend.Full.Data.InvalidatedFacts)

  return 0

def printSchemaCmd : Cmd := `[Cli|
  printSchema VIA printSchema; ["0.0.1"]
  "Print JTD schemas for Grove"

  FLAGS:
    full : String; "Location of the schema file for the full output"
    invalidated : String; "Location of the schema file for invalidated facts"
]

def main (args : List String) : IO UInt32 := do
  printSchemaCmd.validate args
