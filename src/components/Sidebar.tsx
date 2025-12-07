import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const Sidebar: React.FC = () => {
    // available tools that can be dragged to the canvas
    const tools = [
        { id: 'row-container', name: 'Row', type: 'row' },
        { id: 'column-container', name: 'Column', type: 'column' },
        { id: 'text-item', name: 'Text', type: 'item' },
        { id: 'image-item', name: 'Image', type: 'item' },
        { id: 'email-item', name: 'Email', type: 'item' },
        { id: 'input-item', name: 'Input', type: 'item' },
        { id: 'name-item', name: 'Name', type: 'item' },
        { id: 'phone-item', name: 'Phone', type: 'item' }
    ];

    // group tools by category for organized display
    const categories = ['row', 'column', 'item'];

    return (
        <div className="w-60 bg-slate-800 text-white p-5 shrink-0 overflow-y-auto">
            <h3 className="m-0 mb-2 text-lg font-semibold">Toolbox</h3>
            <p className="m-0 mb-5 text-xs opacity-70">Drag to add</p>

            {categories.map(cat => (
                <Droppable key={cat} droppableId={`SIDEBAR-${cat.toUpperCase()}S`} type={cat} isDropDisabled={true}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {tools.filter(tool => tool.type === cat).map((tool, idx) => (
                                <Draggable key={tool.id} draggableId={tool.id} index={idx}>
                                    {(provided, snapshot) => (
                                        <>
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`p-3 mb-2 bg-white/10 border border-white/20 rounded cursor-grab flex items-center justify-center select-none hover:bg-white/15 ${snapshot.isDragging ? 'bg-white/25 border-white/40' : ''}`}
                                                style={provided.draggableProps.style}
                                            >
                                                <span>{tool.name}</span>
                                            </div>
                                            {/* show placeholder when dragging */}
                                            {snapshot.isDragging && (
                                                <div className="p-3 mb-2 bg-white/10 border border-white/20 border-dashed rounded flex items-center justify-center opacity-40">
                                                    <span>{tool.name}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            ))}
        </div>
    );
};

export default Sidebar;
