/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Init.Data.ToString.Name

namespace Grove.Framework

public class DisplayShort (α : Type) where
  displayShort : α → String

public instance : DisplayShort Lean.Name where
  displayShort n := n.toString

public class DisplayLong (α : Type) where
  displayLong : α → String

end Grove.Framework
