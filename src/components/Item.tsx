import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Item as ItemType } from '../data/types';

interface ItemProps {
    item: ItemType;
    index: number;
    onClick?: (itemId: string) => void;
}

const Item: React.FC<ItemProps> = ({ item, index, onClick }) => {
    // each item type has a unique color scheme
    const getBgColor = () => {
        if (item.type === 'email') return 'bg-blue-50 border-blue-200 hover:border-blue-400';
        if (item.type === 'input') return 'bg-green-50 border-green-200 hover:border-green-400';
        if (item.type === 'name') return 'bg-purple-50 border-purple-200 hover:border-purple-400';
        if (item.type === 'phone') return 'bg-orange-50 border-orange-200 hover:border-orange-400';
        if (item.type === 'text') return 'bg-yellow-50 border-yellow-200 hover:border-yellow-400';
        if (item.type === 'image') return 'bg-pink-50 border-pink-200 hover:border-pink-400';
        return 'bg-white border-gray-200 hover:border-gray-400';
    };

    // render different UI based on item type
    const renderContent = () => {
        if (item.type === 'email') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-blue-700 mb-1.5">
                        📧 {item.content}
                    </label>
                    <input
                        type="email"
                        placeholder="example@email.com"
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }

        if (item.type === 'input') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-green-700 mb-1.5">
                        ✏️ {item.content}
                    </label>
                    <input
                        type="text"
                        placeholder="Type something..."
                        className="w-full px-3 py-2 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }

        if (item.type === 'name') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-purple-700 mb-1.5">
                        👤 {item.content}
                    </label>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            );
        }

        if (item.type === 'phone') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-orange-700 mb-1.5">
                        📞 {item.content}
                    </label>
                    <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }

        if (item.type === 'text') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-yellow-700 mb-1.5">
                        📝 {item.content}
                    </label>
                    <textarea
                        placeholder="Enter your text here..."
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }

        if (item.type === 'image') {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-pink-700 mb-1.5">
                        🖼️ {item.content}
                    </label>
                    <div className="border-2 border-dashed border-pink-300 rounded-md p-6 text-center bg-pink-50">
                        <div className="text-pink-500 mb-2">
                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-sm text-pink-600">Click to upload image</p>
                    </div>
                </div>
            );
        }

        // default view for unknown types
        return <div className="flex-1 mr-2 text-gray-700 font-medium">{item.content}</div>;
    };

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-3 mb-2 text-black border rounded cursor-grab select-none ${getBgColor()} ${snapshot.isDragging ? 'opacity-80 shadow-lg' : ''}`}
                    style={provided.draggableProps.style}
                    onClick={() => onClick?.(item.id)}
                >
                    {renderContent()}
                </div>
            )}
        </Draggable>
    );
};

export default Item;