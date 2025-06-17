/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Declaration
import Grove.Framework.Search

open Lean

namespace Grove.Framework

structure PredicateSubexpression where
  key : String
  displayShort : String
  predicate : ExprPred

structure PredicateSubexpression.State where
  key : String
  displayShort : String
deriving BEq, Repr

def PredicateSubexpression.State.renderInfo (p : PredicateSubexpression.State) : RenderInfo where
  value := p.key
  shortDescription := p.displayShort
  longDescription := p.displayShort
  reference := .none
  stateRepr := p.key

inductive Subexpression where
  | declaration : Name → Subexpression
  | predicate : PredicateSubexpression → Subexpression

def Subexpression.searchKey : Subexpression → SearchKey
  | declaration n => .byName n
  | predicate p => .byExpr p.predicate

def Subexpression.matches (s : Subexpression) (e : Expr) (usedConstants : NameSet) : Bool :=
  s.searchKey.matches e usedConstants

instance : HasId Subexpression where
  getId s := s.searchKey.id

def Declaration.toSubexpression (d : Declaration) : Subexpression :=
  .declaration d.name

inductive Subexpression.State where
  | declaration : Declaration → Subexpression.State
  | predicate : PredicateSubexpression.State → State
deriving BEq, Repr

def Subexpression.state : Subexpression → MetaM Subexpression.State
  | .declaration n => .declaration <$> Declaration.ofName n
  | .predicate p => pure <| .predicate ⟨p.key, p.displayShort⟩

def Subexpression.toString : Subexpression → String
  | .declaration n => n.toString
  | .predicate p => p.key

def Subexpression.State.repr (s : Subexpression.State) : String :=
  (_root_.repr s).pretty

def Subexpression.State.renderInfo : Subexpression.State → RenderInfo
  | .declaration d => d.renderInfo
  | .predicate p => p.renderInfo

end Grove.Framework
