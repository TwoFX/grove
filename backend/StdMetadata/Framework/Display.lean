/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/

namespace StdMetadata.Framework

class DisplayShort (α : Type) where
  displayShort : α → String

instance : DisplayShort Lean.Name where
  displayShort n := n.toString

class DisplayLong (α : Type) where
  displayLong : α → String

end StdMetadata.Framework
