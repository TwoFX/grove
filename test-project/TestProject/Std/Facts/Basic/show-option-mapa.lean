import Grove.Framework

open Grove.Framework Widget

namespace TestProject.Std.Facts.«stdlib».«containers»

def «0» : ShowDeclaration.Fact where
  widgetId := "show-option-mapa"
  factId := "0"
  metadata := {
    status := .done
    comment := "Nice"
  }
  state := .def {
    name := `Option.mapA
    renderedStatement := "hello :)"
    isDeprecated := false
  }

def addFacts : FactStateM Unit := do
  addShowDeclarationFact «0»
