/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module

public import Std.Time.DateTime.Timestamp

namespace Grove.Framework

public def log (indent type id : String) : IO Unit :=
  IO.println s!"{indent}{type} {id}"

/-- Runs `action` and prints a line describing it together with the time it took. -/
public def timedLog [Monad m] [MonadLiftT BaseIO m] [MonadLiftT IO m] (indent type : String) (id : Option String)
    (action : m α) : m α := do
  IO.print s!"{indent}{type}{id.elim "" (" " ++ ·)}"
  (← IO.getStdout).flush
  let start ← Std.Time.Timestamp.now
  let res ← action
  let duration := (← Std.Time.Timestamp.now) - start
  IO.println s!" ({duration.toMilliseconds.val.toFloat / 1000} seconds)"
  return res

end Grove.Framework
