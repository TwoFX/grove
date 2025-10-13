/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/

/-!
This is just a tiny test "library" for testing out Grove.
-/

open List

namespace TestProject

namespace List

def cartesian (l₁ : List α) (l₂ : List β) : List (α × β) :=
  l₁.flatMap (fun a => l₂.map ((a, ·)))

@[grind =]
theorem cartesian_cons_left (x : α) (l₁ : List α) (l₂ : List β) :
  cartesian (x :: l₁) l₂ = l₂.map ((x, ·)) ++ cartesian l₁ l₂ := rfl

@[simp, grind =] theorem cartesian_nil_left (l₂ : List β) : cartesian ([] : List α) l₂ = [] := rfl
@[simp] theorem cartesian_nil_right (l₁ : List α) : cartesian l₁ ([] : List β) = [] := by
  induction l₁ <;> grind

end List

end TestProject
