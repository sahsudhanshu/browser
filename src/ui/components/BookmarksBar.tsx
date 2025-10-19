import React from 'react';
import { Globe, Github, Youtube, Twitter, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: React.ReactNode;
}

const defaultBookmarks: Bookmark[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', icon: <Github className="w-4 h-4" /> },
  { id: '2', title: 'YouTube', url: 'https://youtube.com', icon: <Youtube className="w-4 h-4" /> },
  { id: '3', title: 'Twitter', url: 'https://twitter.com', icon: <Twitter className="w-4 h-4" /> },
  { id: '4', title: 'Documentation', url: 'https://developer.mozilla.org', icon: <FileText className="w-4 h-4" /> },
  { id: '5', title: 'CodePen', url: 'https://codepen.io', icon: <Code className="w-4 h-4" /> },
];

interface BookmarksBarProps {
  onNavigate: (url: string) => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({ onNavigate }) => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-card/30 backdrop-blur-sm border-b border-border/30">
      {defaultBookmarks.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => onNavigate(bookmark.url)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md",
            "text-sm text-muted-foreground",
            "hover:bg-secondary/50 hover:text-foreground",
            "transition-all duration-200"
          )}
        >
          {bookmark.icon || <Globe className="w-4 h-4" />}
          <span>{bookmark.title}</span>
        </button>
      ))}
    </div>
  );
};