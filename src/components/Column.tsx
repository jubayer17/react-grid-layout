import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Item from './Item';
import type { Column as ColumnType, Item as ItemType } from '../data/types';

interface ColumnProps {
    column: ColumnType;
    items: ItemType[];
    index: number;
    onResize?: (columnId: string, newWidth: number) => void;
    onItemClick?: (itemId: string) => void;
    onColumnClick?: (columnId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
    column,
    items,
    index,
    onResize,
    onItemClick,
    onColumnClick
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(column.width || 280);
    const colRef = useRef<HTMLDivElement>(null);

    // handle column resize with mouse drag
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!colRef.current) return;
            const rect = colRef.current.getBoundingClientRect();
            const newWidth = Math.max(200, e.clientX - rect.left);
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            onResize?.(column.id, width);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, column.id, width, onResize]);

    return (
        <Draggable draggableId={column.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={(el) => {
                        provided.innerRef(el);
                        colRef.current = el;
                    }}
                    {...provided.draggableProps}
                    className={`relative min-w-[200px] bg-white border border-gray-200 rounded flex flex-col shrink-0 ${snapshot.isDragging ? 'opacity-80 shadow-lg' : ''}`}
                    style={{ ...provided.draggableProps.style, width: `${width}px` }}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="p-3 bg-blue-500 text-white font-medium cursor-grab select-none flex items-center justify-between rounded-t"
                        onClick={(e) => {
                            if (onColumnClick) {
                                e.stopPropagation();
                                onColumnClick(column.id);
                            }
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span>▭</span>
                            <span>{column.title}</span>
                        </div>
                    </div>

                    <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                            >
                                {items.map((item, idx) => (
                                    <Item
                                        key={item.id}
                                        item={item}
                                        index={idx}
                                        onClick={onItemClick}
                                    />
                                ))}
                                {provided.placeholder}
                                {/* show hint when column is empty */}
                                {items.length === 0 && !snapshot.isDraggingOver && (
                                    <div className="p-2.5 text-center text-gray-400 text-xs w-full overflow-hidden">Drop items here</div>
                                )}
                            </div>
                        )}
                    </Droppable>

                    {/* resize handle on right edge */}
                    <div
                        className={`absolute top-0 right-0 w-1.5 h-full cursor-ew-resize bg-transparent hover:bg-gray-200 ${isResizing ? 'bg-blue-500' : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsResizing(true);
                        }}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default Column;
