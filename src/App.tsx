import React, { useState } from 'react';
import { DragDropContext, Droppable, type DropResult, type DraggableLocation } from '@hello-pangea/dnd';
import { initialData } from './data/initialData';
import type { InitialData } from './data/types';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import './App.css';

const App: React.FC = () => {
  // load saved layout from session or use defaults
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

  // wrapper to auto-save whenever data changes
  const setData = (newData: InitialData) => {
    _setData(newData);
    sessionStorage.setItem('dnd-grid-data', JSON.stringify(newData));
  };

  // find next available letter (A, B, C...)
  const getNextLetter = (usedLetters: Set<string>) => {
    let charCode = 65;
    while (usedLetters.has(String.fromCharCode(charCode))) {
      charCode++;
    }
    return String.fromCharCode(charCode);
  };

  // handles all drag and drop operations
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // dragged from sidebar - create new element
    if (source.droppableId.startsWith('SIDEBAR-')) {
      handleSidebarDrop(draggableId, destination);
      return;
    }

    // dropped in trash - delete element
    if (destination.droppableId === 'TRASH' || destination.droppableId === 'TRASH-COL' || destination.droppableId.startsWith('TRASH-ITEM')) {
      if (type === 'row') handleDeleteRow(draggableId);
      else if (type === 'column') handleDeleteColumn(draggableId);
      else handleDeleteItem(draggableId);
      return;
    }

    if (type === 'row') handleRowReorder(source, destination, draggableId);
    else if (type === 'column') handleColumnMove(source, destination, draggableId);
    else handleItemMove(source, destination, draggableId);
  };

  const handleSidebarDrop = (itemType: string, destination: DraggableLocation) => {
    const isItemType = ['text-item', 'image-item', 'email-item', 'input-item', 'name-item', 'phone-item'].includes(itemType);

    // adding a new form field item
    if (isItemType) {
      if (!destination.droppableId.startsWith('r-')) return;

      const col = data.columns[destination.droppableId];
      const typeMap: Record<string, { prefix: string; type: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone' }> = {
        'text-item': { prefix: 'Sample Text', type: 'text' },
        'image-item': { prefix: 'Sample Image', type: 'image' },
        'email-item': { prefix: 'Email', type: 'email' },
        'input-item': { prefix: 'Input', type: 'input' },
        'name-item': { prefix: 'Name', type: 'name' },
        'phone-item': { prefix: 'Phone', type: 'phone' }
      };

      const config = typeMap[itemType];
      if (!config) return;

      const existingItems = col.itemIds.map(id => data.items[id]).filter(Boolean);
      const similarItems = existingItems.filter(item => item.content.startsWith(config.prefix));

      // find highest number to avoid duplicates
      let maxNumber = 0;
      similarItems.forEach(item => {
        const match = item.content.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      // extract row and column numbers for proper ID
      const colMatch = destination.droppableId.match(/r-(\d+)-c-(\d+)/);
      const rowNum = colMatch?.[1] || '1';
      const colNum = colMatch?.[2] || '1';

      // find next item number in this column
      const itemNumbers = col.itemIds.map(itemId => {
        const match = itemId.match(/i-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const nextItemNum = Math.max(0, ...itemNumbers) + 1;

      const newItem = {
        id: `r-${rowNum}-c-${colNum}-i-${nextItemNum}`,
        content: `${config.prefix} ${maxNumber + 1}`,
        type: config.type
      };

      const updatedItemIds = [...col.itemIds];
      updatedItemIds.splice(destination.index, 0, newItem.id);

      setData({
        ...data,
        items: { ...data.items, [newItem.id]: newItem },
        columns: { ...data.columns, [col.id]: { ...col, itemIds: updatedItemIds } }
      });
      return;
    }

    // adding a new column to a row
    if (itemType === 'column-container') {
      if (!destination.droppableId.startsWith('r-')) return;

      const row = data.rows[destination.droppableId];
      const rowNum = destination.droppableId.match(/r-(\d+)/)?.[1] || '1';

      // find next column number for this row
      const colNumbers = row.columnIds.map(colId => {
        const match = colId.match(/c-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const nextColNum = Math.max(0, ...colNumbers) + 1;

      const usedLetters = new Set(
        row.columnIds.map(colId => {
          const columnTitle = data.columns[colId].title;
          const match = columnTitle.match(/Column ([A-Z]+)/);
          return match ? match[1] : '';
        })
      );

      const newColumn = {
        id: `r-${rowNum}-c-${nextColNum}`,
        title: `Column ${getNextLetter(usedLetters)}`,
        itemIds: []
      };

      const updatedColumnIds = [...row.columnIds];
      updatedColumnIds.splice(destination.index, 0, newColumn.id);

      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
        rows: { ...data.rows, [row.id]: { ...row, columnIds: updatedColumnIds } }
      });
      return;
    }

    // adding a new row to the board
    if (itemType === 'row-container') {
      if (destination.droppableId !== 'all-rows') return;

      // find next row number
      const rowNumbers = data.rowOrder.map(rowId => {
        const match = rowId.match(/r-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const nextRowNum = Math.max(0, ...rowNumbers) + 1;

      const usedLetters = new Set(
        data.rowOrder.map(rowId => {
          const rowTitle = data.rows[rowId].title;
          const match = rowTitle.match(/Row ([A-Z]+)/);
          return match ? match[1] : '';
        })
      );

      const newRow = {
        id: `r-${nextRowNum}`,
        title: `Row ${getNextLetter(usedLetters)}`,
        columnIds: []
      };

      const updatedRowOrder = [...data.rowOrder];
      updatedRowOrder.splice(destination.index, 0, newRow.id);

      setData({
        ...data,
        rows: { ...data.rows, [newRow.id]: newRow },
        rowOrder: updatedRowOrder
      });
    }
  };

  const handleRowReorder = (source: DraggableLocation, destination: DraggableLocation, rowId: string) => {
    const updatedOrder = [...data.rowOrder];
    updatedOrder.splice(source.index, 1);
    updatedOrder.splice(destination.index, 0, rowId);
    setData({ ...data, rowOrder: updatedOrder });
  };

  const handleColumnMove = (source: DraggableLocation, destination: DraggableLocation, columnId: string) => {
    const sourceRow = data.rows[source.droppableId];
    const destRow = data.rows[destination.droppableId];

    // reordering within same row
    if (sourceRow.id === destRow.id) {
      const updatedCols = [...sourceRow.columnIds];
      updatedCols.splice(source.index, 1);
      updatedCols.splice(destination.index, 0, columnId);

      // rename columns to keep sequence
      const updatedColumns = { ...data.columns };
      updatedCols.forEach((colId, index) => {
        if (updatedColumns[colId]) {
          updatedColumns[colId] = {
            ...updatedColumns[colId],
            title: `Column ${String.fromCharCode(65 + index)}`
          };
        }
      });

      setData({
        ...data,
        columns: updatedColumns,
        rows: { ...data.rows, [sourceRow.id]: { ...sourceRow, columnIds: updatedCols } }
      });
    } else {
      // moving to different row
      const sourceCols = [...sourceRow.columnIds];
      sourceCols.splice(source.index, 1);

      const destCols = [...destRow.columnIds];
      destCols.splice(destination.index, 0, columnId);

      // rename columns in both rows
      const updatedColumns = { ...data.columns };

      sourceCols.forEach((colId, index) => {
        if (updatedColumns[colId]) {
          updatedColumns[colId] = {
            ...updatedColumns[colId],
            title: `Column ${String.fromCharCode(65 + index)}`
          };
        }
      });

      destCols.forEach((colId, index) => {
        if (updatedColumns[colId]) {
          updatedColumns[colId] = {
            ...updatedColumns[colId],
            title: `Column ${String.fromCharCode(65 + index)}`
          };
        }
      });

      setData({
        ...data,
        columns: updatedColumns,
        rows: {
          ...data.rows,
          [sourceRow.id]: { ...sourceRow, columnIds: sourceCols },
          [destRow.id]: { ...destRow, columnIds: destCols }
        }
      });
    }
  };

  const handleItemMove = (source: DraggableLocation, destination: DraggableLocation, itemId: string) => {
    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];

    // reordering within same column
    if (sourceCol.id === destCol.id) {
      const updatedItems = [...sourceCol.itemIds];
      updatedItems.splice(source.index, 1);
      updatedItems.splice(destination.index, 0, itemId);

      setData({
        ...data,
        columns: { ...data.columns, [sourceCol.id]: { ...sourceCol, itemIds: updatedItems } }
      });
    } else {
      // moving to different column - need to renumber items
      const sourceItems = [...sourceCol.itemIds];
      sourceItems.splice(source.index, 1);

      const destItems = [...destCol.itemIds];
      destItems.splice(destination.index, 0, itemId);

      // renumber items in both columns
      const updatedItems = { ...data.items };
      const updatedColumns = { ...data.columns };

      // extract row and column numbers from IDs
      const sourceMatch = sourceCol.id.match(/r-(\d+)-c-(\d+)/);
      const destMatch = destCol.id.match(/r-(\d+)-c-(\d+)/);

      // process source column first (without deleting items yet)
      const sourceItemsMap: Record<string, { id: string; content: string; type?: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone' }> = {};
      const newSourceItemIds: string[] = [];
      const sourceTypeCounters: Record<string, number> = { text: 0, image: 0, email: 0, input: 0, name: 0, phone: 0 };

      sourceItems.forEach((oldItemId, index) => {
        const newItemId = `r-${sourceMatch?.[1]}-c-${sourceMatch?.[2]}-i-${index + 1}`;
        newSourceItemIds.push(newItemId);

        const item = updatedItems[oldItemId];
        const itemType = item.type || 'text';
        sourceTypeCounters[itemType]++;

        // update content based on type
        let newContent = item.content;
        if (itemType === 'text') newContent = `Sample Text ${sourceTypeCounters[itemType]}`;
        else if (itemType === 'image') newContent = `Sample Image ${sourceTypeCounters[itemType]}`;
        else if (itemType === 'email') newContent = `Email ${sourceTypeCounters[itemType]}`;
        else if (itemType === 'input') newContent = `Input ${sourceTypeCounters[itemType]}`;
        else if (itemType === 'name') newContent = `Name ${sourceTypeCounters[itemType]}`;
        else if (itemType === 'phone') newContent = `Phone ${sourceTypeCounters[itemType]}`;

        sourceItemsMap[newItemId] = { ...item, id: newItemId, content: newContent };
      });

      // process destination column
      const destItemsMap: Record<string, { id: string; content: string; type?: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone' }> = {};
      const newDestItemIds: string[] = [];
      const destTypeCounters: Record<string, number> = { text: 0, image: 0, email: 0, input: 0, name: 0, phone: 0 };

      destItems.forEach((oldItemId, index) => {
        const newItemId = `r-${destMatch?.[1]}-c-${destMatch?.[2]}-i-${index + 1}`;
        newDestItemIds.push(newItemId);

        const item = updatedItems[oldItemId];
        const itemType = item.type || 'text';
        destTypeCounters[itemType]++;

        // update content based on type
        let newContent = item.content;
        if (itemType === 'text') newContent = `Sample Text ${destTypeCounters[itemType]}`;
        else if (itemType === 'image') newContent = `Sample Image ${destTypeCounters[itemType]}`;
        else if (itemType === 'email') newContent = `Email ${destTypeCounters[itemType]}`;
        else if (itemType === 'input') newContent = `Input ${destTypeCounters[itemType]}`;
        else if (itemType === 'name') newContent = `Name ${destTypeCounters[itemType]}`;
        else if (itemType === 'phone') newContent = `Phone ${destTypeCounters[itemType]}`;

        destItemsMap[newItemId] = { ...item, id: newItemId, content: newContent };
      });

      // clear old items and add new ones
      sourceItems.forEach(oldId => delete updatedItems[oldId]);
      destItems.forEach(oldId => delete updatedItems[oldId]);

      Object.assign(updatedItems, sourceItemsMap, destItemsMap);

      updatedColumns[sourceCol.id] = { ...sourceCol, itemIds: newSourceItemIds };
      updatedColumns[destCol.id] = { ...destCol, itemIds: newDestItemIds };

      setData({
        ...data,
        items: updatedItems,
        columns: updatedColumns
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
    const row = data.rows[rowId];
    if (!row) return;

    // delete all columns and items belonging to this row
    const updatedColumns = { ...data.columns };
    const updatedItems = { ...data.items };

    row.columnIds.forEach(colId => {
      const col = data.columns[colId];
      if (col) {
        col.itemIds.forEach(itemId => {
          delete updatedItems[itemId];
        });
      }
      delete updatedColumns[colId];
    });

    const updatedRowOrder = data.rowOrder.filter(id => id !== rowId);
    const updatedRows = { ...data.rows };
    delete updatedRows[rowId];

    // create new objects for renumbered rows
    const finalRows: Record<string, { id: string; title: string; columnIds: string[] }> = {};
    const finalColumns: Record<string, { id: string; title: string; itemIds: string[]; width?: number }> = {};
    const finalItems: Record<string, { id: string; content: string; type?: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone' }> = {};

    // renumber remaining rows
    updatedRowOrder.forEach((oldRowId, index) => {
      const newRowId = `r-${index + 1}`;
      const row = updatedRows[oldRowId];

      if (row) {
        const newColumnIds: string[] = [];

        // renumber columns for this row
        row.columnIds.forEach((oldColId, colIndex) => {
          const newColId = `${newRowId}-c-${colIndex + 1}`;
          const col = updatedColumns[oldColId];

          if (col) {
            const newItemIds: string[] = [];

            // renumber items for this column
            col.itemIds.forEach((oldItemId, itemIndex) => {
              const newItemId = `${newColId}-i-${itemIndex + 1}`;
              const item = updatedItems[oldItemId];

              if (item) {
                finalItems[newItemId] = { ...item, id: newItemId };
              }
              newItemIds.push(newItemId);
            });

            finalColumns[newColId] = {
              ...col,
              id: newColId,
              title: `Column ${String.fromCharCode(65 + colIndex)}`,
              itemIds: newItemIds
            };
          }
          newColumnIds.push(newColId);
        });

        finalRows[newRowId] = {
          ...row,
          id: newRowId,
          title: `Row ${String.fromCharCode(65 + index)}`,
          columnIds: newColumnIds
        };
      }
    });

    setData({
      ...data,
      rowOrder: updatedRowOrder.map((_, idx) => `r-${idx + 1}`),
      rows: finalRows,
      columns: finalColumns,
      items: finalItems
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const rowId = Object.keys(data.rows).find(id =>
      data.rows[id].columnIds.includes(columnId)
    );
    if (!rowId) return;

    const row = data.rows[rowId];
    const updatedColIds = row.columnIds.filter(id => id !== columnId);
    const updatedCols = { ...data.columns };
    const updatedItems = { ...data.items };

    delete updatedCols[columnId];

    // extract row number
    const rowNum = rowId.match(/r-(\d+)/)?.[1] || '1';

    // renumber columns and items
    const newColumnIds: string[] = [];
    updatedColIds.forEach((oldColId, colIndex) => {
      const newColId = `r-${rowNum}-c-${colIndex + 1}`;

      if (updatedCols[oldColId]) {
        const col = updatedCols[oldColId];
        const newItemIds: string[] = [];

        // update item IDs
        col.itemIds.forEach((oldItemId, itemIndex) => {
          const newItemId = `${newColId}-i-${itemIndex + 1}`;

          if (updatedItems[oldItemId]) {
            updatedItems[newItemId] = { ...updatedItems[oldItemId], id: newItemId };
            if (oldItemId !== newItemId) {
              delete updatedItems[oldItemId];
            }
          }
          newItemIds.push(newItemId);
        });

        updatedCols[newColId] = {
          ...col,
          id: newColId,
          title: `Column ${String.fromCharCode(65 + colIndex)}`,
          itemIds: newItemIds
        };

        // only delete old column if ID changed
        if (oldColId !== newColId) {
          delete updatedCols[oldColId];
        }
      }
      newColumnIds.push(newColId);
    });

    setData({
      ...data,
      rows: { ...data.rows, [rowId]: { ...row, columnIds: newColumnIds } },
      columns: updatedCols,
      items: updatedItems
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const colId = Object.keys(data.columns).find(id =>
      data.columns[id].itemIds.includes(itemId)
    );
    if (!colId) return;

    const column = data.columns[colId];
    const updatedItemIds = column.itemIds.filter(id => id !== itemId);
    const updatedItems = { ...data.items };
    delete updatedItems[itemId];

    // renumber items with updated IDs
    const newItemIds: string[] = [];
    updatedItemIds.forEach((oldItemId, index) => {
      const colPrefix = colId.match(/(r-\d+-c-\d+)/)?.[1] || colId;
      const newItemId = `${colPrefix}-i-${index + 1}`;

      if (updatedItems[oldItemId]) {
        updatedItems[newItemId] = { ...updatedItems[oldItemId], id: newItemId };
        delete updatedItems[oldItemId];
      }
      newItemIds.push(newItemId);
    });

    // renumber item content by type
    const itemsByType: Record<string, string[]> = {};
    newItemIds.forEach(id => {
      const item = updatedItems[id];
      if (item) {
        const type = item.type || 'text';
        if (!itemsByType[type]) itemsByType[type] = [];
        itemsByType[type].push(id);
      }
    });

    // update content numbers for each type
    Object.keys(itemsByType).forEach(type => {
      const typePrefix = type === 'text' ? 'Sample Text' :
        type === 'image' ? 'Sample Image' :
          type === 'email' ? 'Email' :
            type === 'input' ? 'Input' :
              type === 'name' ? 'Name' :
                type === 'phone' ? 'Phone' : 'Item';

      itemsByType[type].forEach((id, index) => {
        updatedItems[id] = {
          ...updatedItems[id],
          content: `${typePrefix} ${index + 1}`
        };
      });
    });

    setData({
      ...data,
      columns: { ...data.columns, [colId]: { ...column, itemIds: newItemIds } },
      items: updatedItems
    });
  };  // generate hierarchical layout structure for display
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

        {/* modal to show item details */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={closeModal}>
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

        {/* trash bin for deleting items */}
        <div className="fixed bottom-8 right-8 w-36 h-36 bg-red-50 border-2 border-dashed border-red-400 rounded-xl flex justify-center items-center z-50 transition-all duration-300 shadow-lg hover:scale-105 hover:bg-red-100">
          <div className="absolute text-red-500 font-bold text-sm pointer-events-none flex flex-col items-center gap-2">
            <span className="text-2xl">🗑️</span>
            DROP TO DELETE
          </div>

          {/* separate droppable zones for each type */}
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
                className={`absolute inset-0 rounded-xl ${snapshot.isDraggingOver ? 'bg-red-500/15 border-2 border-red-500' : ''}`}
              >
                <div style={{ display: 'none' }}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>

          {/* Accept items in trash - use text type to match items */}
          <Droppable droppableId="TRASH-ITEM" type="text">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`absolute inset-0 rounded-xl ${snapshot.isDraggingOver ? 'bg-red-500/15 border-2 border-red-500' : ''}`}
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