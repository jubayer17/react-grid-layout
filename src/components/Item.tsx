import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Item as ItemType } from '../data/types';

interface ItemProps {
    item: ItemType;
    index: number;
    onClick?: (itemId: string) => void;
}

const Item: React.FC<ItemProps> = ({ item, index, onClick }) => {
    const renderItemContent = () => {
        switch (item.type) {
            case 'email':
                return (
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {item.content}
                        </label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            case 'input':
                return (
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {item.content}
                        </label>
                        <input
                            type="text"
                            placeholder="Enter text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            case 'name':
                return (
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {item.content}
                        </label>
                        <input
                            type="text"
                            placeholder="Enter name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            case 'phone':
                return (
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {item.content}
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter phone number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            default:
                return <div className="flex-1 mr-2">{item.content}</div>;
        }
    };

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-3 mb-2 bg-white text-black border border-gray-200 rounded cursor-grab select-none flex justify-between items-center relative hover:border-gray-400 ${snapshot.isDragging ? 'bg-gray-100 border-blue-500 shadow-md' : ''
                        }`}
                    style={provided.draggableProps.style}
                    onClick={() => onClick?.(item.id)}
                >
                    {renderItemContent()}
                </div>
            )}
        </Draggable>
    );
};

export default Item;