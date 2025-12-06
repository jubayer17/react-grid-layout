import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';
import type { Row as RowType, Column as ColumnType, Item as ItemType } from '../data/types';

interface RowProps {
    row: RowType;
    columns: ColumnType[];
    items: Record<string, ItemType>;
    index: number;
    onColumnResize?: (columnId: string, newWidth: number) => void;
    onItemClick?: (itemId: string) => void;
    onRowClick?: (rowId: string) => void;
    onColumnClick?: (columnId: string) => void;
}

const Row: React.FC<RowProps> = ({
    row,
    columns,
    items,
    index,
    onColumnResize,
    onItemClick,
    onRowClick,
    onColumnClick
}) => {
    return (
        <Draggable draggableId={row.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`mb-5 bg-white border border-gray-200 rounded overflow-hidden ${snapshot.isDragging ? 'opacity-80 shadow-lg' : ''
                        }`}
                    style={provided.draggableProps.style}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="p-3 px-4 bg-slate-700 text-white font-medium cursor-grab select-none flex items-center justify-between hover:bg-slate-600 transition-colors"
                        onClick={(e) => {
                            if (onRowClick) {
                                e.stopPropagation();
                                onRowClick(row.id);
                            }
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span>☰</span>
                            <span>{row.title}</span>
                        </div>
                    </div>

                    <div className="p-4 overflow-x-auto">
                        <Droppable droppableId={row.id} type="column" direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex gap-3 min-h-[150px] p-2 rounded ${snapshot.isDraggingOver ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    {columns.map((col, idx) => {
                                        const items = col.itemIds
                                            .map(itemId => items[itemId])
                                            .filter(Boolean);

                                        return (
                                            <Column
                                                key={col.id}
                                                column={col}
                                                items={colItems}
                                                index={idx}
                                                onResize={onColumnResize}
                                                onItemClick={onItemClick}
                                                onColumnClick={onColumnClick}
                                            />
                                        );
                                    })}
                                    {provided.placeholder}
                                    {columns.length === 0 && !snapshot.isDraggingOver && (
                                        <div className="w-full p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded">Drag columns here</div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Row;
