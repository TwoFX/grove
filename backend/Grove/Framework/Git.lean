/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module
namespace Grove.Framework

def getGitHashViaCommand : IO String.Slice :=
  String.trimAscii <$> IO.Process.run {
    cmd := "git"
    args := #["rev-parse", "HEAD"]
  }

def getGitHashFromEnvironmentVariable : IO (Option String.Slice) :=
  Option.map String.toSlice <$> IO.getEnv "GROVE_GIT_HASH"

public def getGitHash : IO String.Slice := do
  match ← getGitHashFromEnvironmentVariable with
  | none => getGitHashViaCommand
  | some hash => return hash

end Grove.Framework
