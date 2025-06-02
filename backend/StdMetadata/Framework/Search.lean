/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean.Util.FindExpr

open Lean

namespace StdMetadata.Framework

structure ExprPred where
  check : Expr → Bool
  key : String

namespace ExprPred

def any : ExprPred where
  check _ := true
  key := "*"

def const (n : Name) : ExprPred where
  check e := e.isConstOf n
  key := n.toString

def app (l r : ExprPred) : ExprPred where
  check e :=
    match e with
    | .app lhs rhs => l.check lhs && r.check rhs
    | _ => false
  key := s!"app ({l.key}) ({r.key})"

def appOf (n : Name) : ExprPred where
  check e := e.isAppOf n
  key := s!"{n}*"

def app2 (l r₁ r₂ : ExprPred) : ExprPred :=
  .app (.app l r₁) r₂

def app3 (l r₁ r₂ r₃ : ExprPred) : ExprPred :=
  .app (.app2 l r₁ r₂) r₃

def occurs (p : ExprPred) (e : Expr) : Bool :=
  Expr.find? p.check e |>.isSome

end ExprPred

inductive SearchKey where
  | byName : Name → SearchKey
  | byExpr : ExprPred → SearchKey

namespace SearchKey

def «matches» (s : SearchKey) (e : Expr) (usedConstants : NameSet) : Bool :=
  match s with
  | byName n => usedConstants.contains n
  | byExpr p => p.occurs e

def id : SearchKey → String
  | byName n => n.toString
  | byExpr p => p.key

end SearchKey

end StdMetadata.Framework
