/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
module

public import Lean.Meta.Basic
import Grove.Framework.Declaration.Name
import Lean.Meta.Instances
public import Grove.Framework.NameTrie
import Grove.Framework.Log

open Lean

namespace Grove.Framework

public structure LookupM.State where
  private isAutoDeclCache : Std.HashMap Lean.Name Bool := ∅
  private isDeprecatedCache : Std.HashMap Lean.Name Bool := ∅
  private isTheoremCache : Std.HashMap Lean.Name Bool := ∅
  private isInstanceCache : Std.HashMap Lean.Name Bool := ∅
  private declarationsTrie : NameTrie Unit

namespace LookupM.State

def isAutoDecl (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isAutoDeclCache[n]? with
  | none => do
    let ans ← Name.computeIsAutoDecl n
    return ({ s with isAutoDeclCache := s.isAutoDeclCache.insert n ans }, ans)
  | some ans => pure (s, ans)

def isDeprecated (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isDeprecatedCache[n]? with
  | none => do
    let ans ← Name.computeIsDeprecated n
    return ({ s with isDeprecatedCache := s.isDeprecatedCache.insert n ans }, ans)
  | some ans => pure (s, ans)

def isTheorem (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isTheoremCache[n]? with
  | none => do
    let ans ← Name.computeIsTheorem n
    return ({ s with isTheoremCache := s.isTheoremCache.insert n ans }, ans)
  | some ans => pure (s, ans)

def isInstance (s : LookupM.State) (n : Name) : MetaM (LookupM.State × Bool) :=
  match s.isInstanceCache[n]? with
  | none => do
    let ans ← Meta.isInstance n
    return ({ s with isInstanceCache := s.isInstanceCache.insert n ans }, ans)
  | some ans => pure (s, ans)

end LookupM.State

/--
Monad on top of `MetaM` that caches some commonly needed information, for example whether a `Name`
refers to a theorem.
-/
public abbrev LookupM := StateRefT LookupM.State MetaM

def LookupM.modifyGetM {α β : Type} (f : LookupM.State → α → MetaM (LookupM.State × β)) (a : α) : LookupM β := do
  let oldState ← get
  set ({ declarationsTrie := .empty } : LookupM.State)
  let (newState, result) ← f oldState a
  set newState
  return result

public def isAutoDecl (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isAutoDecl n

public def isDeprecated (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isDeprecated n

public def isTheorem (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isTheorem n

public def isInstance (n : Name) : LookupM Bool :=
  LookupM.modifyGetM LookupM.State.isInstance n

public def allDeclarations : LookupM (NameTrie Unit) := do
  return (← get).declarationsTrie

public def inNamespace (n : Name) : LookupM (Array Name) := do
  return (← get).declarationsTrie.inNamespace n

/-- Hash of the first two components of `n`. -/
private def prefixKey (n : Name) : Nat :=
  (dropLast n (n.getNumParts - 2)).hash.toNat
where
  dropLast : Name → Nat → Name
    | n, 0 => n
    | n, k + 1 => dropLast n.getPrefix k

/--
Builds a trie containing all constants in the environment. Since there are a lot of constants,
the work is distributed over multiple threads: the constants are partitioned by the first two
components of their names, a trie is built for every partition, and the resulting tries (which
only overlap in their top two levels) are merged.
-/
private def constructTrie : MetaM (NameTrie Unit) := do
  let numBuckets := 64
  let buckets := (← getEnv).constants.fold (init := Array.replicate numBuckets #[]) fun buckets n _ =>
    buckets.modify (prefixKey n % numBuckets) (·.push n)
  let tasks := buckets.map fun bucket => Task.spawn fun _ =>
    bucket.foldl (init := NameTrie.empty) fun t n => t.insert n ()
  return tasks.foldl (init := NameTrie.empty) fun t task => t.merge task.get

public def LookupM.run (f : LookupM α) : MetaM α := do
  let trie ← timedLog "" "Indexing declarations" none constructTrie
  StateRefT'.run' f { declarationsTrie := trie }

/--
Runs `f` on all elements of `xs`, distributing the work over multiple threads. Every thread starts
out with an empty cache, and the caches built up by the threads are discarded afterwards, so this
is only worthwhile if `f` is expensive (for example because it pretty-prints something) and does
not benefit much from the caches anyway.
-/
public def LookupM.parallelMap {α β : Type} (xs : Array α) (f : α → LookupM β)
    (chunkSize : Nat := 128) : LookupM (Array β) := do
  if xs.size ≤ chunkSize then
    return ← xs.mapM f
  -- Everything that is shared with the worker threads is marked persistent, i.e. reference
  -- counting is disabled for it. Otherwise, reference counting on these hot objects would be
  -- atomic and heavily contended, which makes the tasks much slower than necessary. All of these
  -- objects are needed until the end of the process anyway. Safety: no other threads are running
  -- at this point.
  let ctx ← unsafe Runtime.markPersistent (← readThe Core.Context)
  let env ← unsafe Runtime.markPersistent (← getEnv)
  let trie := (← get).declarationsTrie
  let trie ← unsafe Runtime.markPersistent trie
  let runChunk (chunk : Array α) : IO (Array β) := do
    let action : MetaM (Array β) := StateRefT'.run' (chunk.mapM f) { declarationsTrie := trie }
    let (result, _, _) ← action.toIO ctx { env }
    return result
  let mut tasks := #[]
  let mut start := 0
  while start < xs.size do
    tasks := tasks.push (← IO.asTask (runChunk (xs.extract start (start + chunkSize))))
    start := start + chunkSize
  let mut result := Array.mkEmpty xs.size
  for task in tasks do
    match ← IO.wait task with
    | .ok chunkResult => result := result ++ chunkResult
    | .error e => throwError (toString e)
  return result

end Grove.Framework
