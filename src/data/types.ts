export interface Item {
    id: string;
    content: string;
    type?: 'text' | 'image' | 'email' | 'input' | 'name' | 'phone';
}

export interface Column {
    id: string;
    title: string;
    itemIds: string[];
    width?: number;
}

export interface Row {
    id: string;
    title: string;
    columnIds: string[];
}

export interface InitialData {
    items: Record<string, Item>;
    columns: Record<string, Column>;
    rows: Record<string, Row>;
    rowOrder: string[];
}