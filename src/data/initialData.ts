import type { InitialData } from './types';

export const initialData: InitialData = {
    items: {
        'item-1': { id: 'item-1', content: 'Sample Text Item ✏️', type: 'text' },
        'item-2': { id: 'item-2', content: 'Sample Image 🖼️', type: 'image' },
        'item-3': { id: 'item-3', content: 'Another Text Item 📝', type: 'text' },
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'Column A',
            itemIds: ['item-1', 'item-2'],
        },
        'column-2': {
            id: 'column-2',
            title: 'Column B',
            itemIds: ['item-3'],
        },
        'column-3': {
            id: 'column-3',
            title: 'Column A',
            itemIds: [],
        },
    },
    rows: {
        'row-1': {
            id: 'row-1',
            title: 'Row A',
            columnIds: ['column-1', 'column-2'],
        },
        'row-2': {
            id: 'row-2',
            title: 'Row B',
            columnIds: ['column-3'],
        },
        'row-3': {
            id: 'row-3',
            title: 'Row C (empty)',
            columnIds: [],
        },
    },
    rowOrder: ['row-1', 'row-2', 'row-3'],
};