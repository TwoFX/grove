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
  /--
  Constants that occur in every expression for which `check` returns `true`. This is used to
  cheaply rule out expressions before traversing all of their subexpressions.
  -/
  requiredConstants : Array Name := #[]

namespace ExprPred

public def any : ExprPred where
  check _ := true
  key := "*"

public def const (n : Name) : ExprPred where
  check e := e.isConstOf n
  key := n.toString
  requiredConstants := #[n]

public def app (l r : ExprPred) : ExprPred where
  check e :=
    match e with
    | .app lhs rhs => l.check lhs && r.check rhs
    | _ => false
  key := s!"app ({l.key}) ({r.key})"
  requiredConstants := l.requiredConstants ++ r.requiredConstants

public def appOf (n : Name) : ExprPred where
  check e := e.isAppOf n
  key := s!"{n}*"
  requiredConstants := #[n]

public def app2 (l r₁ r₂ : ExprPred) : ExprPred :=
  .app (.app l r₁) r₂

public def app3 (l r₁ r₂ r₃ : ExprPred) : ExprPred :=
  .app (.app2 l r₁ r₂) r₃

/--
Checks whether some subexpression of `e` satisfies the predicate. `usedConstants` must be the set
of constants occurring in `e`. It is used to skip the traversal of `e` entirely if one of the
constants required by the predicate does not occur in `e`.
-/
public def occurs (p : ExprPred) (e : Expr) (usedConstants : NameSet) : Bool :=
  p.requiredConstants.all usedConstants.contains && (Expr.find? p.check e).isSome

end ExprPred

public inductive SearchKey where
  | byName : Name → SearchKey
  | byExpr : ExprPred → SearchKey

namespace SearchKey

public def «matches» (s : SearchKey) (e : Expr) (usedConstants : NameSet) : Bool :=
  match s with
  | byName n => usedConstants.contains n
  | byExpr p => p.occurs e usedConstants

public def id : SearchKey → String
  | byName n => n.toString
  | byExpr p => p.key

end SearchKey

end Grove.Framework
