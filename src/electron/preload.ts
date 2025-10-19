import { contextBridge, ipcRenderer } from 'electron';
import type { HistoryEntry, SearchQuery } from './storage/HistoryManager.js';
import type { Bookmark, BookmarkFolder } from './storage/BookmarkManager.js';
import type { UserPreferences } from './storage/PreferencesManager.js';

// Expose protected methods that allow the renderer to use IPC
contextBridge.exposeInMainWorld('electronAPI', {
    // History API
    history: {
        add: (url: string, title: string, favicon?: string) =>
            ipcRenderer.invoke('history:add', url, title, favicon),
        get: (limit?: number, offset?: number): Promise<HistoryEntry[]> =>
            ipcRenderer.invoke('history:get', limit, offset),
        search: (query: string, limit?: number): Promise<HistoryEntry[]> =>
            ipcRenderer.invoke('history:search', query, limit),
        getByDate: (startDate: number, endDate: number): Promise<HistoryEntry[]> =>
            ipcRenderer.invoke('history:getByDate', startDate, endDate),
        delete: (url: string) =>
            ipcRenderer.invoke('history:delete', url),
        clear: (olderThan?: number) =>
            ipcRenderer.invoke('history:clear', olderThan),
        getTopVisited: (limit?: number): Promise<HistoryEntry[]> =>
            ipcRenderer.invoke('history:getTopVisited', limit),
        updateDuration: (url: string, duration: number) =>
            ipcRenderer.invoke('history:updateDuration', url, duration),
        addSearch: (query: string, resultUrl?: string) =>
            ipcRenderer.invoke('history:addSearch', query, resultUrl),
        getSearchHistory: (limit?: number): Promise<SearchQuery[]> =>
            ipcRenderer.invoke('history:getSearchHistory', limit),
    },

    // Bookmarks API
    bookmarks: {
        add: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>): Promise<number> =>
            ipcRenderer.invoke('bookmarks:add', bookmark),
        get: (folderId?: number | null): Promise<Bookmark[]> =>
            ipcRenderer.invoke('bookmarks:get', folderId),
        getAll: (): Promise<Bookmark[]> =>
            ipcRenderer.invoke('bookmarks:getAll'),
        search: (query: string): Promise<Bookmark[]> =>
            ipcRenderer.invoke('bookmarks:search', query),
        update: (id: number, updates: Partial<Bookmark>) =>
            ipcRenderer.invoke('bookmarks:update', id, updates),
        delete: (id: number) =>
            ipcRenderer.invoke('bookmarks:delete', id),
        move: (id: number, folderId: number | null, position: number) =>
            ipcRenderer.invoke('bookmarks:move', id, folderId, position),
        addFolder: (folder: Omit<BookmarkFolder, 'id' | 'dateAdded'>): Promise<number> =>
            ipcRenderer.invoke('bookmarks:addFolder', folder),
        getFolders: (parentId?: number | null): Promise<BookmarkFolder[]> =>
            ipcRenderer.invoke('bookmarks:getFolders', parentId),
        getAllFolders: (): Promise<BookmarkFolder[]> =>
            ipcRenderer.invoke('bookmarks:getAllFolders'),
        updateFolder: (id: number, updates: Partial<BookmarkFolder>) =>
            ipcRenderer.invoke('bookmarks:updateFolder', id, updates),
        deleteFolder: (id: number) =>
            ipcRenderer.invoke('bookmarks:deleteFolder', id),
        export: (): Promise<{ folders: BookmarkFolder[], bookmarks: Bookmark[] }> =>
            ipcRenderer.invoke('bookmarks:export'),
        import: (data: { folders?: BookmarkFolder[], bookmarks?: Bookmark[] }) =>
            ipcRenderer.invoke('bookmarks:import', data),
    },

    // Preferences API
    preferences: {
        get: <K extends keyof UserPreferences>(key: K): Promise<UserPreferences[K]> =>
            ipcRenderer.invoke('preferences:get', key),
        set: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) =>
            ipcRenderer.invoke('preferences:set', key, value),
        getAll: (): Promise<UserPreferences> =>
            ipcRenderer.invoke('preferences:getAll'),
        setAll: (preferences: Partial<UserPreferences>) =>
            ipcRenderer.invoke('preferences:setAll', preferences),
        reset: () =>
            ipcRenderer.invoke('preferences:reset'),
        export: (): Promise<UserPreferences> =>
            ipcRenderer.invoke('preferences:export'),
        import: (preferences: Partial<UserPreferences>) =>
            ipcRenderer.invoke('preferences:import', preferences),
    },
});
