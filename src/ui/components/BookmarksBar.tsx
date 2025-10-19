import React, { useEffect, useState } from 'react';
import { Globe, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Bookmark } from '@/types/electron';

interface BookmarksBarProps {
  onNavigate: (url: string) => void;
  refreshKey?: number;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({ onNavigate, refreshKey }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [refreshKey]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      // Load bookmarks from "Bookmarks Bar" folder (folderId: 1)
      if (window.electronAPI?.bookmarks) {
        const barBookmarks = await window.electronAPI.bookmarks.get(1);
        setBookmarks(barBookmarks);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-4 py-2 bg-card/30 backdrop-blur-sm border-b border-border/30">
        <span className="text-sm text-muted-foreground">Loading bookmarks...</span>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex items-center gap-1 px-4 py-2 bg-card/30 backdrop-blur-sm border-b border-border/30">
        <span className="text-sm text-muted-foreground flex items-center gap-2">
          <Star className="w-4 h-4" />
          No bookmarks yet - Add some from the menu!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-card/30 backdrop-blur-sm border-b border-border/30 overflow-x-auto">
      {bookmarks.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => onNavigate(bookmark.url)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md flex-shrink-0",
            "text-sm text-muted-foreground",
            "hover:bg-secondary/50 hover:text-foreground",
            "transition-all duration-200"
          )}
          title={bookmark.url}
        >
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="w-4 h-4" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="max-w-[150px] truncate">{bookmark.title}</span>
        </button>
      ))}
    </div>
  );
};