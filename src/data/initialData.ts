import type { InitialData } from './types';

export const initialData: InitialData = {
    items: {
        'r-1-c-1-i-1': { id: 'r-1-c-1-i-1', content: 'Sample Text 1', type: 'text' },
        'r-1-c-1-i-2': { id: 'r-1-c-1-i-2', content: 'Sample Image 1', type: 'image' },
        'r-1-c-2-i-1': { id: 'r-1-c-2-i-1', content: 'Sample Text 1', type: 'text' },
    },
    columns: {
        'r-1-c-1': {
            id: 'r-1-c-1',
            title: 'Column A',
            itemIds: ['r-1-c-1-i-1', 'r-1-c-1-i-2'],
        },
        'r-1-c-2': {
            id: 'r-1-c-2',
            title: 'Column B',
            itemIds: ['r-1-c-2-i-1'],
        },
        'r-2-c-1': {
            id: 'r-2-c-1',
            title: 'Column A',
            itemIds: [],
        },
    },
    rows: {
        'r-1': {
            id: 'r-1',
            title: 'Row A',
            columnIds: ['r-1-c-1', 'r-1-c-2'],
        },
        'r-2': {
            id: 'r-2',
            title: 'Row B',
            columnIds: ['r-2-c-1'],
        },
        'r-3': {
            id: 'r-3',
            title: 'Row C (empty)',
            columnIds: [],
        },
    },
    rowOrder: ['r-1', 'r-2', 'r-3'],
};