/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Grove.Framework.HasId
import Grove.Markdown.Basic
public import Lean.Meta.Basic
import Lean.AddDecl
import Lean.PrettyPrinter
import Lean.Linter.Deprecated
import Lean.Meta.Tactic.Simp.Attr

open Lean Meta

namespace Grove.Framework

-- TODO: make private after https://github.com/leanprover/lean4/issues/10098 is fixed
public structure Theorem where
  name : Name
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool
deriving BEq, Repr

-- TODO: make private after https://github.com/leanprover/lean4/issues/10098 is fixed
public structure Definition where
  name : Name
  renderedStatement : String
  isDeprecated : Bool
deriving BEq, Repr

public inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : Name → Declaration
deriving BEq, Repr

namespace Declaration

public def repr (d : Declaration) : String :=
  (_root_.repr d).pretty

public def name : Declaration → Name
  | Declaration.thm t => t.name
  | Declaration.def d => d.name
  | Declaration.missing n => n

def longDescription : Declaration → String
  | Declaration.thm t => t.renderedStatement
  | Declaration.def d => d.renderedStatement
  | Declaration.missing n => s!"Missing: {n}"

instance : HasId Declaration where
  getId d := d.name.toString

private def isTheorem (c : ConstantInfo) : MetaM Bool := do
  if getOriginalConstKind? (← getEnv) c.name == some .thm then
    return true

  try
    return (← inferType c.type).isProp
  catch
    | _ => return false

def isSimpTheorem (n : Name) : MetaM Bool :=
  return (← getSimpTheorems).lemmaNames.contains (.decl n)

public def ofName (n : Name) : MetaM Declaration := do
  let c? := (← getEnv).find? n

  if let some c := c? then
    let renderedStatement := (← Lean.PrettyPrinter.ppSignature n).fmt.pretty (width := 100)
    let isDeprecated := Lean.Linter.isDeprecated (← getEnv) n

    if ← isTheorem c then
      let isSimp ← isSimpTheorem n
      return Declaration.thm {
        name := n
        renderedStatement
        isSimp
        isDeprecated
      }
    else
      return Declaration.def {
        name := n
        renderedStatement
        isDeprecated
      }
  else
    return Declaration.missing n

def describeType : Declaration → String
  | Declaration.thm _ => "theorem"
  | Declaration.def _ => "definition"
  | Declaration.missing _  => "missing"

public def describeDifferences : Declaration → Declaration → Option String
  | Declaration.thm t₁, Declaration.thm t₂ =>
      let differences :=
        compareName t₁.name.toString t₂.name.toString
        ++ compareStatement t₁.renderedStatement t₂.renderedStatement
        ++ compareBool "simp" t₁.isSimp t₂.isSimp
        ++ compareBool "deprecated" t₁.isDeprecated t₂.isDeprecated
      if differences.isEmpty then none else some (Markdown.render differences)
  | Declaration.def d₁, Declaration.def d₂ =>
      let differences :=
        compareName d₁.name.toString d₂.name.toString
        ++ compareStatement d₁.renderedStatement d₂.renderedStatement
        ++ compareBool "deprecated" d₁.isDeprecated d₂.isDeprecated
      if differences.isEmpty then none else some (Markdown.render differences)
  | Declaration.missing m₁, Declaration.missing m₂ =>
      let differences := compareName m₁.toString m₂.toString
      if differences.isEmpty then none else some (Markdown.render differences)
  | d₁, d₂ => some s!"Used to be {d₁.describeType}, but now is {d₂.describeType}."
where
  compareName (n₁ n₂ : String) : List Markdown.Paragraph :=
    if n₁ = n₂ then [] else [s!"Name used to be `{n₁}` but now is `{n₂}`."]
  compareStatement (s₁ s₂ : String) : List Markdown.Paragraph :=
    if s₁ = s₂ then [] else ["Statement used to be", .codeBlock s₁, "but now is", .codeBlock s₂]
  compareBool (name : String) (b₁ b₂ : Bool) : List Markdown.Paragraph :=
    if b₁ = b₂ then [] else
      [s!"Used to be {if b₁ then "" else "not "}{name} but now is {if b₂ then "" else "not "}{name}."]

end Declaration

end Grove.Framework
