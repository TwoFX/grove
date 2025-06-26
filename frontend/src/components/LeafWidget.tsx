"use client";

import { useGroveStore } from "@/lib/state/state";
import { JSX, ReactElement } from "react";
import { BsChevronDown } from "react-icons/bs";

export function LeafWidget({
  id,
  widgetType,
  title,
  children,
}: {
  id: string;
  widgetType: string;
  title: string;
  children: ReactElement;
}): JSX.Element {
  const isExpanded = useGroveStore((state) => state.expanded[id]);
  const toggleExpanded = useGroveStore((state) => state.toggleExpanded);

  return (
    <div className={isExpanded ? "border-gray-200 border-1" : ""}>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-100 gap-1 rounded"
        onClick={() => toggleExpanded(id)}
      >
        <BsChevronDown className={isExpanded ? "" : "-rotate-90"} />
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-bold">{widgetType}:</span>
          <span className="font-mono">{title}</span>
        </div>
      </div>
      {isExpanded && <div className="pl-6 pt-2 pb-2">{children}</div>}
    </div>
  );
}
