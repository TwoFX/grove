/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Backend.Full
import Lean
import Std
import Grove.Cli

open Lean Cli

namespace Grove.Framework

def perform (p : Project) (imports : Array Name) (fullFileName? invalidatedFileName? : Option String) : IO UInt32 := do
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
    maxHeartbeats := 0
  }
  match ← ((Grove.Framework.Backend.Full.render p).run'.run' coreContext { env }).toBaseIO with
  | .error exception =>
    IO.println s!"Internal error: {← exception.toMessageData.toString}"
    return 2
  | .ok (.error message) =>
    IO.println message
    return 1
  | .ok (.ok rendered) =>
    if let some fullFileName := fullFileName? then
      IO.FS.writeFile fullFileName rendered.fullOutput
    if let some invalidatedFileName := invalidatedFileName? then
      IO.FS.writeFile invalidatedFileName rendered.invalidatedFacts

    return 0

def perform' (p : Project) (imports : Array Name) (args : Parsed) : IO UInt32 :=
  perform p imports (args.flagAs? "full" String) (args.flagAs? "invalidated" String)

def renderCmd (p : Project) (imports : Array Name) : Cmd :=
  let perf := perform' p imports
  `[Cli|
    render VIA perf; ["0.0.1"]
    "Grove data collection"

    FLAGS:
      full : String; "Location of the full output file"
      invalidated : String; "Location of the invalidated facts output file"
  ]

def main (p : Project) (imports : Array Name) (args : List String) : IO UInt32 := do
  (renderCmd p imports).validate args

end Grove.Framework
