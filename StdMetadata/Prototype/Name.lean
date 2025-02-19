/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Lean

open Lean

-- From Batteries, modified to include `rec`.
def Lean.Name.isAutoDecl (decl : Name) : CoreM Bool := do
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
      if [casesOnSuffix, recOnSuffix, brecOnSuffix, binductionOnSuffix, belowSuffix, "ibelow",
          "ndrec", "ndrecOn", "noConfusionType", "noConfusion", "ofNat", "toCtorIdx", "rec"
        ].any (· == s) then
        return true
      if let some _ := isSubobjectField? env n (.mkSimple s) then
        return true
  pure false

def Lean.Name.dropPrefix (n : Nat) (nm : Name) : Name :=
  go (nm.getNumParts - n) nm
where
  go : Nat → Name → Name
  | 0, _ => .anonymous
  | n + 1, .str nm s => .str (go n nm) s
  | n + 1, .num nm s => .num (go n nm) s
  | _ + 1, .anonymous => .anonymous

def Lean.Name.dropPrefix? : Name → Name → Option Name
  | p, .anonymous => if p == .anonymous then some .anonymous else none
  | p, n@(.num p' i) => if p == n then some .anonymous else dropPrefix? p p' |>.map (.num · i)
  | p, n@(.str p' s) => if p == n then some .anonymous else dropPrefix? p p' |>.map (.str · s)
