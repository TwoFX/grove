/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Meta.Basic
import Grove.Framework.HasId
import Grove.Framework.Declaration
import Grove.Framework.Subexpression
import Grove.JTD.Basic
import Grove.Framework.Declaration.Name

open Lean

namespace Grove.Framework

open JTD

inductive DataKind where
  | declaration : DataKind
  | subexpression : DataKind
deriving DecidableEq

instance : ToString DataKind where
  toString
    | .declaration => "declaration"
    | .subexpression => "subexpression"

instance : SchemaFor DataKind :=
  .enum "dataKind" [.declaration, .subexpression]

abbrev DataKind.Key : DataKind → Type
  | .declaration => Name
  | .subexpression => Subexpression

abbrev DataKind.State : DataKind → Type
  | .declaration => Declaration
  | .subexpression => Subexpression.State

instance : (kind : DataKind) → BEq kind.State
  | .declaration => inferInstance
  | .subexpression => inferInstance

def DataKind.getState : (kind : DataKind) → kind.Key → MetaM kind.State
  | .declaration, n => Declaration.ofName n
  | .subexpression, s => s.state

def DataKind.keyString : (kind : DataKind) → kind.Key → String
  | .declaration, n => n.toString
  | .subexpression, p => p.toString

def DataKind.reprState : (kind : DataKind) → kind.State → String
  | .declaration, s => s.repr
  | .subexpression, s => s.repr

structure DataSource (kind : DataKind) where
  getAll : MetaM (Array kind.Key)
  getById? : String → MetaM (Option kind.Key)

namespace DataSource

def map {k l : DataKind} (f : k.Key → l.Key) (s : DataSource k) : DataSource l where
  getAll := Array.map f <$> s.getAll
  getById? id := Option.map f <$> s.getById? id

def or {kind : DataKind} (s t : DataSource kind) : DataSource kind where
  getAll := return (← s.getAll) ++ (← t.getAll)
  getById? id := return (← s.getById? id) <|> (← t.getById? id)

def ofArray {kind : DataKind} (l : Array kind.Key) : DataSource kind :=
  let m : Std.HashMap String kind.Key := l.foldl (init := ∅) (fun sofar a => sofar.insert (kind.keyString a) a)
  {
    getAll := pure l
    getById? := (pure m[·]?)
  }

def declarationsInNamespace (n : Name) : DataSource .declaration where
  getAll := do
    let env ← getEnv
    let mut ans := #[]
    for (constName, _) in env.constants do
      if n.isPrefixOf constName then
        if ! (← Name.isAutoDecl constName) then
          ans := ans.push constName
    return ans
  getById? id := pure (some id.toName)

end DataSource

end Grove.Framework
