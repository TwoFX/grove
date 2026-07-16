export type WidgetRouteKind = "assertion" | "association" | "table";

export function homeUrl(): string {
  return "/";
}

export function sectionUrl(sectionId: string): string {
  return `/section/${encodeURIComponent(sectionId)}`;
}

export function factsUrl(sectionId: string): string {
  return `/facts/${encodeURIComponent(sectionId)}`;
}

export function widgetUrl(kind: WidgetRouteKind, widgetId: string): string {
  return `/${kind}/${encodeURIComponent(widgetId)}`;
}
