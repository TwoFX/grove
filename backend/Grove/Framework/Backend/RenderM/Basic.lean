/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Grove.Framework.Declaration.Basic
public import Grove.Framework.Widget.State
public import Std.Data.HashMap

open Lean

namespace Grove.Framework.Backend.Full

open Widget

section RenderM

public structure RenderState where
  /-- The current state of every declaration that has been looked up so far. -/
  declarationCache : Std.HashMap Name Declaration := ∅
  /--
  The declarations referenced by some widget, in the order in which they were first referenced.
  These are the declarations that appear in the output.
  -/
  usedDeclarations : Array Name := #[]
  /-- The referenced declarations together with their names rendered as strings. -/
  usedDeclarationNames : Std.HashMap Name String := ∅

public abbrev RenderM := StateRefT RenderState (ReaderT RestoreContext (ReaderT SavedState LookupM))

/--
Returns the current state of the declaration `n`, computing it if it has not been computed yet.
This does not mark the declaration as referenced, so it will not be part of the output unless it
is referenced somewhere else.
-/
public def lookupDeclaration (n : Name) : RenderM Declaration := do
  if let some d := (← get).declarationCache[n]? then
    return d
  let d ← Declaration.ofName n
  modify fun s => { s with declarationCache := s.declarationCache.insert n d }
  return d

/--
Marks the declaration `n` as referenced by some widget, so that it will be part of the output, and
returns the name rendered as a string. The current state of the declaration is not computed at this
point, see `computeDeclarations`.

Declarations are typically referenced many times (a lemma usually appears in several cells of a
table), so the rendered name is cached.
-/
public def registerDeclaration (n : Name) : RenderM String := do
  if let some str := (← get).usedDeclarationNames[n]? then
    return str
  let str := n.toString
  modify fun s =>
    { s with
      usedDeclarations := s.usedDeclarations.push n
      usedDeclarationNames := s.usedDeclarationNames.insert n str }
  return str

/--
Like `registerDeclaration`, but for many declarations at once. This is much cheaper than calling
`registerDeclaration` for every declaration when there are many of them (tables typically have
hundreds of thousands of cell entries).
-/
public def registerDeclarations (ns : Array Name) : RenderM (Array String) :=
  modifyGet fun s => Id.run do
    let mut s := s
    let mut strs := Array.mkEmpty ns.size
    for n in ns do
      match s.usedDeclarationNames[n]? with
      | some str => strs := strs.push str
      | none =>
        let str := n.toString
        s := { s with
          usedDeclarations := s.usedDeclarations.push n
          usedDeclarationNames := s.usedDeclarationNames.insert n str }
        strs := strs.push str
    return (strs, s)

/-- Marks the declaration `n` as referenced and returns its current state. -/
public def getDeclaration (n : Name) : RenderM Declaration := do
  discard <| registerDeclaration n
  lookupDeclaration n

/-- Like `DataKind.getState`, but makes use of the declaration cache. -/
public def getState (kind : DataKind) (key : kind.Key) : RenderM kind.State :=
  match kind, key with
  | .declaration, n => lookupDeclaration n
  | .subexpression, .declaration n => .declaration <$> lookupDeclaration n
  | .subexpression, s => s.state
  | .synthesis, k => Synthesis.State.of k

/-- Returns the referenced declarations whose current state has not been computed yet. -/
public def pendingDeclarations : RenderM (Array Name) := do
  let s ← get
  return s.usedDeclarations.filter (!s.declarationCache.contains ·)

/--
Computes the current state of the given declarations in parallel and adds them to the cache.
Computing the state of a declaration involves pretty-printing its signature, which is expensive,
so this is much faster than computing the declarations one after the other.
-/
public def computeDeclarations (names : Array Name) : RenderM Unit := do
  let computed ← LookupM.parallelMap names (fun n => return (n, ← Declaration.ofName n))
  modify fun s => { s with declarationCache := s.declarationCache.insertMany computed }

/--
Returns the current state of all referenced declarations, in the order in which they were first
referenced.
-/
public def collectUsedDeclarations : RenderM (Array Declaration) := do
  (← get).usedDeclarations.mapM lookupDeclaration

public def RenderM.run {α : Type} (s : SavedState) (rc : RestoreContext) (r : RenderM α) : MetaM (α × RenderState) :=
  (StateRefT'.run r { }).run rc |>.run s |>.run

end RenderM

end Grove.Framework.Backend.Full
