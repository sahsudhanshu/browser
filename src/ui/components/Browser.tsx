import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Sparkles, Menu, Settings, Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrowserTab } from './BrowserTab';
import { NavigationBar } from './NavigationBar';
import { BookmarksBar } from './BookmarksBar';
import { BrowserView, type BrowserViewHandle } from './BrowserView';
import { AIAssistant } from './AIAssistant';
import { HistoryPanel } from './HistoryPanel';
import { DownloadsPanel } from './DownloadsPanel';
import { TabSearch } from './TabSearch';
import type { DownloadItem } from './DownloadsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  history: string[]; // kept for future, not used for webview nav
  historyIndex: number; // kept for future, not used for webview nav
}

export const Browser: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: '', favicon: '', history: [], historyIndex: -1 }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isTabSearchOpen, setIsTabSearchOpen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Downloads state (history now managed by HistoryPanel)
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const webviewHandleRef = useRef<BrowserViewHandle | null>(null);
  const [navStateByTab, setNavStateByTab] = useState<Record<string, { url: string; canGoBack: boolean; canGoForward: boolean }>>({});
  const [bookmarksRefreshKey, setBookmarksRefreshKey] = useState(0);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault();
            handleNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (tabs.length > 1 && activeTabId) {
              handleCloseTab(activeTabId);
            }
            break;
          case ' ':
            e.preventDefault();
            setIsAIOpen(prev => !prev);
            break;
          case 'k':
            e.preventDefault();
            setIsTabSearchOpen(true);
            break;
          case 'b':
            e.preventDefault();
            setShowBookmarks(prev => !prev);
            break;
          case 'r':
            e.preventDefault();
            handleRefresh();
            break;
          case 'h':
            e.preventDefault();
            setIsHistoryOpen(prev => !prev);
            break;
          case 'd':
            e.preventDefault();
            setIsDownloadsOpen(prev => !prev);
            break;
        }
      }
      
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleGoBack();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleGoForward();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tabs, activeTabId]);

  const handleNewTab = useCallback(() => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: '',
      favicon: '',
      history: [],
      historyIndex: -1
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== id);
      if (newTabs.length === 0) {
        return [{ id: Date.now().toString(), title: 'New Tab', url: '', favicon: '', history: [], historyIndex: -1 }];
      }
      return newTabs;
    });
    
    if (id === activeTabId) {
      const currentIndex = tabs.findIndex(tab => tab.id === id);
      const newActiveTab = tabs[currentIndex - 1] || tabs[currentIndex + 1];
      if (newActiveTab) {
        setActiveTabId(newActiveTab.id);
      }
    }
  }, [activeTabId, tabs]);

  const handleNavigate = useCallback((url: string) => {
    if (!activeTab) return;
    
    setIsLoading(true);
    
    // Just update the tab URL - the webview will handle navigation
    // and we'll track the visit in onNavStateChange
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), url];
        return {
          ...tab,
          url,
          title: url.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return tab;
    }));
    
    setTimeout(() => setIsLoading(false), 1000);
  }, [activeTab, activeTabId]);

  const handleGoBack = useCallback(() => {
    webviewHandleRef.current?.goBack();
  }, []);

  const handleGoForward = useCallback(() => {
    webviewHandleRef.current?.goForward();
  }, []);

  const handleRefresh = useCallback(() => {
    if (!activeTab?.url) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [activeTab]);

  const handleHome = useCallback(() => {
    if (!activeTab) return;
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, url: '', title: 'New Tab' };
      }
      return tab;
    }));
  }, [activeTab, activeTabId]);

  // DevTools toggle for current webview
  const handleToggleDevTools = useCallback(() => {
    webviewHandleRef.current?.toggleDevTools();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        webviewHandleRef.current?.toggleDevTools();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Download handlers
  const handleToggleHistory = () => setIsHistoryOpen(prev => !prev);
  const handleToggleDownloads = () => setIsDownloadsOpen(prev => !prev);

  const handlePauseResumeDownload = (id: string) => {
    setDownloads(prev =>
      prev.map(download =>
        download.id === id
          ? {
              ...download,
              status: download.status === 'paused' ? 'downloading' : 'paused',
            }
          : download,
      ),
    );
  };

  const handleCancelDownload = (id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  };

  const handleOpenDownload = (id: string) => {
    const download = downloads.find(item => item.id === id);
    if (download) {
      // Placeholder action: update timestamp to reflect interaction.
      setDownloads(prev =>
        prev.map(item =>
          item.id === id ? { ...item, timestamp: new Date() } : item,
        ),
      );
    }
  };

  const handleClearCompletedDownloads = () => {
    setDownloads(prev => prev.filter(download => download.status !== 'completed'));
  };

  // Callback to trigger BookmarksBar reload
  const handleBookmarkAdded = useCallback(() => {
    setBookmarksRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Tab Bar */}
      <div className="flex items-center bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin">
          {tabs.map(tab => (
            <BrowserTab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              favicon={tab.favicon}
              isActive={tab.id === activeTabId}
              onClose={handleCloseTab}
              onClick={setActiveTabId}
            />
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewTab}
            className="mx-2 hover:bg-secondary/80"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAIOpen(!isAIOpen)}
            className={cn(
              "hover:bg-primary/20 transition-all duration-200",
              isAIOpen && "bg-primary/20 text-primary"
            )}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={handleToggleHistory}>
                <History className="w-4 h-4 mr-2" />
                History
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleToggleDownloads}>
                <Download className="w-4 h-4 mr-2" />
                Downloads
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar
        currentUrl={activeTab?.url || ''}
        currentTitle={activeTab?.title || ''}
        currentFavicon={activeTab?.favicon || ''}
        canGoBack={!!activeTab && (navStateByTab[activeTabId]?.canGoBack ?? false)}
        canGoForward={!!activeTab && (navStateByTab[activeTabId]?.canGoForward ?? false)}
        isLoading={isLoading}
        onBack={handleGoBack}
        onForward={handleGoForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
        onNavigate={handleNavigate}
        onToggleDevTools={handleToggleDevTools}
        onBookmarkAdded={handleBookmarkAdded}
      />

      {/* Bookmarks Bar */}
      {showBookmarks && <BookmarksBar onNavigate={handleNavigate} refreshKey={bookmarksRefreshKey} />}

      {/* Browser Views - keep all webviews mounted, only show active */}
  <div className="relative flex-1 h-0 min-h-0" style={{height: '100%'}}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={{ display: tab.id === activeTabId ? 'block' : 'none', height: '100%', width: '100%' }}
            className="absolute inset-0 h-full w-full"
          >
            <BrowserView
              ref={tab.id === activeTabId ? webviewHandleRef : undefined}
              url={tab.url}
              isLoading={isLoading && tab.id === activeTabId}
              onNavStateChange={async (state) => {
                if (tab.id === activeTabId) {
                  setNavStateByTab((prev) => ({ ...prev, [activeTabId]: state }));
                  setTabs((prev) => prev.map(t => (
                    t.id === activeTabId
                      ? { 
                          ...t, 
                          url: state.url, 
                          title: state.title || state.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
                          favicon: state.favicon || t.favicon
                        }
                      : t
                  )));
                  if (isElectron && state.url && state.url.startsWith('http')) {
                    try {
                      await window.electronAPI.history.add(
                        state.url,
                        state.title || state.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
                        state.favicon
                      );
                    } catch (err) {
                      console.error('Failed to save history:', err);
                    }
                  }
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* AI Assistant */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onNavigate={(url) => {
          setIsHistoryOpen(false);
          handleNavigate(url);
        }}
      />

      <DownloadsPanel
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onPauseResume={handlePauseResumeDownload}
        onCancel={handleCancelDownload}
        onOpenFile={handleOpenDownload}
        onClearCompleted={handleClearCompletedDownloads}
      />

      <TabSearch
        isOpen={isTabSearchOpen}
        onClose={() => setIsTabSearchOpen(false)}
        tabs={tabs}
        onSelectTab={(id) => {
          setActiveTabId(id);
          setIsTabSearchOpen(false);
        }}
      />

      {/* Keyboard Shortcuts Info */}
      <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded">T</kbd> New Tab
        </p>
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded">Space</kbd> AI Assistant
        </p>
      </div>
    </div>
  );
};