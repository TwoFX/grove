import Grove.Framework
import TestProject.Grove.Generated.«no-option-to-vector»
import TestProject.Grove.Generated.«show-option-mapa»
import TestProject.Grove.Generated.«list-array-operations»
import TestProject.Grove.Generated.«list-array-lemmas»
import TestProject.Grove.Generated.«associative-query-operations»
import TestProject.Grove.Generated.«associative-creation-operations»
import TestProject.Grove.Generated.«associative-modification-operations»
import TestProject.Grove.Generated.«associative-create-then-query»
import TestProject.Grove.Generated.«finite-integer-arithmetic»
import TestProject.Grove.Generated.«finite-integer-conversions»
import TestProject.Grove.Generated.«finite-integer-convert-then-convert»

/-
This file is autogenerated by grove. You can manually edit it, for example to resolve merge
conflicts, but be careful.
-/

open Grove.Framework Widget

namespace TestProject.Grove.Generated

def restoreState : RestoreStateM Unit := do
  «no-option-to-vector».restoreState
  «show-option-mapa».restoreState
  «list-array-operations».restoreState
  «list-array-lemmas».restoreState
  «associative-query-operations».restoreState
  «associative-creation-operations».restoreState
  «associative-modification-operations».restoreState
  «associative-create-then-query».restoreState
  «finite-integer-arithmetic».restoreState
  «finite-integer-conversions».restoreState
  «finite-integer-convert-then-convert».restoreState
