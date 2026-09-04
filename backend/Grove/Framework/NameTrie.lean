/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module
import Std.Data.TreeMap.Raw
import Lean.Data.Name

open Lean

namespace Grove.Framework

public structure NameTrie (α : Type u) where
  private bot : Option α
  private str : Std.TreeMap.Raw String (NameTrie α)
  private num : Std.TreeMap.Raw Nat (NameTrie α)

namespace NameTrie

public def empty : NameTrie α where
  bot := none
  str := ∅
  num := ∅

public def insert (t : NameTrie α) (n : Name) (a : α) : NameTrie α :=
  go t n.components a
where
  go (t : NameTrie α) : List Name → α → NameTrie α
    | [], a => { t with bot := some a }
    | (.str _ s)::xs, a =>
      let ⟨bot, str, num⟩ := t
      ⟨bot, str.alter s (fun inner => some (go (inner.getD NameTrie.empty) xs a)), num⟩
    | (.num _ n)::xs, a =>
      let ⟨bot, str, num⟩ := t
      ⟨bot, str, num.alter n (fun inner => some (go (inner.getD NameTrie.empty) xs a))⟩
    | (.anonymous)::_, _ => t

/--
Merges two tries. If both tries contain a value for the same name, the value from `t₂` is used.
The cost is proportional to the number of nodes that occur in both tries.
-/
public partial def merge (t₁ t₂ : NameTrie α) : NameTrie α :=
  ⟨t₂.bot <|> t₁.bot,
   t₂.str.foldl (init := t₁.str) (fun m k v => m.alter k (fun | none => some v | some v' => some (merge v' v))),
   t₂.num.foldl (init := t₁.num) (fun m k v => m.alter k (fun | none => some v | some v' => some (merge v' v)))⟩

public def navigate? (t : NameTrie α) (n : Name) : Option (NameTrie α) :=
  go t n.components
where
  go (t : NameTrie α) : List Name → Option (NameTrie α)
    | [] => t
    | (.str _ s)::xs => t.str[s]?.bind (go · xs)
    | (.num _ n)::xs => t.num[n]?.bind (go · xs)
    | (.anonymous)::_ => none

public partial def fold (t : NameTrie α) (f : β → Name → α → β) (init : β) : β :=
  go t f init .anonymous
where
  go (t : NameTrie α) (f : β → Name → α → β) (cur : β) (curName : Name) : β :=
    let cur := t.bot.map (f cur curName ·) |>.getD cur
    let cur := t.num.foldl (init := cur) (fun sofar n t => go t f sofar (.num curName n))
    t.str.foldl (init := cur) (fun sofar s t => go t f sofar (.str curName s))

public def inNamespace (t : NameTrie α) (n : Name) : Array Name :=
  (t.navigate? n).map (·.fold (init := #[]) (fun sofar n' _ => sofar.push (n ++ n'))) |>.getD #[]

end NameTrie

end Grove.Framework
