import { FactMetadata, FactValidationResult } from "../transfer/project";

export interface FactSummary {
  widgetId: string;
  widgetTitle: string;
  factId: string;
  href: string;
  summary: string;
  metadata: FactMetadata;
  validationResult: FactValidationResult;
}
