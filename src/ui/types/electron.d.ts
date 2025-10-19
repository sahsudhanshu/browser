// Type definitions for the Electron API exposed via contextBridge

export interface HistoryEntry {
    id?: number;
    url: string;
    title: string;
    visitCount: number;
    lastVisit: number;
    favicon?: string;
    duration?: number;
}

export interface SearchQuery {
    id?: number;
    query: string;
    timestamp: number;
    resultUrl?: string;
}

export interface Bookmark {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
    folderId: number | null;
    position: number;
    dateAdded: number;
    tags?: string;
}

export interface BookmarkFolder {
    id?: number;
    name: string;
    parentId: number | null;
    position: number;
    dateAdded: number;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    zoomLevel: number;
    defaultSearchEngine: string;
    homePage: string;
    showBookmarksBar: boolean;
    openNewTabsInBackground: boolean;
    clearHistoryOnExit: boolean;
    clearCookiesOnExit: boolean;
    doNotTrack: boolean;
    downloadPath: string;
    askDownloadLocation: boolean;
    hardwareAcceleration: boolean;
    autoplayMedia: boolean;
    blockPopups: boolean;
    perplexityApiKey?: string;
    aiModel: string;
}

export interface ElectronAPI {
    history: {
        add: (url: string, title: string, favicon?: string) => Promise<void>;
        get: (limit?: number, offset?: number) => Promise<HistoryEntry[]>;
        search: (query: string, limit?: number) => Promise<HistoryEntry[]>;
        getByDate: (startDate: number, endDate: number) => Promise<HistoryEntry[]>;
        delete: (url: string) => Promise<void>;
        clear: (olderThan?: number) => Promise<void>;
        getTopVisited: (limit?: number) => Promise<HistoryEntry[]>;
        updateDuration: (url: string, duration: number) => Promise<void>;
        addSearch: (query: string, resultUrl?: string) => Promise<void>;
        getSearchHistory: (limit?: number) => Promise<SearchQuery[]>;
    };

    bookmarks: {
        add: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => Promise<number>;
        get: (folderId?: number | null) => Promise<Bookmark[]>;
        getAll: () => Promise<Bookmark[]>;
        search: (query: string) => Promise<Bookmark[]>;
        update: (id: number, updates: Partial<Bookmark>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        move: (id: number, folderId: number | null, position: number) => Promise<void>;
        addFolder: (folder: Omit<BookmarkFolder, 'id' | 'dateAdded'>) => Promise<number>;
        getFolders: (parentId?: number | null) => Promise<BookmarkFolder[]>;
        getAllFolders: () => Promise<BookmarkFolder[]>;
        updateFolder: (id: number, updates: Partial<BookmarkFolder>) => Promise<void>;
        deleteFolder: (id: number) => Promise<void>;
        export: () => Promise<{ folders: BookmarkFolder[], bookmarks: Bookmark[] }>;
        import: (data: { folders?: BookmarkFolder[], bookmarks?: Bookmark[] }) => Promise<void>;
    };

    preferences: {
        get: <K extends keyof UserPreferences>(key: K) => Promise<UserPreferences[K]>;
        set: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
        getAll: () => Promise<UserPreferences>;
        setAll: (preferences: Partial<UserPreferences>) => Promise<void>;
        reset: () => Promise<void>;
        export: () => Promise<UserPreferences>;
        import: (preferences: Partial<UserPreferences>) => Promise<void>;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export {};
