import TestProject.Grove.Facts.Generated.«show-option-mapa»

open Grove.Framework Widget

namespace TestProject.Grove.Facts

def addFacts : FactStateM Unit := do
  Generated.«show-option-mapa».addFacts
