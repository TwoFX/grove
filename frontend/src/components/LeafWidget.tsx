import { useGroveStore } from "@/state/state";
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
  const isCollapsed = useGroveStore((state) => state.collapsed[id]);
  const toggleCollapsed = useGroveStore((state) => state.toggleCollapsed);

  return (
    <div className={!isCollapsed ? "border-gray-200 border-1" : ""}>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-100 gap-1 rounded"
        onClick={() => toggleCollapsed(id)}
      >
        <BsChevronDown className={!isCollapsed ? "" : "-rotate-90"} />
        <span className="font-bold">{widgetType}:</span>
        <span className="font-mono">{title}</span>
      </div>
      {!isCollapsed && children}
    </div>
  );
}
