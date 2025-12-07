import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Row from './Row';
import type { InitialData } from '../data/types';

interface BoardProps {
    data: InitialData;
    onColumnResize?: (columnId: string, newWidth: number) => void;
    onItemClick?: (itemId: string) => void;
    onRowClick?: (rowId: string) => void;
    onColumnClick?: (columnId: string) => void;
}

const Board: React.FC<BoardProps> = ({
    data,
    onColumnResize,
    onItemClick,
    onRowClick,
    onColumnClick
}) => {
    if (!data?.rowOrder) {
        return <div>Loading...</div>;
    }

    return (
        <Droppable droppableId="all-rows" type="row">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-5 w-full min-h-screen box-border ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                >
                    {data.rowOrder.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center text-gray-400 mt-20 text-lg">
                            Drag a Row here to get started
                        </div>
                    )}
                    {data.rowOrder.map((rowId, idx) => {
                        const row = data.rows[rowId];
                        if (!row) return null;

                        // get columns for this row
                        const cols = row.columnIds
                            .map(colId => data.columns[colId])
                            .filter(Boolean);

                        return (
                            <Row
                                key={row.id}
                                row={row}
                                columns={cols}
                                items={data.items}
                                index={idx}
                                onColumnResize={onColumnResize}
                                onItemClick={onItemClick}
                                onRowClick={onRowClick}
                                onColumnClick={onColumnClick}
                            />
                        );
                    })}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default Board;