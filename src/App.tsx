import React, { useState } from 'react';
import { DragDropContext, Droppable, type DropResult, type DraggableLocation } from '@hello-pangea/dnd';
import { initialData } from './data/initialData';
import type { InitialData } from './data/types';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import './App.css';

const App: React.FC = () => {
  const [data, _setData] = useState<InitialData>(() => {
    const saved = sessionStorage.getItem('dnd-grid-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn('Failed to parse saved data, using defaults');
      }
    }
    return initialData;
  });

  const setData = (newData: InitialData) => {
    _setData(newData);
    sessionStorage.setItem('dnd-grid-data', JSON.stringify(newData));
  };

  const getNextLetter = (usedLetters: Set<string>) => {
    let charCode = 65;
    while (usedLetters.has(String.fromCharCode(charCode))) {
      charCode++;
    }
    return String.fromCharCode(charCode);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (source.droppableId.startsWith('SIDEBAR-')) {
      handleSidebarDrop(draggableId, destination);
      return;
    }

    if (['TRASH', 'TRASH-COL', 'TRASH-ITEM'].includes(destination.droppableId)) {
      if (type === 'row') handleDeleteRow(draggableId);
      else if (type === 'column') handleDeleteColumn(draggableId);
      else if (type === 'item') handleDeleteItem(draggableId);
      return;
    }

    if (type === 'row') handleRowReorder(source, destination, draggableId);
    else if (type === 'column') handleColumnMove(source, destination, draggableId);
    else if (type === 'item') handleItemMove(source, destination, draggableId);
  };

  const handleSidebarDrop = (itemType: string, destination: DraggableLocation) => {
    const itemTypes = ['text-item', 'image-item', 'email-item', 'input-item', 'name-item', 'phone-item'];
    if (itemTypes.includes(itemType)) {
      if (!destination.droppableId.startsWith('column-')) return;

      const col = data.columns[destination.droppableId];

      const typeConfig: Record<string, { prefix: string; type: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone' }> = {
        'text-item': { prefix: 'Sample Text', type: 'text' },
        'image-item': { prefix: 'Sample Image', type: 'image' },
        'email-item': { prefix: 'Email', type: 'email' },
        'input-item': { prefix: 'Input', type: 'input' },
        'name-item': { prefix: 'Name', type: 'name' },
        'phone-item': { prefix: 'Phone', type: 'phone' }
      };

      const config = typeConfig[itemType];
      if (!config) return;

      const existingItems = col.itemIds.map(id => data.items[id]).filter(Boolean);
      const similar = existingItems.filter(item => item.content.startsWith(config.prefix));

      let maxNum = 0;
      for (const item of similar) {
        const match = item.content.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }

      const newItem = {
        id: `item-${Date.now()}`,
        content: `${config.prefix} ${maxNum + 1}`,
        type: config.type
      };

      const newItemIds = [...col.itemIds];
      newItemIds.splice(destination.index, 0, newItem.id);

      setData({
        ...data,
        items: { ...data.items, [newItem.id]: newItem },
        columns: { ...data.columns, [col.id]: { ...col, itemIds: newItemIds } }
      });
    }
    else if (itemType === 'column-container') {
      if (!destination.droppableId.startsWith('row-')) return;

      const row = data.rows[destination.droppableId];
      const usedLetters = new Set(
        row.columnIds.map(colId => {
          const match = data.columns[colId].title.match(/Column ([A-Z]+)/);
          return match ? match[1] : '';
        })
      );

      const newColumn = {
        id: `column-${Date.now()}`,
        title: `Column ${getNextLetter(usedLetters)}`,
        itemIds: []
      };

      const newColumnIds = [...row.columnIds];
      newColumnIds.splice(destination.index, 0, newColumn.id);

      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
        rows: { ...data.rows, [row.id]: { ...row, columnIds: newColumnIds } }
      });
    }
    else if (itemType === 'row-container') {
      if (destination.droppableId !== 'all-rows') return;

      const usedLetters = new Set(
        data.rowOrder.map(rowId => {
          const match = data.rows[rowId].title.match(/Row ([A-Z]+)/);
          return match ? match[1] : '';
        })
      );

      const newRow = {
        id: `row-${Date.now()}`,
        title: `Row ${getNextLetter(usedLetters)}`,
        columnIds: []
      };

      const newRowOrder = [...data.rowOrder];
      newRowOrder.splice(destination.index, 0, newRow.id);

      setData({
        ...data,
        rows: { ...data.rows, [newRow.id]: newRow },
        rowOrder: newRowOrder
      });
    }
  };

  const handleRowReorder = (source: DraggableLocation, destination: DraggableLocation, rowId: string) => {
    const newOrder = [...data.rowOrder];
    newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, rowId);
    setData({ ...data, rowOrder: newOrder });
  };

  const handleColumnMove = (source: DraggableLocation, destination: DraggableLocation, columnId: string) => {
    const srcRow = data.rows[source.droppableId];
    const dstRow = data.rows[destination.droppableId];

    if (srcRow.id === dstRow.id) {
      const newCols = [...srcRow.columnIds];
      newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, columnId);

      setData({
        ...data,
        rows: { ...data.rows, [srcRow.id]: { ...srcRow, columnIds: newCols } }
      });
    } else {
      const srcCols = [...srcRow.columnIds];
      srcCols.splice(source.index, 1);

      const dstCols = [...dstRow.columnIds];
      dstCols.splice(destination.index, 0, columnId);

      setData({
        ...data,
        rows: {
          ...data.rows,
          [srcRow.id]: { ...srcRow, columnIds: srcCols },
          [dstRow.id]: { ...dstRow, columnIds: dstCols }
        }
      });
    }
  };

  const handleItemMove = (source: DraggableLocation, destination: DraggableLocation, itemId: string) => {
    const srcCol = data.columns[source.droppableId];
    const dstCol = data.columns[destination.droppableId];

    if (srcCol.id === dstCol.id) {
      const newItems = [...srcCol.itemIds];
      newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, itemId);

      setData({
        ...data,
        columns: { ...data.columns, [srcCol.id]: { ...srcCol, itemIds: newItems } }
      });
    } else {
      const srcItems = [...srcCol.itemIds];
      srcItems.splice(source.index, 1);

      const dstItems = [...dstCol.itemIds];
      dstItems.splice(destination.index, 0, itemId);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [srcCol.id]: { ...srcCol, itemIds: srcItems },
          [dstCol.id]: { ...dstCol, itemIds: dstItems }
        }
      });
    }
  };

  const handleColumnResize = (columnId: string, newWidth: number) => {
    const col = data.columns[columnId];
    if (!col) return;

    setData({
      ...data,
      columns: { ...data.columns, [columnId]: { ...col, width: newWidth } }
    });
  };

  const handleDeleteRow = (rowId: string) => {
    const newRowOrder = data.rowOrder.filter(id => id !== rowId);
    const newRows = { ...data.rows };
    delete newRows[rowId];

    newRowOrder.forEach((rId, idx) => {
      if (newRows[rId]) {
        newRows[rId] = {
          ...newRows[rId],
          title: `Row ${String.fromCharCode(65 + idx)}`
        };
      }
    });

    setData({ ...data, rowOrder: newRowOrder, rows: newRows });
  };

  const handleDeleteColumn = (columnId: string) => {
    const rowId = Object.keys(data.rows).find(rid =>
      data.rows[rid].columnIds.includes(columnId)
    );
    if (!rowId) return;

    const row = data.rows[rowId];
    const newColIds = row.columnIds.filter(id => id !== columnId);
    const newCols = { ...data.columns };
    delete newCols[columnId];

    newColIds.forEach((colId, idx) => {
      if (newCols[colId]) {
        newCols[colId] = {
          ...newCols[colId],
          title: `Column ${String.fromCharCode(65 + idx)}`
        };
      }
    });

    setData({
      ...data,
      rows: { ...data.rows, [rowId]: { ...row, columnIds: newColIds } },
      columns: newCols
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const colId = Object.keys(data.columns).find(cid =>
      data.columns[cid].itemIds.includes(itemId)
    );
    if (!colId) return;

    const col = data.columns[colId];
    const newItemIds = col.itemIds.filter(id => id !== itemId);
    const newItems = { ...data.items };
    delete newItems[itemId];

    setData({
      ...data,
      columns: { ...data.columns, [colId]: { ...col, itemIds: newItemIds } },
      items: newItems
    });
  };

  const getLayoutData = () => {
    const layout = data.rowOrder.map(rowId => {
      const row = data.rows[rowId];
      if (!row) return null;

      return {
        type: 'ROW',
        id: rowId,
        children: row.columnIds.map(colId => {
          const col = data.columns[colId];
          if (!col) return null;

          return {
            type: 'COLUMN',
            id: colId,
            children: col.itemIds.map(itemId => {
              const item = data.items[itemId];
              if (!item) return null;

              return {
                type: 'COMPONENT',
                id: itemId,
                content: item.content
              };
            }).filter(Boolean)
          };
        }).filter(Boolean)
      };
    }).filter(Boolean);

    return { layout };
  };

  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string } | null>(null);

  const handleItemClick = (itemId: string) => {
    setSelectedItem({ id: itemId, type: 'Item' });
  };

  const handleRowClick = (rowId: string) => {
    setSelectedItem({ id: rowId, type: 'Row' });
  };

  const handleColumnClick = (columnId: string) => {
    setSelectedItem({ id: columnId, type: 'Column' });
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 bg-gray-100 overflow-auto">
          <Board
            data={data}
            onColumnResize={handleColumnResize}
            onItemClick={handleItemClick}
            onRowClick={handleRowClick}
            onColumnClick={handleColumnClick}
          />

          <div className="mt-5 p-5 bg-gray-50 border-t border-gray-200">
            <h3 className="mt-0 mb-2.5 text-base text-gray-800">Full Object Data:</h3>
            <textarea
              readOnly
              className="w-full h-[200px] font-mono text-xs p-2.5 border border-gray-300 rounded bg-white text-black resize-y"
              value={JSON.stringify(getLayoutData(), null, 2)}
            />
          </div>
        </div>

        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-9999" onClick={closeModal}>
            <div className="bg-white text-black p-5 rounded-lg min-w-[300px] shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="mt-0 text-slate-700">{selectedItem.type} Details</h3>
              <p><strong>ID:</strong> {selectedItem.id}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-8 right-8 w-36 h-36 bg-red-50 border-2 border-dashed border-red-400 rounded-xl flex justify-center items-center z-50 transition-all duration-300 shadow-lg hover:scale-105 hover:bg-red-100">
          <div className="absolute text-red-500 font-bold text-sm pointer-events-none flex flex-col items-center gap-2">
            <span className="text-2xl">🗑️</span>
            DROP TO DELETE
          </div>

          <Droppable droppableId="TRASH" type="row">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`absolute top-0 left-0 w-full h-full rounded-xl ${snapshot.isDraggingOver ? 'bg-red-500/15 border-2 border-red-500 shadow-[inset_0_0_20px_rgba(231,76,60,0.2)]' : ''
                  }`}
              >
                <div style={{ display: 'none' }}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="TRASH-COL" type="column">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`absolute top-0 left-0 w-full h-full rounded-xl ${snapshot.isDraggingOver ? 'bg-red-500/15 border-2 border-red-500 shadow-[inset_0_0_20px_rgba(231,76,60,0.2)]' : ''
                  }`}
              >
                <div style={{ display: 'none' }}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="TRASH-ITEM" type="item">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`absolute top-0 left-0 w-full h-full rounded-xl ${snapshot.isDraggingOver ? 'bg-red-500/15 border-2 border-red-500 shadow-[inset_0_0_20px_rgba(231,76,60,0.2)]' : ''
                  }`}
              >
                <div style={{ display: 'none' }}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
};

export default App;