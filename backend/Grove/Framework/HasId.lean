/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

import Init.Data.ToString.Name

namespace Grove.Framework

public class HasId (α : Type) where
  getId : α → String

public instance : HasId Lean.Name where
  getId n := n.toString

end Grove.Framework
