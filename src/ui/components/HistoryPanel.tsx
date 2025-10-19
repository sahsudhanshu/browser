import React, { useEffect, useState } from 'react';
import { X, Clock, Search, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HistoryEntry } from '@/types/electron';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Keep legacy interface for compatibility
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
  onNavigate: (url: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load history from storage when panel opens
  useEffect(() => {
    if (!isOpen || !isElectron) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await window.electronAPI.history.get(100);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen]);

  // Search history
  useEffect(() => {
    if (!isElectron || !searchTerm) {
      return;
    }

    const searchHistory = async () => {
      setLoading(true);
      try {
        const results = await window.electronAPI.history.search(searchTerm, 50);
        setHistory(results);
      } catch (err) {
        console.error('Failed to search history:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchHistory, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleClearHistory = async () => {
    if (!isElectron) return;
    
    try {
      await window.electronAPI.history.clear();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleDeleteItem = async (url: string) => {
    if (!isElectron) return;
    
    try {
      await window.electronAPI.history.delete(url);
      setHistory(prev => prev.filter(item => item.url !== url));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };
  
  const filteredHistory = searchTerm ? history : history;

  const groupedHistory = filteredHistory.reduce((acc, item) => {
    const date = new Date(item.lastVisit).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryEntry[]>);

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
              onClick={handleClearHistory}
              className="hover:bg-destructive/20"
              title="Clear all history"
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
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading history...
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{date}</h4>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                      >
                        <button
                          onClick={() => onNavigate(item.url)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          {item.favicon ? (
                            <img src={item.favicon} alt="" className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded bg-muted" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                            <p className="text-xs text-muted-foreground">
                              Visited {item.visitCount} {item.visitCount === 1 ? 'time' : 'times'}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.url)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-destructive/20 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && !loading && (
                <p className="text-center text-muted-foreground text-sm">No history found</p>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};