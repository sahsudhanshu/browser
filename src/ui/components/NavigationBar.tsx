import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Bookmark, Shield, Star, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavigationBarProps {
  currentUrl: string;
  currentTitle?: string;
  currentFavicon?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onNavigate: (url: string) => void;
  onToggleDevTools?: () => void;
  onBookmarkAdded?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentUrl,
  currentTitle,
  currentFavicon,
  canGoBack,
  canGoForward,
  isLoading,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onNavigate,
  onToggleDevTools,
  onBookmarkAdded,
}) => {
  const [inputValue, setInputValue] = React.useState(currentUrl);
  const [isFocused, setIsFocused] = React.useState(false);
  const [bookmarkLoading, setBookmarkLoading] = React.useState(false);

  React.useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = inputValue.trim();
    if (url) {
      const formattedUrl = url.includes('://') ? url : `https://${url}`;
      onNavigate(formattedUrl);
    }
  };

  const handleAddBookmark = async () => {
    if (!currentUrl || !currentUrl.startsWith('http')) {
      console.log('Cannot bookmark: invalid URL', currentUrl);
      return;
    }
    
    if (!window.electronAPI?.bookmarks) {
      console.error('Electron API not available');
      return;
    }
    
    setBookmarkLoading(true);
    try {
      const title = currentTitle || currentUrl.replace(/^https?:\/\//, '').split('/')[0] || currentUrl;
      console.log('Adding bookmark:', { title, url: currentUrl, favicon: currentFavicon });
      
      await window.electronAPI.bookmarks.add({
        title,
        url: currentUrl,
        favicon: currentFavicon || '',
        folderId: 1, // Bookmarks Bar
        position: 0
      });
      
      console.log('Bookmark added successfully');
      if (onBookmarkAdded) onBookmarkAdded();
    } catch (err) {
      console.error('Failed to add bookmark:', err);
      alert('Failed to add bookmark. Check console for details.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className="hover:bg-secondary/80 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onForward}
          disabled={!canGoForward}
          className="hover:bg-secondary/80 transition-all duration-200"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className={cn(
            "hover:bg-secondary/80 transition-all duration-200",
            isLoading && "animate-spin"
          )}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHome}
          className="hover:bg-secondary/80 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <div
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border transition-all duration-200",
            isFocused
              ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]"
              : "border-border/50"
          )}
        >
          <Shield className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search or enter URL"
            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          />
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </form>

      <div className="flex items-center gap-1">
        {onToggleDevTools && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDevTools}
            title="Toggle DevTools (F12)"
            className="hover:bg-secondary/80 transition-all duration-200"
          >
            <Bug className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary/80 transition-all duration-200"
          onClick={handleAddBookmark}
          disabled={bookmarkLoading || !currentUrl}
          title="Add to Bookmarks"
        >
          <Star className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary/80 transition-all duration-200"
        >
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};