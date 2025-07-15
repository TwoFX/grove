import { GroveContextData } from "@/lib/transfer/contextdata";
import { FactStatus, FactValidationResult } from "@/lib/transfer/project";
import { isNewlyInvalidatedFact } from "@/lib/fact/invalidated";
import { InvalidatedFactSet } from "./invalidated/context";

export function getStatusColors(status: FactStatus): string {
  switch (status) {
    case FactStatus.Done:
      return "bg-green-100 text-green-800 border-green-200";
    case FactStatus.Bad:
      return "bg-red-100 text-red-800 border-red-200";
    case FactStatus.BelievedGood:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case FactStatus.NothingToDo:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case FactStatus.Postponed:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

export function getStatusBackgroundColor(status: FactStatus): string {
  switch (status) {
    case FactStatus.Done:
      return "bg-green-100";
    case FactStatus.Bad:
      return "bg-red-100";
    case FactStatus.BelievedGood:
      return "bg-blue-100";
    case FactStatus.NothingToDo:
      return "bg-gray-100";
    case FactStatus.Postponed:
      return "bg-yellow-100";
  }
}

export function factColor(
  context: InvalidatedFactSet,
  widgetId: string,
  factId: string,
  validationResult: FactValidationResult,
  status: FactStatus,
): string {
  if (isNewlyInvalidatedFact(context, widgetId, factId)) {
    return "bg-red-100 text-red-800 border-red-200";
  } else if (validationResult.constructor === "invalidated") {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  return getStatusColors(status);
}

export function factBackgroundColor(
  context: InvalidatedFactSet,
  widgetId: string,
  factId: string,
  validationResult: FactValidationResult,
  status: FactStatus,
): string {
  if (isNewlyInvalidatedFact(context, widgetId, factId)) {
    return "bg-red-100";
  } else if (validationResult.constructor === "invalidated") {
    return "bg-orange-100";
  }

  return getStatusBackgroundColor(status);
}
