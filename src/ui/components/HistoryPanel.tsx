import React from 'react';
import { X, Clock, Search, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
  favicon?: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onNavigate,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedHistory = filteredHistory.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full w-[350px] bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl z-40",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">History</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearHistory}
              className="hover:bg-destructive/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* History Items */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{date}</h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.url)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                    >
                      {item.favicon ? (
                        <img src={item.favicon} alt="" className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded bg-muted" />
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">No history found</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};