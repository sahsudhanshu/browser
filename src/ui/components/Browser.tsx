import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles, Menu, Settings, Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrowserTab } from './BrowserTab';
import { NavigationBar } from './NavigationBar';
import { BookmarksBar } from './BookmarksBar';
import { BrowserView } from './BrowserView';
import { AIAssistant } from './AIAssistant';
import { HistoryPanel } from './HistoryPanel';
import { DownloadsPanel } from './DownloadsPanel';
import { TabSearch } from './TabSearch';
import type { HistoryItem } from './HistoryPanel';
import type { DownloadItem } from './DownloadsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
}

export const Browser: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: '', history: [], historyIndex: -1 }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isTabSearchOpen, setIsTabSearchOpen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // History and Downloads state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

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
        return [{ id: Date.now().toString(), title: 'New Tab', url: '', history: [], historyIndex: -1 }];
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
    
    // Simulate loading and add to history
    setTimeout(() => {
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        title: url.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
        url,
        timestamp: new Date(),
      };
      
      setHistory(prev => [historyItem, ...prev]);
      
      setTabs(prev => prev.map(tab => {
        if (tab.id === activeTabId) {
          const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), url];
          return {
            ...tab,
            url,
            title: historyItem.title,
            history: newHistory,
            historyIndex: newHistory.length - 1
          };
        }
        return tab;
      }));
      setIsLoading(false);
    }, 1000);
  }, [activeTab, activeTabId]);

  const handleGoBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    
    const newIndex = activeTab.historyIndex - 1;
    const newUrl = activeTab.history[newIndex];
    
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, url: newUrl, historyIndex: newIndex };
      }
      return tab;
    }));
  }, [activeTab, activeTabId]);

  const handleGoForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    
    const newIndex = activeTab.historyIndex + 1;
    const newUrl = activeTab.history[newIndex];
    
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, url: newUrl, historyIndex: newIndex };
      }
      return tab;
    }));
  }, [activeTab, activeTabId]);

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

  // Download handlers
  const handleToggleHistory = () => setIsHistoryOpen(prev => !prev);
  const handleToggleDownloads = () => setIsDownloadsOpen(prev => !prev);

  const handleClearHistory = () => setHistory([]);

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
        canGoBack={!!activeTab && activeTab.historyIndex > 0}
        canGoForward={!!activeTab && activeTab.historyIndex < activeTab.history.length - 1}
        isLoading={isLoading}
        onBack={handleGoBack}
        onForward={handleGoForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
        onNavigate={handleNavigate}
      />

      {/* Bookmarks Bar */}
      {showBookmarks && <BookmarksBar onNavigate={handleNavigate} />}

      {/* Browser View */}
      <BrowserView url={activeTab?.url || ''} isLoading={isLoading} />

      {/* AI Assistant */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onNavigate={(url) => {
          setIsHistoryOpen(false);
          handleNavigate(url);
        }}
        onClearHistory={handleClearHistory}
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