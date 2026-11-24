/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Basic
public import Grove.Framework.Backend.RenderM.Basic

open Lean

namespace Grove.Framework

open Widget Backend.Full

/-- Prints the result of each check of the assertion. -/
public def Widget.Assertion.print (a : Assertion) : RenderM String := do
  let results ← a.check
  -- Failed checks are usually the interesting ones, so they come first.
  let (failed, passed) := results.partition (!·.passed)
  let lines := (failed ++ passed).toList.map fun r =>
    s!"[{if r.passed then "PASS" else "FAIL"}] {r.assertionId}: {r.description}\n       {r.message}"
  let header := s!"{a.title} ({a.widgetId})\n{a.description}"
  let summary := s!"{passed.size} of {results.size} checks passed."
  return "\n\n".intercalate [header, "\n".intercalate lines, summary]

namespace Node

public def id : Node → String
  | .section id _ _ => id
  | .namespace n => n.toString
  | @associationTable _ _ _ _ _ t => t.id
  | @table _ _ _ _ _ _ _ _ t => t.id
  | .assertion a => a.widgetId
  | .showDeclaration s => s.id
  | .text t => t.id

/-- Finds the node with the given ID in the tree rooted at `n`. -/
public partial def find? (n : Node) (id : String) : Option Node :=
  if n.id == id then
    some n
  else match n with
    | .section _ _ children => children.findSome? (·.find? id)
    | _ => none

/--
Returns an action that prints the node's current state to the command line, if the node supports
this. This is used by the `print-widget` executable.
-/
public def print? : Node → Option (RenderM String)
  | .assertion a => some a.print
  | _ => none

end Node

/-- Runs a `RenderM` action using the restored state of the project. -/
public def Project.runRenderM {α : Type} (p : Project) (x : RenderM α) : MetaM α := do
  let restoreContext : RestoreContext := { renamings := Std.HashMap.ofArray p.renamings }
  return (← RenderM.run (← p.restoreState.run restoreContext) restoreContext x).1

end Grove.Framework
