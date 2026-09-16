/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public def Std.Format.prettyOneline (f : Std.Format) : String :=
  f.pretty 1_000_000_000
