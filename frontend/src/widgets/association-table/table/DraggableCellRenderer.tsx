import { useState } from "react";
import { Cell, CellRendererProps } from "react-data-grid";

/*
https://github.com/adazzle/react-data-grid/pull/3810
*/

interface DraggableCellRenderProps<R, SR> extends CellRendererProps<R, SR> {
  onRowReorder: (sourceIndex: number, targetIndex: number) => void;
}

export function DraggableCellRenderer<R, SR>({
  rowIdx,
  className,
  onRowReorder,
  ...props
}: DraggableCellRenderProps<R, SR>) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  if (isDragging) {
    className = className + " opacity-50";
  }
  if (isOver) {
    className = className + " bg-border-strong";
  }

  function onDragStart(event: React.DragEvent<HTMLDivElement>) {
    setIsDragging(true);
    event.dataTransfer.setDragImage(
      event.currentTarget.parentElement!.firstElementChild!,
      40,
      17,
    );
    event.dataTransfer.setData("text/plain", String(rowIdx));
    event.dataTransfer.dropEffect = "move";
  }

  function onDragEnd() {
    setIsDragging(false);
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    // prevent default to allow drop
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    setIsOver(false);
    // prevent the browser from redirecting in some cases
    event.preventDefault();
    onRowReorder(Number(event.dataTransfer.getData("text/plain")), rowIdx);
  }

  function onDragEnter(event: React.DragEvent<HTMLDivElement>) {
    if (isEventPertinent(event)) {
      setIsOver(true);
    }
  }

  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (isEventPertinent(event)) {
      setIsOver(false);
    }
  }

  return (
    <Cell
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      rowIdx={rowIdx}
      className={className}
      {...props}
    />
  );
}

// only accept pertinent drag events:
// - ignore drag events going from the container to an element inside the container
// - ignore drag events going from an element inside the container to the container
function isEventPertinent(event: React.DragEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null;

  return !event.currentTarget.contains(relatedTarget);
}
