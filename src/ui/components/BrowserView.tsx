import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { Globe, Loader2 } from 'lucide-react';

interface BrowserViewProps {
  url: string;
  isLoading: boolean;
  onNavStateChange?: (state: { url: string; title?: string; favicon?: string; canGoBack: boolean; canGoForward: boolean }) => void;
}

export type BrowserViewHandle = {
  toggleDevTools: () => void;
  openDevTools: () => void;
  closeDevTools: () => void;
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
};

export const BrowserView = React.forwardRef<BrowserViewHandle, BrowserViewProps>(({ url, isLoading, onNavStateChange }, ref) => {
  const webviewRef = useRef<ElectronWebViewTag.WebviewTag | null>(null);

  useEffect(() => {
  const webview = webviewRef.current as any;

    if (!webview) return;

    const handleLoadStart = () => {
      console.log('Page loading started');
    };

    const handleLoadStop = () => {
      console.log('Page loaded');
      // Extract title and favicon after page loads
      notifyNavState();
    };

    const handleDidFailLoad = (event: any) => {
      // Ignore -3 (ERR_ABORTED) errors - these are often false positives from redirects
      if (event.errorCode === -3) {
        console.log('Navigation aborted (likely redirect or user action)');
        return;
      }
      
      // Only log actual errors
      if (event.errorCode && event.errorCode !== 0) {
        console.error('Failed to load:', {
          code: event.errorCode,
          description: event.errorDescription,
          url: event.validatedURL
        });
      }
    };

    const notifyNavState = () => {
      const w = webviewRef.current as any;
      if (w && onNavStateChange) {
        // Get title from webview
        const title = w.getTitle?.() || '';
        
        // Extract favicon - try to get from page
        let favicon = '';
        try {
          // Execute script to get favicon from page
          w.executeJavaScript(`
            (function() {
              const links = document.querySelectorAll('link[rel*="icon"]');
              for (let link of links) {
                if (link.href) return link.href;
              }
              return '';
            })();
          `).then((result: string) => {
            if (result && result.startsWith('http')) {
              favicon = result;
            } else if (result) {
              // Relative URL - construct absolute
              const currentUrl = w.getURL();
              try {
                const urlObj = new URL(currentUrl);
                favicon = new URL(result, urlObj.origin).href;
              } catch (e) {
                favicon = '';
              }
            }
            
            // If no favicon found, use default domain favicon
            if (!favicon) {
              try {
                const urlObj = new URL(w.getURL());
                favicon = `${urlObj.origin}/favicon.ico`;
              } catch (e) {
                favicon = '';
              }
            }
            
            // Update with favicon
            onNavStateChange({
              url: w.getURL?.() || w.getAttribute?.('src') || url,
              title: title || w.getURL?.()?.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
              favicon: favicon,
              canGoBack: w.canGoBack?.() ?? false,
              canGoForward: w.canGoForward?.() ?? false,
            });
          }).catch(() => {
            // Fallback without favicon
            onNavStateChange({
              url: w.getURL?.() || w.getAttribute?.('src') || url,
              title: title || w.getURL?.()?.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
              favicon: '',
              canGoBack: w.canGoBack?.() ?? false,
              canGoForward: w.canGoForward?.() ?? false,
            });
          });
        } catch (error) {
          // Immediate callback without favicon
          onNavStateChange({
            url: w.getURL?.() || w.getAttribute?.('src') || url,
            title: title || w.getURL?.()?.replace(/^https?:\/\//, '').split('/')[0] || 'New Page',
            favicon: '',
            canGoBack: w.canGoBack?.() ?? false,
            canGoForward: w.canGoForward?.() ?? false,
          });
        }
      }
    };

    // Add event listeners
    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('did-fail-load', handleDidFailLoad);
    webview.addEventListener('did-navigate', notifyNavState);
    webview.addEventListener('did-navigate-in-page', notifyNavState);

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
      webview.removeEventListener('did-navigate', notifyNavState);
      webview.removeEventListener('did-navigate-in-page', notifyNavState);
    };
  }, [onNavStateChange, url]);

  useImperativeHandle(ref, () => ({
    toggleDevTools: () => {
      const w = webviewRef.current as any;
      if (w?.isDevToolsOpened && w.openDevTools && w.closeDevTools) {
        if (w.isDevToolsOpened()) w.closeDevTools();
        else w.openDevTools();
      }
    },
    openDevTools: () => webviewRef.current?.openDevTools?.(),
    closeDevTools: () => webviewRef.current?.closeDevTools?.(),
    reload: () => webviewRef.current?.reload?.(),
    goBack: () => webviewRef.current?.goBack?.(),
    goForward: () => webviewRef.current?.goForward?.(),
  }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i'))) {
        e.preventDefault();
        const w = webviewRef.current as any;
        if (w?.isDevToolsOpened && w.openDevTools && w.closeDevTools) {
          if (w.isDevToolsOpened()) w.closeDevTools();
          else w.openDevTools();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full bg-background overflow-hidden" style={{height: '100%', width: '100%'}}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {url ? (
        <webview
          ref={webviewRef}
          src={url}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allowpopups={true}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
            <Globe className="w-24 h-24 text-primary/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Nova Browser</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Start browsing by entering a URL in the address bar or selecting a bookmark
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all duration-200 cursor-pointer">
                <h3 className="font-semibold text-sm mb-1">Quick Search</h3>
                <p className="text-xs text-muted-foreground">Press Ctrl+K</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all duration-200 cursor-pointer">
                <h3 className="font-semibold text-sm mb-1">New Tab</h3>
                <p className="text-xs text-muted-foreground">Press Ctrl+T</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all duration-200 cursor-pointer">
                <h3 className="font-semibold text-sm mb-1">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Press Ctrl+Space</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all duration-200 cursor-pointer">
                <h3 className="font-semibold text-sm mb-1">History</h3>
                <p className="text-xs text-muted-foreground">Press Ctrl+H</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});