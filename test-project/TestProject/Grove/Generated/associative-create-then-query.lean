import Grove.Framework

/-
This file is autogenerated by grove. You can manually edit it, for example to resolve merge
conflicts, but be careful.
-/

open Grove.Framework Widget

namespace TestProject.Grove.Generated.«associative-create-then-query»

def table : Table.Data .subexpression .subexpression .declaration where
  widgetId := "associative-create-then-query"
  selectedRowAssociations := #[]
  selectedColumnAssociations := #[]
  selectedLayers := #[]
  selectedCellOptions := #[
  ]
  facts := #[
  ]

def restoreState : RestoreStateM Unit := do
  addTable table