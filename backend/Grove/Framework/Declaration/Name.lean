/-
Copyright (c) 2025 Batteries authors, Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Batteries authors, Markus Himmel
-/
module

public import Lean.Meta.Basic
import Lean.Structure
import Lean.AddDecl
import Lean.Linter.Deprecated

open Lean Meta

namespace Grove.Framework.Name

-- From Batteries, modified to include `rec`.
public def computeIsAutoDecl (decl : Name) : MetaM Bool := do
  if decl.hasMacroScopes then return true
  if decl.isInternal then return true
  let env ← getEnv
  if isReservedName env decl then return true
  if let Name.str n s := decl then
    if s.startsWith "proof_" || s.startsWith "match_" || s.startsWith "unsafe_" then return true
    if env.isConstructor n && ["injEq", "inj", "sizeOf_spec"].any (· == s) then
      return true
    if let ConstantInfo.inductInfo _ := (← getEnv).find? n then
      if s.startsWith "brecOn_" || s.startsWith "below_" || s.startsWith "binductionOn_"
        || s.startsWith "ibelow_" then return true
      if [casesOnSuffix, recOnSuffix, brecOnSuffix, belowSuffix, "ibelow",
          "ndrec", "ndrecOn", "noConfusionType", "noConfusion", "toCtorIdx", "rec"
        ].any (· == s) then
        return true
      if let some _ := isSubobjectField? env n (.mkSimple s) then
        return true
  pure false

public def computeIsTheorem (n : Name) : MetaM Bool := do
  if getOriginalConstKind? (← getEnv) n == some .thm then
    return true

  try
    let some constantInfo := (← getEnv).find? n | return false
    return (← inferType constantInfo.type).isProp
  catch
    | _ => return false

public def computeIsDeprecated (n : Name) : MetaM Bool := do
  return Lean.Linter.isDeprecated (← getEnv) n

end Grove.Framework.Name
