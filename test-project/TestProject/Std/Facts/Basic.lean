import TestProject.Std.Facts.Basic.«show-option-mapa»

open StdMetadata.Framework Widget

namespace TestProject.Std.Facts

def addFacts : FactStateM Unit := do
  «stdlib».«containers».addFacts
