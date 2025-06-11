/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/

namespace Grove.Framework

def getGitHashViaCommand : IO String :=
  String.trim <$> IO.Process.run {
    cmd := "git"
    args := #["rev-parse", "HEAD"]
  }

def getGitHashFromEnvironmentVariable : IO (Option String) :=
  IO.getEnv "GROVE_GIT_HASH"

def getGitHash : IO String := do
  match ← getGitHashFromEnvironmentVariable with
  | none => getGitHashViaCommand
  | some hash => return hash

end Grove.Framework
