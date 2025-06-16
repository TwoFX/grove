/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import Grove.Framework.HasId
import Grove.Framework.Declaration

open Lean

namespace Grove.Framework

structure DataSource (β : Type) where
  getAll : MetaM (Array β)
  getById? : String → MetaM (Option β)

namespace DataSource

def map (f : α → β) (s : DataSource α) : DataSource β where
  getAll := Array.map f <$> s.getAll
  getById? id := Option.map f <$> s.getById? id

def or (s t : DataSource α) : DataSource α where
  getAll := return (← s.getAll) ++ (← t.getAll)
  getById? id := return (← s.getById? id) <|> (← t.getById? id)

def ofArray {α : Type} [HasId α] (l : Array α) : DataSource α :=
  let m : Std.HashMap String α := l.foldl (init := ∅) (fun sofar a => sofar.insert (HasId.getId a) a)
  {
    getAll := pure l
    getById? := (pure m[·]?)
  }

def definitionsInNamespace (n : Name) : DataSource Name where
  getAll := do
    let env ← getEnv
    let mut ans := #[]
    for (constName, _) in env.constants do
      if n.isPrefixOf constName then
        -- Missing: is this a definition?
        ans := ans.push constName
    return ans
  getById? id := pure (some id.toName)

end DataSource

end Grove.Framework
