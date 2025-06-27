/-
Copyright (c) 2025 Lean FRO, LLC. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Authors: Markus Himmel
-/
import Grove.JTD.Basic

namespace Grove.Framework

open JTD

/-- Reference some other object that we can show a widget for. So, for example, in an association
table, a cell might contain a reference to a declaration, so if the user selects a cell, then we
might show additional information about the declaration in a side bar and the user can assert
facts about the declaration there. -/
inductive Reference where
  | none : Reference
  | declaration : String → Reference

instance : SchemaFor Reference :=
  .inductive "reference"
    [.nullary "none" (fun | .none => true | _ => false),
     .unary "declaration" String (fun | .declaration n => some n | _ => none)]

end Grove.Framework
