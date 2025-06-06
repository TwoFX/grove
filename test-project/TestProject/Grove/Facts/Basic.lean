import TestProject.Grove.Facts.Basic.«show-option-mapa»

open Grove.Framework Widget

namespace TestProject.Grove.Facts

def addFacts : FactStateM Unit := do
  «stdlib».«containers».addFacts
