/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.Prototype.DeclarationInfo
-- import Std.import Std.Dat
import Lean

set_option autoImplicit false

universe u v w x

open Lean Meta

namespace Grove.Prototype

/-!
# Step 1: Collect all relevant declarations
-/

structure NamespaceInfo where
  key : String -- this is going to be the (full) name of the namespace. Currently identical to `name`.
  name : Name
  definitions : Array DeclarationInfo

def NamespaceInfo.addDeclaration (d : DeclarationInfo) (n : NamespaceInfo) : NamespaceInfo :=
  { n with definitions := n.definitions.push d }

structure DefinitionsResult where
  allDeclarations : Array DeclarationInfo
  namespaceInfos : Std.HashMap Name NamespaceInfo

def isTheorem (c : ConstantInfo) : MetaM Bool := do
  if getOriginalConstKind? (← getEnv) c.name == some .thm then
    return true

  try
    let t ← inferType c.type
    return t.isProp
  catch
    | _ => return false

def extractDefinitions (allNamespaces : Array Name) : MetaM DefinitionsResult := do
  let allNamespacesSet : NameSet := allNamespaces.foldl (init := NameSet.empty) NameSet.insert
  let mut allDeclarations := #[]
  let mut namespaceInfos :=
    allNamespaces.foldl (init := ∅) (fun m n => m.insert n { key := n.toString, name := n, definitions := #[] })

  let env ← getEnv

  for declInfo in ← getExplicitDeclarationInfos allNamespaces do
    allDeclarations := allDeclarations.push declInfo
    namespaceInfos := namespaceInfos.modify declInfo.fromNamespace (·.addDeclaration declInfo)

  for (nameWithPrefix, info) in env.constants do
    for declInfo in ← getDeclarationInfosForName nameWithPrefix info allNamespaces allNamespacesSet do
      if !(← isTheorem info) then do
        allDeclarations := allDeclarations.push declInfo
        namespaceInfos := namespaceInfos.modify declInfo.fromNamespace (·.addDeclaration declInfo)

  return { allDeclarations, namespaceInfos }

/-- Information about which theorems are available for a pair of operations. -/
structure TheoremInfo where
  /-- Array of theorem signatures. -/
  names : Array String
  hasComment : Bool
deriving ToJson

def TheoremInfo.add (n : String) : TheoremInfo → TheoremInfo
  | ⟨names, hasComment⟩ => ⟨names.push n, hasComment⟩

def TheoremInfo.empty : TheoremInfo where
  names := #[]
  hasComment := false

/-!
# Step 2: Collect theorems that involve the declarations and live in a matching namespace
-/

structure FullResult where
  namespaces : Array Name
  namespaceInfos : Std.HashMap Name NamespaceInfo
  /-- key of declaration 1 -> key of declaration 2 -> theorems -/
  theoremInfos : Std.HashMap String (Std.HashMap String TheoremInfo)

def isInRelevantNamespace (allNamespaces : Array Name) (name : Name) : Bool :=
  allNamespaces.any (·.isPrefixOf name)

def pairwiseM {α : Type u} {m : Type → Type} [Monad m] (a : Array α) (f : α → α → m Unit) : m Unit := do
  if h : a.size = 1 then do
    f a[0] a[0]
    return

  for hi : i in [0:a.size] do
    for hj : j in [0:a.size] do
      unless i = j do f a[i] a[j]

def insertTheoremString (l r thmString : String) (m : Std.HashMap String (Std.HashMap String TheoremInfo)) :
    Std.HashMap String (Std.HashMap String TheoremInfo) :=
  m.alter l (·.getD ∅ |>.alter r (·.getD .empty |>.add thmString))

-- This is needed for lemmas like `Int8.ofInt_eq_ofNat` whose type is
-- `forall {n : Nat}, Eq.{1} Int8 (Int8.ofInt (Nat.cast.{0} ([mdata borrowed:1 Int]) instNatCastInt n)) (Int8.ofNat n)`
partial def stripMData : Expr → Expr :=
  Expr.replace (fun | .mdata _ e => some (stripMData e) | _ => none)

def findMatchingDeclarations (e : Expr) (allDeclarations : Array DeclarationInfo) : Array String := Id.run do
  let mut result := #[]

  let usedConstantSet := e.getUsedConstantsAsSet
  let strippedType := stripMData e

  for declInfo in allDeclarations do
    let isMatch :=
      match declInfo.searchKey with
      | .byName n => usedConstantSet.contains n
      | .byExpr needle => needle.occurs strippedType
    if isMatch then
      result := result.push declInfo.key

  return result

def extractTheorems (allNamespaces : Array Name) (definitions : DefinitionsResult) : MetaM FullResult := do
  let ⟨allDeclarations, namespaceInfos⟩ := definitions
  let mut theoremInfos : Std.HashMap String (Std.HashMap String TheoremInfo) := ∅

  let env ← getEnv

  for (nameWithPrefix, info) in env.constants do
    unless isInRelevantNamespace allNamespaces nameWithPrefix && (← isTheorem info) && !(← Name.isAutoDecl nameWithPrefix) && !Lean.Linter.isDeprecated env nameWithPrefix do continue
    let declarations := findMatchingDeclarations info.type allDeclarations
    let thmString := (← Lean.PrettyPrinter.ppSignature nameWithPrefix).fmt.pretty
    theoremInfos := (← StateT.run
      (pairwiseM declarations fun l r =>
        modify (insertTheoremString l r thmString)) theoremInfos).2

  return { namespaces := allNamespaces, namespaceInfos, theoremInfos }

instance {α : Type u} [ToJson α] : ToJson (Std.HashMap String α) where
  toJson m := .obj <| toRBNodeMapping toJson m
where
  @[inline] toRBNodeMapping {α : Type} {β : Type u} {γ : Type} (f : β → γ) [BEq α] [Hashable α] [Ord α] :
      Std.HashMap α β → Lean.RBNode α (fun _ => γ) :=
    fun m => m.fold (init := .leaf) fun n k v => n.insert compare k (f v)

structure DeclarationInfoExt where
  key : String
  displayName : String
  longDisplayName : String
  returnNamespaceKey : String
deriving ToJson

def DeclarationInfo.toExt (info : DeclarationInfo) : DeclarationInfoExt where
  key := info.key
  displayName := info.displayName
  longDisplayName := info.longDisplayName
  returnNamespaceKey := (info.returnNamespace.map (·.toString)).getD "unknown"

structure NamespaceInfoExt where
  key : String -- this is going to be the (full) name of the namespace. Currently identical to `name`.
  name : String
  definitions : Array DeclarationInfoExt
deriving ToJson

def NamespaceInfo.toExt (info : NamespaceInfo) : NamespaceInfoExt where
  key := info.key
  name := info.name.toString
  definitions := info.definitions.map (·.toExt) |>.qsort (·.displayName < ·.displayName)

structure FullResultExt where
  namespaces : Array Name
  namespaceInfos : Std.HashMap String NamespaceInfoExt
  /-- key of declaration 1 -> key of declaration 2 -> theorems -/
  theoremInfos : Std.HashMap String (Std.HashMap String TheoremInfo)
deriving ToJson

def FullResult.toExt (res : FullResult) : FullResultExt where
  namespaces := res.namespaces
  namespaceInfos := res.namespaceInfos.fold (init := ∅) (fun m k v => m.insert k.toString v.toExt)
  theoremInfos := res.theoremInfos

def calculateExternalResult (types : Array Name) : MetaM FullResultExt := do
  return (← extractTheorems types (← extractDefinitions types)).toExt

end Grove.Prototype
