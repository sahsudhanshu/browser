import React from 'react';
import { X, Download, File, Pause, Play, Trash2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  progress: number;
  status: 'downloading' | 'paused' | 'completed' | 'failed';
  timestamp: Date;
}

interface DownloadsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
  onPauseResume: (id: string) => void;
  onCancel: (id: string) => void;
  onOpenFile: (id: string) => void;
  onClearCompleted: () => void;
}

export const DownloadsPanel: React.FC<DownloadsPanelProps> = ({
  isOpen,
  onClose,
  downloads,
  onPauseResume,
  onCancel,
  onOpenFile,
  onClearCompleted,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return <Pause className="w-4 h-4" />;
      case 'paused':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[400px] bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-40",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Downloads</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="text-xs"
            >
              Clear completed
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

        {/* Downloads List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <File className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{download.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(download.size * (download.progress / 100))} / {formatSize(download.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {download.status === 'completed' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenFile(download.id)}
                        className="h-8 w-8"
                      >
                        {getStatusIcon(download.status)}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPauseResume(download.id)}
                        className="h-8 w-8"
                      >
                        {getStatusIcon(download.status)}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCancel(download.id)}
                      className="h-8 w-8 hover:bg-destructive/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {download.status !== 'completed' && (
                  <Progress 
                    value={download.progress} 
                    className="h-1.5"
                  />
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className={cn(
                    "text-xs capitalize",
                    download.status === 'completed' && "text-green-500",
                    download.status === 'failed' && "text-destructive",
                    download.status === 'downloading' && "text-primary",
                    download.status === 'paused' && "text-yellow-500"
                  )}>
                    {download.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(download.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {downloads.length === 0 && (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No downloads yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};