/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Cli

namespace Cli.Parsed

@[inline]
def flagAs? (p : Parsed) (longName : String) (τ : Type u) [Inhabited τ] [Cli.ParseableType τ] : Option τ :=
  p.flag? longName |>.bind (·.as? τ)

end Cli.Parsed
