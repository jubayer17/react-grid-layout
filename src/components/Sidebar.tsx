import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const Sidebar: React.FC = () => {
    const tools = [
        { id: 'row-container', name: 'Row', icon: '☰', type: 'row' },
        { id: 'column-container', name: 'Column', icon: '▭', type: 'column' },
        { id: 'text-item', name: 'Text', icon: '📝', type: 'item' },
        { id: 'image-item', name: 'Image', icon: '🖼️', type: 'item' },
        { id: 'email-item', name: 'Email', icon: '📧', type: 'item' },
        { id: 'input-item', name: 'Input', icon: '✏️', type: 'item' },
        { id: 'name-item', name: 'Name', icon: '👤', type: 'item' },
        { id: 'phone-item', name: 'Phone', icon: '📞', type: 'item' }
    ];

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
                                                className={`p-3 mb-2 bg-white/10 border border-white/20 rounded cursor-grab flex items-center gap-2.5 select-none hover:bg-white/15 ${snapshot.isDragging ? 'bg-white/25 border-white/40' : ''
                                                    }`}
                                                style={provided.draggableProps.style}
                                            >
                                                <span className="text-lg">{tool.icon}</span>
                                                <span>{tool.name}</span>
                                            </div>
                                            {snapshot.isDragging && (
                                                <div className="p-3 mb-2 bg-white/10 border border-white/20 border-dashed rounded flex items-center gap-2.5 opacity-40">
                                                    <span className="text-lg">{tool.icon}</span>
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
