import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDelete,
  children
}) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div className="pl-8">
        {children}
      </div>
      <button
        onClick={() => onDelete(id)}
        className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
