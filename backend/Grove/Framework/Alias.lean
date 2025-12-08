/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Grove.Framework.Display
public import Grove.Framework.HasId

namespace Grove.Framework

structure Alias (α : Type u) where
  inner : α
  id : String
  displayShort : String

instance : HasId (Alias α) where
  getId a := a.id

instance : DisplayShort (Alias α) where
  displayShort a := a.displayShort

instance [HasId α] [DisplayShort α] : Coe α (Alias α) where
  coe i := Alias.mk i (HasId.getId i) (DisplayShort.displayShort i)

end Grove.Framework
