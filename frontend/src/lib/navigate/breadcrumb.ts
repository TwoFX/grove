import { createContext } from "react";

export interface BreadcrumbData {
  id: string;
  title: string;
}

export interface BreadcrumbState {
  breadcrumb: BreadcrumbData;
  setBreadcrumb: (id: BreadcrumbData) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbState>({
  breadcrumb: {
    id: "",
    title: "",
  },
  setBreadcrumb: () => {},
});
