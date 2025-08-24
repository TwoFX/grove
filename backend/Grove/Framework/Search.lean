/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Lean.Expr
import Lean.Util.FindExpr

open Lean

namespace Grove.Framework

public structure ExprPred where
  check : Expr → Bool
  key : String

namespace ExprPred

public def any : ExprPred where
  check _ := true
  key := "*"

public def const (n : Name) : ExprPred where
  check e := e.isConstOf n
  key := n.toString

public def app (l r : ExprPred) : ExprPred where
  check e :=
    match e with
    | .app lhs rhs => l.check lhs && r.check rhs
    | _ => false
  key := s!"app ({l.key}) ({r.key})"

public def appOf (n : Name) : ExprPred where
  check e := e.isAppOf n
  key := s!"{n}*"

public def app2 (l r₁ r₂ : ExprPred) : ExprPred :=
  .app (.app l r₁) r₂

public def app3 (l r₁ r₂ r₃ : ExprPred) : ExprPred :=
  .app (.app2 l r₁ r₂) r₃

def occurs (p : ExprPred) (e : Expr) : Bool :=
  Expr.find? p.check e |>.isSome

end ExprPred

public inductive SearchKey where
  | byName : Name → SearchKey
  | byExpr : ExprPred → SearchKey

namespace SearchKey

public def «matches» (s : SearchKey) (e : Expr) (usedConstants : NameSet) : Bool :=
  match s with
  | byName n => usedConstants.contains n
  | byExpr p => p.occurs e

public def id : SearchKey → String
  | byName n => n.toString
  | byExpr p => p.key

end SearchKey

end Grove.Framework
