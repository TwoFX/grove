/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Framework.Declaration
import Grove.Framework.Search

open Lean Meta

namespace Grove.Framework

structure PredicateSubexpression where
  displayShort : String
  predicate : ExprPred
  computeTargetNamespace : (sourceNamespace : Name) → (allowedTargetNamespaces : List Name) → MetaM Name

def PredicateSubexpression.key (p : PredicateSubexpression) : String :=
  p.predicate.key

structure PredicateSubexpression.State where
  key : String
  displayShort : String
deriving BEq, Repr

inductive Subexpression where
  | declaration : Name → Subexpression
  | predicate : PredicateSubexpression → Subexpression

instance : Inhabited Subexpression where
  default := .declaration .anonymous

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

def Subexpression.State.displayShort : Subexpression.State → String
  | .declaration d => d.name.toString
  | .predicate p => p.displayShort

def Subexpression.State.describeDifferences : Subexpression.State → Subexpression.State → Option String
  | .declaration old, .declaration new  => Declaration.describeDifferences old new
  | old, new => if old == new then none else some s!"Used to be {displayShort old}, but now is {displayShort new}."

def Subexpression.computeTargetNamespace (s : Subexpression) (sourceNamespace : Name)
    (allowedTargetNamespaces : List Name) : MetaM Name :=
  match s with
  | .predicate p => p.computeTargetNamespace sourceNamespace allowedTargetNamespaces
  | .declaration n => do
    let some info := (← getEnv).find? n | return sourceNamespace
    let usedConstants := info.getUsedConstantsAsSet
    return allowedTargetNamespaces.find? usedConstants.contains |>.getD sourceNamespace

end Grove.Framework
