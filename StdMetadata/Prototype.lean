/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import StdMetadata.Prototype.DeclarationInfo
import Lean

set_option autoImplicit false

universe u v w x

open Lean Meta

namespace StdMetadata.Prototype

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
  allDeclarations : NameSet
  namespaceInfos : Std.HashMap Name NamespaceInfo

def isTheorem (c : ConstantInfo) : MetaM Bool := do
  if c.isTheorem then
    return true

  try
    let t ← inferType c.type
    return t.isProp
  catch
    | _ => return false

def extractDefinitions (allNamespaces : Array Name) : MetaM DefinitionsResult := do
  let allNamespacesSet : NameSet := allNamespaces.foldl (init := NameSet.empty) NameSet.insert
  let mut allDeclarations := NameSet.empty
  let mut namespaceInfos :=
    allNamespaces.foldl (init := ∅) (fun m n => m.insert n { key := n.toString, name := n, definitions := #[] })

  let env ← getEnv

  for (nameWithPrefix, info) in env.constants do
    for namesp in allNamespaces do
      if let some declInfo ← getDeclarationInfo? namesp nameWithPrefix info allNamespacesSet then do
        if !(← isTheorem info) then do
          allDeclarations := allDeclarations.insert nameWithPrefix
          namespaceInfos := namespaceInfos.modify namesp (·.addDeclaration declInfo)

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

def extractTheorems (allNamespaces : Array Name) (definitions : DefinitionsResult) : MetaM FullResult := do
  let ⟨allDeclarations, namespaceInfos⟩ := definitions
  let mut theoremInfos : Std.HashMap String (Std.HashMap String TheoremInfo) := ∅

  let env ← getEnv

  for (nameWithPrefix, info) in env.constants do
    unless isInRelevantNamespace allNamespaces nameWithPrefix && (← isTheorem info) do continue
    let declarations := info.type.getUsedConstants.filter allDeclarations.contains
    let thmString := (← Lean.PrettyPrinter.ppSignature nameWithPrefix).fmt.pretty
    theoremInfos := (← StateT.run
      (pairwiseM declarations fun l r =>
        modify (insertTheoremString l.toString r.toString thmString)) theoremInfos).2

  return { namespaceInfos, theoremInfos }

instance {α : Type u} [ToJson α] : ToJson (Std.HashMap String α) where
  toJson m := .obj <| toRBNodeMapping toJson m
where
  @[inline] toRBNodeMapping {α : Type} {β : Type u} {γ : Type} (f : β → γ) [BEq α] [Hashable α] [Ord α] :
      Std.HashMap α β → Lean.RBNode α (fun _ => γ) :=
    fun m => m.fold (init := .leaf) fun n k v => n.insert compare k (f v)

def DeclarationInfo.toString (info : DeclarationInfo) : String :=
  info.displayName.toString

structure DeclarationInfoExt where
  key : String
  displayName : String
  returnNamespaceKey : String
deriving ToJson

def DeclarationInfo.toExt (info : DeclarationInfo) (namesp : Name) : DeclarationInfoExt where
  key := info.key
  displayName := info.displayName.toString
  returnNamespaceKey := (info.returnNamespace.getD namesp).toString

structure NamespaceInfoExt where
  key : String -- this is going to be the (full) name of the namespace. Currently identical to `name`.
  name : String
  definitions : Array DeclarationInfoExt
deriving ToJson

def NamespaceInfo.toExt (info : NamespaceInfo) : NamespaceInfoExt where
  key := info.key
  name := info.name.toString
  definitions := info.definitions.map (·.toExt info.name)

structure FullResultExt where
  namespaceInfos : Std.HashMap String NamespaceInfoExt
  /-- key of declaration 1 -> key of declaration 2 -> theorems -/
  theoremInfos : Std.HashMap String (Std.HashMap String TheoremInfo)
deriving ToJson

def FullResult.toExt (res : FullResult) : FullResultExt where
  namespaceInfos := res.namespaceInfos.fold (init := ∅) (fun m k v => m.insert k.toString v.toExt)
  theoremInfos := res.theoremInfos

def calculateExternalResult (types : Array Name) : MetaM FullResultExt := do
  return (← extractTheorems types (← extractDefinitions types)).toExt

end StdMetadata.Prototype
