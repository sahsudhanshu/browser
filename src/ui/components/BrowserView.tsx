import React from 'react';
import { Globe, Loader2 } from 'lucide-react';

interface BrowserViewProps {
  url: string;
  isLoading: boolean;
}

export const BrowserView: React.FC<BrowserViewProps> = ({ url, isLoading }) => {
  return (
    <div className="flex-1 relative bg-background overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      
      {url ? (
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Browser View"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
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
};