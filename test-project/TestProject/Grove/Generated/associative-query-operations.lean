import Grove.Framework

/-
This file is autogenerated by grove. You can manually edit it, for example to resolve merge
conflicts, but be careful.
-/

open Grove.Framework Widget

namespace TestProject.Grove.Generated.«associative-query-operations»


def table : AssociationTable.Data .subexpression where
  widgetId := "associative-query-operations"
  rows := #[
  ]
  facts := #[
  ]

def restoreState : RestoreStateM Unit := do
  addAssociationTable table