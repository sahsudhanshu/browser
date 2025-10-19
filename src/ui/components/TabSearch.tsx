import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface TabSearchProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  onSelectTab: (id: string) => void;
}

export const TabSearch: React.FC<TabSearchProps> = ({
  isOpen,
  onClose,
  tabs,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredTabs = tabs.filter(tab =>
    tab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelectTab(id);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/50">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tabs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50"
              autoFocus
            />
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
              >
                {tab.favicon ? (
                  <img src={tab.favicon} alt="" className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5 rounded bg-muted" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{tab.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
                </div>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                  Switch to tab
                </div>
              </button>
            ))}
            
            {filteredTabs.length === 0 && (
              <p className="text-center py-4 text-muted-foreground text-sm">
                No tabs found matching "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};