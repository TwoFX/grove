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
      match t.str[s]? with
      | none => { t with str := t.str.insert s (go NameTrie.empty xs a) }
      | some inner =>
        let str := t.str.erase s
        { t with str := str.insert s (go inner xs a) }
    | (.num _ n)::xs, a =>
      match t.num[n]? with
      | none => { t with num := t.num.insert n (go NameTrie.empty xs a) }
      | some inner =>
        let num := t.num.erase n
        { t with num := num.insert n (go inner xs a) }
    | (.anonymous)::_, _ => t

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
