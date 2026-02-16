import React from 'react';

interface KanbanItemProps {
    item: any;
    dataFieldToMatchBuckets: string;
    isDraggable: boolean;
    setDraggedItem: (item: any) => void;
    draggedItem: any | null;
    draggedOver: any | null;
    setDragOverIndex: (index: number | null) => void;
    setCssFordraggedItem: (css: string) => void;
    cssFordraggedItem: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const KanbanItem: React.FC<KanbanItemProps> = ({
    item,
    dataFieldToMatchBuckets,
    isDraggable,
    setDraggedItem,
    draggedItem,
    draggedOver,
    setDragOverIndex,
    setCssFordraggedItem,
    cssFordraggedItem,
    children,
    onClick,
}) => {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        setDraggedItem(item);
        setCssFordraggedItem('text-[#F2F4F7] bg-[#F2F4F7] !border-[#F2F4F7]');
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const status = item?.[dataFieldToMatchBuckets];
        if (draggedOver !== status) {
            setDragOverIndex(item?._id || item?.id);
        }
    };

    const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
        setDraggedItem(null);
        setCssFordraggedItem('');
        setDragOverIndex(null);
    };

    const isDraggedItem = draggedItem && (draggedItem._id === item._id || draggedItem.id === item.id);

    return (
        <div
            onClick={onClick}
            onDragOver={onDragOver}
            className={`mb-4 ${isDraggedItem ? 'opacity-50' : ''
                }`}
        >
            <div
                draggable={isDraggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                className={`card shadow-none !border border-[#E4E7EC] rounded-[12px] cursor-pointer flex gap-0 transition-all duration-200 hover:shadow-md ${cssFordraggedItem && isDraggedItem ? cssFordraggedItem : ''
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

export default KanbanItem;