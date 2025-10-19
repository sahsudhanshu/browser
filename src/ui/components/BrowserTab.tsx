import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrowserTabProps {
  id: string;
  title: string;
  favicon?: string;
  isActive: boolean;
  onClose: (id: string) => void;
  onClick: (id: string) => void;
}

export const BrowserTab: React.FC<BrowserTabProps> = ({
  id,
  title,
  favicon,
  isActive,
  onClose,
  onClick,
}) => {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  return (
    <div
      className={cn(
        "relative group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[240px] cursor-pointer transition-all duration-200",
        "border-r border-border/50",
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
      )}
      onClick={() => onClick(id)}
    >
      {favicon && (
        <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="flex-1 truncate text-sm">{title}</span>
      <button
        onClick={handleClose}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "hover:bg-destructive/20 rounded p-0.5",
          isActive && "opacity-50"
        )}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};