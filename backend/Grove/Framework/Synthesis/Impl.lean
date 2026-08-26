/-
Copyright (c) 2026 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Julia M. Himmel
-/
module
public import Lean.Meta.Basic
public import Grove.Framework.LookupM
import Lean.Meta.SynthInstance
import Lean.Meta.AppBuilder
import Lean.PrettyPrinter

open Lean Meta

namespace Grove.Framework

public structure Synthesis.Result where
  displayShort : String
  displayLong: String
  usedInstances : Array String
deriving BEq, Repr

def lastComponent : Name → String
  | .str _ s => s
  | n => n.toString

/--
`mkAppM` does not instantiate trailing implicit arguments, so applying a class like `LawfulBEq`
(which takes a `[BEq α]` argument after its explicit type argument) to a type yields a partial
application. This function completes such an application by synthesizing the remaining
instance-implicit arguments, returning `none` if what remains is not a fully applied class
statement.
-/
partial def completeClassApp? (e : Expr) : MetaM (Option Expr) := do
  match ← whnf (← inferType e) with
  | .forallE _ domain _ .instImplicit => completeClassApp? (mkApp e (← synthInstance domain))
  | t => if t.isSort then return some e else return none

/--
If `param` is a type or a type family (i.e., its type has the form `∀ xs, Sort _`), returns the
statement that `param` satisfies the class `c` pointwise, i.e., `∀ xs, c (param xs)`. Returns `none`
if `param` is not a type family or `c` cannot be applied to it (for example because `param` lives in
`Prop` or `c` takes additional arguments that cannot be synthesized).
-/
def assumptionType? (param : Expr) (c : Name) : MetaM (Option Expr) := do
  forallTelescopeReducing (← inferType param) fun xs body => do
    unless body.isSort do return none
    try
      let some clsApp ← completeClassApp? (← mkAppM c #[mkAppN param xs]) | return none
      return some (← mkForallFVars xs clsApp)
    catch _ =>
      return none

/--
Introduces an instance assumption `∀ xs, c (param xs)` for every class `c` in `classes` that applies
to `param`, then continues with `k`, passing in the assumption free variables. The assumptions are
introduced one after the other, so later assumptions can make use of earlier ones (this matters for
classes like `LawfulBEq` whose statement itself requires an instance).
-/
def withAssumptionsForParam {α : Type} (param : Expr) (paramName : Name) (classes : List Name)
    (k : Array Expr → MetaM α) (acc : Array Expr := #[]) : MetaM α := do
  match classes with
  | [] => k acc
  | c :: rest =>
    match ← assumptionType? param c with
    | none => withAssumptionsForParam param paramName rest k acc
    | some t =>
      let n := Name.mkSimple s!"inst{lastComponent c}{paramName.eraseMacroScopes}"
      withLocalDecl n .instImplicit t fun fvar =>
        withAssumptionsForParam param paramName rest k (acc.push fvar)

/--
Walks over the parameters of a type former with type `type`, building up the array of arguments the
type former should be applied to. Every parameter that is a type or type family additionally gives
rise to instance assumptions for each of the classes in `parameterInstances`. Instance-implicit
parameters (like the `[BEq α]` in the type of `Std.HashMap`) are not introduced as new free
variables but synthesized from the assumptions introduced so far, so that the final instance search
reports the assumptions as used. Calls `k` with the type former arguments and all assumptions.
-/
partial def withParams {α : Type} [Inhabited α] (type : Expr) (parameterInstances : Array Name)
    (k : (args : Array Expr) → (assumptions : Array Expr) → MetaM α)
    (args : Array Expr := #[]) (assumptions : Array Expr := #[]) : MetaM α := do
  match ← whnf type with
  | .forallE binderName domain body bi =>
    if bi == .instImplicit then
      let inst? ← try trySynthInstance domain catch _ => pure .undef
      match inst? with
      | .some inst =>
        withParams (body.instantiate1 inst) parameterInstances k (args.push inst) assumptions
      | _ =>
        withLocalDecl binderName bi domain fun fvar =>
          withParams (body.instantiate1 fvar) parameterInstances k (args.push fvar) assumptions
    else
      withLocalDecl binderName bi domain fun fvar =>
        withAssumptionsForParam fvar binderName parameterInstances.toList fun newAssumptions =>
          withParams (body.instantiate1 fvar) parameterInstances k (args.push fvar)
            (assumptions ++ newAssumptions)
  | _ => k args assumptions

def synthesizeCore (typeName className : Name) (parameterInstances : Array Name) :
    MetaM (Option Synthesis.Result) := do
  let some info := (← getEnv).find? typeName | return none
  let us := info.levelParams.map mkLevelParam
  try
    withParams (info.instantiateTypeLevelParams us) parameterInstances fun args assumptions => do
      let some goal ← completeClassApp? (← mkAppM className #[mkAppN (mkConst typeName us) args])
        | return none
      match ← trySynthInstance goal with
      | .some inst =>
        let inst ← instantiateMVars inst
        let displayShort ← match inst.getAppFn with
          | .const n _ => pure n.toString
          | _ => do pure (← PrettyPrinter.ppExpr inst).pretty
        let displayLong ← withOptions (fun opts => opts.setBool `pp.explicit true) do
          pure ((← PrettyPrinter.ppExpr inst).pretty (width := 100))
        let usedInstances ← assumptions.filterMapM fun assumption => do
          if inst.containsFVar assumption.fvarId! then
            return some (← PrettyPrinter.ppExpr (← inferType assumption)).pretty
          else
            return none
        return some { displayShort, displayLong, usedInstances }
      | _ => return none
  catch _ =>
    return none

public def trySynthesize (typeName className : Lean.Name) (parameterInstances : Array Lean.Name) :
    LookupM (Option Synthesis.Result) :=
  synthesizeCore typeName className parameterInstances

end Grove.Framework
