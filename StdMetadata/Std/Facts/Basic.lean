import StdMetadata.Std.Facts.Basic.«show-option-mapa»

open StdMetadata.Framework Widget

namespace StdMetadata.Facts

def addFacts : FactStateM Unit := do
  «stdlib».«containers».addFacts
