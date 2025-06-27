"use client";

import { useGroveStore } from "@/lib/state/state";
import { JSX, ReactElement } from "react";
import { BsChevronDown } from "react-icons/bs";
import { FaWrench } from "react-icons/fa6";

export function LeafWidget({
  id,
  widgetType,
  title,
  children,
  link,
}: {
  id: string;
  widgetType: string;
  title: string;
  children: ReactElement;
  link?: string;
}): JSX.Element {
  const isExpanded = useGroveStore((state) => state.expanded[id]);
  const toggleExpanded = useGroveStore((state) => state.toggleExpanded);

  return (
    <div className={isExpanded ? "border-gray-200 border-1" : ""}>
      <div className="flex items-center gap-3">
        <div
          className="flex gap-1 items-center cursor-pointer hover:bg-gray-100 rounded"
          onClick={() => toggleExpanded(id)}
        >
          <BsChevronDown className={isExpanded ? "" : "-rotate-90"} />
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-bold">{widgetType}:</span>
            <span>{title}</span>
          </div>
        </div>
        {link && (
          <a href={`/${link}/${id}`}>
            <FaWrench size={14} />
          </a>
        )}
      </div>
      {isExpanded && <div className="pl-6 pt-2 pb-2">{children}</div>}
    </div>
  );
}
