import { FactStatus, FactValidationResult } from "@/lib/transfer/project";
import { isNewlyInvalidatedFact } from "@/lib/fact/invalidated";
import { InvalidatedFactSet } from "./invalidated/context";

export function getStatusColors(status: FactStatus): string {
  switch (status) {
    case FactStatus.Done:
      return "bg-status-success-bg text-status-success-text border-status-success-border";
    case FactStatus.Bad:
      return "bg-status-error-bg text-status-error-text border-status-error-border";
    case FactStatus.BelievedGood:
      return "bg-status-info-bg text-status-info-text border-status-info-border";
    case FactStatus.NothingToDo:
      return "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border";
    case FactStatus.Postponed:
      return "bg-status-warning-bg text-status-warning-text border-status-warning-border";
    case FactStatus.NeedsAttention:
      return "bg-status-orange-bg text-status-orange-text border-status-orange-border";
  }
}

export function getStatusBackgroundColor(status: FactStatus): string {
  switch (status) {
    case FactStatus.Done:
      return "bg-status-success-bg";
    case FactStatus.Bad:
      return "bg-status-error-bg";
    case FactStatus.BelievedGood:
      return "bg-status-info-bg";
    case FactStatus.NothingToDo:
      return "bg-status-neutral-bg";
    case FactStatus.Postponed:
      return "bg-status-warning-bg";
    case FactStatus.NeedsAttention:
      return "bg-status-orange-bg";
  }
}

export function factColor(
  context: InvalidatedFactSet,
  widgetId: string,
  factId: string,
  validationResult: FactValidationResult,
  status: FactStatus,
): string {
  if (isNewlyInvalidatedFact(context, widgetId, factId, validationResult)) {
    return "bg-status-error-bg text-status-error-text border-status-error-border";
  } else if (validationResult.constructor === "invalidated") {
    return "bg-status-orange-bg text-status-orange-text border-status-orange-border";
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
  if (isNewlyInvalidatedFact(context, widgetId, factId, validationResult)) {
    return "bg-status-error-bg";
  } else if (validationResult.constructor === "invalidated") {
    return "bg-status-orange-bg";
  }

  return getStatusBackgroundColor(status);
}
