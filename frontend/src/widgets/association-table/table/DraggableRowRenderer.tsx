import { useDrag, useDrop } from "react-dnd";

import { Row, type RenderRowProps } from "react-data-grid";

interface DraggableRowRenderProps<R, SR> extends RenderRowProps<R, SR> {
  onRowReorder: (sourceIndex: number, targetIndex: number) => void;
}

export function DraggableRowRenderer<R, SR>({
  rowIdx,
  isRowSelected,
  className,
  onRowReorder,
  ...props
}: DraggableRowRenderProps<R, SR>) {
  const [{}, drag] = useDrag({
    type: "ROW_DRAG",
    item: { index: rowIdx },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{}, drop] = useDrop({
    accept: "ROW_DRAG",
    drop({ index }: { index: number }) {
      onRowReorder(index, rowIdx);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <Row
      ref={(ref) => {
        if (ref) {
          drag(ref.firstElementChild);
        }
        drop(ref);
      }}
      rowIdx={rowIdx}
      isRowSelected={isRowSelected}
      className={className}
      {...props}
    />
  );
}
