/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Framework.HasId
import Lean.Meta.Basic
import Lean.AddDecl
import Lean.PrettyPrinter
import Lean.Linter.Deprecated
import Lean.Meta.Tactic.Simp.Attr

open Lean Meta

namespace StdMetadata.Framework

structure Theorem where
  name : Name
  renderedStatement : String
  isSimp : Bool
  isDeprecated : Bool
deriving BEq, Repr

structure Definition where
  name : Name
  renderedStatement : String
  isDeprecated : Bool
deriving BEq, Repr

inductive Declaration where
  | thm : Theorem → Declaration
  | def : Definition → Declaration
  | missing : Name → Declaration
deriving BEq, Repr

namespace Declaration

def name : Declaration → Name
  | .thm t => t.name
  | .def d => d.name
  | .missing n => n

instance : HasId Declaration where
  getId d := d.name.toString

private def isTheorem (c : ConstantInfo) : MetaM Bool := do
  if getOriginalConstKind? (← getEnv) c.name == some .thm then
    return true

  try
    return (← inferType c.type).isProp
  catch
    | _ => return false

private def isSimpTheorem (n : Name) : MetaM Bool :=
  return (← getSimpTheorems).lemmaNames.contains (.decl n)

def fromName (n : Name) : MetaM Declaration := do
  let c? := (← getEnv).find? n

  if let some c := c? then
    let renderedStatement := (← Lean.PrettyPrinter.ppSignature n).fmt.pretty
    let isDeprecated := Lean.Linter.isDeprecated (← getEnv) n

    if ← isTheorem c then
      let isSimp ← isSimpTheorem n
      return .thm {
        name := n
        renderedStatement
        isSimp
        isDeprecated
      }
    else
      return .def {
        name := n
        renderedStatement
        isDeprecated
      }
  else
    return .missing n

def describeDifferences (d₁ d₂ : Declaration) : String :=
  s!"First is {repr d₁}, second is {repr d₂}."

end Declaration

end StdMetadata.Framework
