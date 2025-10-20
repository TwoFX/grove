/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Lean.Meta.Basic
import Lean.AddDecl
import Grove.Framework.HasId
import Grove.Framework.Declaration.Basic
public import Grove.Framework.Subexpression.Basic
public import Grove.JTD.Basic
public import Grove.Framework.LookupM

open Lean Meta

namespace Grove.Framework

open JTD

public inductive DataKind where
  | declaration : DataKind
  | subexpression : DataKind
deriving DecidableEq

instance : ToString DataKind where
  toString
    | .declaration => "declaration"
    | .subexpression => "subexpression"

@[no_expose]
public instance : SchemaFor DataKind :=
  .enum "dataKind" [.declaration, .subexpression]

public abbrev DataKind.Key : DataKind → Type
  | .declaration => Name
  | .subexpression => Subexpression

public abbrev DataKind.State : DataKind → Type
  | .declaration => Declaration
  | .subexpression => Subexpression.State

public instance : (kind : DataKind) → BEq kind.State
  | .declaration => inferInstance
  | .subexpression => inferInstance

public instance : (kind : DataKind) → Inhabited kind.Key
  | .declaration => inferInstance
  | .subexpression => inferInstance

public instance : (kind : DataKind) → Repr kind.State
  | .declaration => inferInstance
  | .subexpression => inferInstance

public def DataKind.getState : (kind : DataKind) → kind.Key → MetaM kind.State
  | .declaration, n => Declaration.ofName n
  | .subexpression, s => s.state

public def DataKind.keyString : (kind : DataKind) → kind.Key → String
  | .declaration, n => n.toString
  | .subexpression, p => p.toString

public def DataKind.reprState : (kind : DataKind) → kind.State → String
  | .declaration, s => s.repr
  | .subexpression, s => s.repr

public def DataKind.displayShort : (kind : DataKind) → kind.State → String
  | .declaration, s => s.name.toString
  | .subexpression, p => p.displayShort

public def DataKind.describeDifferences : (kind : DataKind) → kind.State → kind.State → Option String
  | .declaration, old, new => Declaration.describeDifferences old new
  | .subexpression, old, new => Subexpression.State.describeDifferences old new

public structure DataSource (kind : DataKind) where
  getAll : LookupM (Array kind.Key)
  getById? : String → LookupM (Option kind.Key)

namespace DataSource

public def map {k l : DataKind} (f : k.Key → l.Key) (s : DataSource k) : DataSource l where
  getAll := Array.map f <$> s.getAll
  getById? id := Option.map f <$> s.getById? id

public def or {kind : DataKind} (s t : DataSource kind) : DataSource kind where
  getAll := return (← s.getAll) ++ (← t.getAll)
  getById? id := return (← s.getById? id) <|> (← t.getById? id)

public def ofArray {kind : DataKind} (l : Array kind.Key) : DataSource kind :=
  let m : Std.HashMap String kind.Key := l.foldl (init := ∅) (fun sofar a => sofar.insert (kind.keyString a) a)
  {
    getAll := pure l
    getById? := (pure m[·]?)
  }

public structure DeclarationPredicate where
  check : Name → ConstantInfo → LookupM Bool

namespace DeclarationPredicate

public protected def true : DeclarationPredicate where
  check _ _ := pure true

public def and (p₁ p₂ : DeclarationPredicate) : DeclarationPredicate where
  check n c := p₁.check n c <&&> p₂.check n c

public def all (p : List DeclarationPredicate) : DeclarationPredicate where
  check n c := p.allM (·.check n c)

public def not (p : DeclarationPredicate) : DeclarationPredicate where
  check n c := (!·) <$> p.check n c

public def notAutoDecl : DeclarationPredicate where
  check n _ := (!·) <$> isAutoDecl n

public def notInternalName : DeclarationPredicate where
  check n _ := pure (!n.anyS (·.endsWith "Internal"))

public def notInternal : DeclarationPredicate :=
  notAutoDecl.and notInternalName

public def inNamespace (namesp : Name) : DeclarationPredicate where
  check n _ := pure <| namesp.isPrefixOf n

public def notInNamespace (namesp : Name) : DeclarationPredicate :=
  not (inNamespace namesp)

public def notInNamespaces (namesps : List Name) : DeclarationPredicate :=
  all (namesps.map notInNamespace)

public def disallow (names : List Name) : DeclarationPredicate :=
  let set : NameSet := .ofList names
  ⟨fun n _ => pure <| !set.contains n⟩

public def isTheorem : DeclarationPredicate where
  check _ c := checkConstant c
where
  -- TODO: duplicated in Declaration/Basic.lean
  checkConstant (c : ConstantInfo) : MetaM Bool := do
    if Lean.getOriginalConstKind? (← getEnv) c.name == some .thm then
      return Bool.true

    try
      let t ← inferType c.type
      return t.isProp
    catch
      | _ => return false

public def isDefinition : DeclarationPredicate :=
  not isTheorem

end DeclarationPredicate

public def declarationsMatching (pred : DeclarationPredicate) (allowInternal : Bool := false) :
    DataSource .declaration :=
  let pred := if allowInternal then pred else DeclarationPredicate.notInternal.and pred
  { getAll := do
      let env ← getEnv
      let mut ans := #[]
      for (constName, info) in env.constants do
        if ← pred.check constName info then
          ans := ans.push constName
      return ans
    getById? id := do
      let env ← getEnv
      let name := id.toName
      let some decl := env.find? name | return none
      match ← pred.check name decl with
      | false => pure none
      | true => pure (some name) }

public def definitionsInNamespace (namesp : Name)
    (additionalCheck : DeclarationPredicate := DeclarationPredicate.true) : DataSource .declaration :=
  declarationsMatching <| DeclarationPredicate.all
    [DeclarationPredicate.inNamespace namesp, .isDefinition, additionalCheck]

end DataSource

end Grove.Framework
