/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Basic
import Grove.Framework.Backend.Full
import Grove.Framework.Backend.Print
import Lean
import Std
import Grove.Cli
import Grove.Framework.Log

open Lean Cli

namespace Grove.Framework

/-- Imports the given modules and runs `action` in the resulting environment. -/
def runInEnvironment {α : Type} (imports : Array Name) (action : MetaM α) (logImports : Bool := true) :
    IO (Except Exception α) := do
  Lean.initSearchPath (← Lean.findSysroot)
  unsafe enableInitializersExecution
  let doImport := importModules
    (imports := imports.map ({ module := · }))
    (opts := {})
    (trustLevel := 1)
    -- The environment is needed until the very end, so we never want to free it. Marking it
    -- persistent (which is what `leakEnv` does) also disables reference counting for it, which
    -- avoids a lot of contention when pretty-printing declarations on multiple threads.
    (leakEnv := true)
    (loadExts := true)
  let env: Environment ← if logImports then timedLog "" "Importing modules" none doImport else doImport
  let coreContext: Lean.Core.Context := {
    currNamespace := `Example
    openDecls := [],     -- No 'open' directives needed
    fileName := "<stdin>",
    fileMap := { source := "", positions := #[0] }
    maxHeartbeats := 0
  }
  (action.run'.run' coreContext { env }).toBaseIO

def perform (p : Project) (imports : Array Name) (fullFileName? invalidatedFileName? : Option String) : IO UInt32 := do
  match ← runInEnvironment imports (Grove.Framework.Backend.Full.render p) with
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

public def main (p : Project) (imports : Array Name) (args : List String) : IO UInt32 := do
  (renderCmd p imports).validate args

def printWidget (p : Project) (imports : Array Name) (widgetId : String) : IO UInt32 := do
  let some node := p.rootNode.find? widgetId
    | IO.eprintln s!"There is no widget with ID {widgetId}."
      return 1
  let some print := node.print?
    | IO.eprintln s!"Widget {widgetId} does not support printing to the command line."
      return 1
  match ← runInEnvironment imports (p.runRenderM print) (logImports := false) with
  | .error exception =>
    IO.eprintln s!"Internal error: {← exception.toMessageData.toString}"
    return 2
  | .ok output =>
    IO.println output
    return 0

def printWidget' (p : Project) (imports : Array Name) (args : Parsed) : IO UInt32 :=
  printWidget p imports (args.positionalArg! "widgetId" |>.as! String)

def printWidgetCmd (p : Project) (imports : Array Name) : Cmd :=
  let perf := printWidget' p imports
  `[Cli|
    printWidget VIA perf; ["0.0.1"]
    "Print the current state of a Grove widget"

    ARGS:
      widgetId : String; "ID of the widget to print"
  ]

/-- Entry point for an executable that prints a single widget to the command line. -/
public def printWidgetMain (p : Project) (imports : Array Name) (args : List String) : IO UInt32 := do
  (printWidgetCmd p imports).validate args

end Grove.Framework
