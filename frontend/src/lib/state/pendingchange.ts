import { GroveState } from "./state";

export interface PendingChange {
  displayShort: string;
  href: string;
  id: string;
  remove: (state: GroveState) => void;
}
