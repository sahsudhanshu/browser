import { useCallback, useEffect, useState } from 'react';
import type {
    HistoryEntry,
    Bookmark,
    BookmarkFolder,
    UserPreferences,
} from '@/types/electron';

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// History hooks
export function useHistory(limit = 100, offset = 0) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isElectron) return;
        setLoading(true);
        try {
            const data = await window.electronAPI.history.get(limit, offset);
            setHistory(data);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addVisit = useCallback(async (url: string, title: string, favicon?: string) => {
        if (!isElectron) return;
        await window.electronAPI.history.add(url, title, favicon);
        await refresh();
    }, [refresh]);

    const deleteEntry = useCallback(async (url: string) => {
        if (!isElectron) return;
        await window.electronAPI.history.delete(url);
        await refresh();
    }, [refresh]);

    const clearHistory = useCallback(async (olderThan?: number) => {
        if (!isElectron) return;
        await window.electronAPI.history.clear(olderThan);
        await refresh();
    }, [refresh]);

    return { history, loading, addVisit, deleteEntry, clearHistory, refresh };
}

export function useHistorySearch(query: string, limit = 50) {
    const [results, setResults] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isElectron || !query) {
            setResults([]);
            return;
        }

        setLoading(true);
        window.electronAPI.history.search(query, limit)
            .then(setResults)
            .finally(() => setLoading(false));
    }, [query, limit]);

    return { results, loading };
}

// Bookmarks hooks
export function useBookmarks(folderId?: number | null) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isElectron) return;
        setLoading(true);
        try {
            const data = await window.electronAPI.bookmarks.get(folderId);
            setBookmarks(data);
        } finally {
            setLoading(false);
        }
    }, [folderId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addBookmark = useCallback(async (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.add(bookmark);
        await refresh();
    }, [refresh]);

    const updateBookmark = useCallback(async (id: number, updates: Partial<Bookmark>) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.update(id, updates);
        await refresh();
    }, [refresh]);

    const deleteBookmark = useCallback(async (id: number) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.delete(id);
        await refresh();
    }, [refresh]);

    return { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark, refresh };
}

export function useBookmarkFolders(parentId?: number | null) {
    const [folders, setFolders] = useState<BookmarkFolder[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isElectron) return;
        setLoading(true);
        try {
            const data = await window.electronAPI.bookmarks.getFolders(parentId);
            setFolders(data);
        } finally {
            setLoading(false);
        }
    }, [parentId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addFolder = useCallback(async (folder: Omit<BookmarkFolder, 'id' | 'dateAdded'>) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.addFolder(folder);
        await refresh();
    }, [refresh]);

    const updateFolder = useCallback(async (id: number, updates: Partial<BookmarkFolder>) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.updateFolder(id, updates);
        await refresh();
    }, [refresh]);

    const deleteFolder = useCallback(async (id: number) => {
        if (!isElectron) return;
        await window.electronAPI.bookmarks.deleteFolder(id);
        await refresh();
    }, [refresh]);

    return { folders, loading, addFolder, updateFolder, deleteFolder, refresh };
}

// Preferences hook
export function usePreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isElectron) return;
        setLoading(true);
        try {
            const data = await window.electronAPI.preferences.getAll();
            setPreferences(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updatePref = useCallback(async <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        if (!isElectron) return;
        await window.electronAPI.preferences.set(key, value);
        await refresh();
    }, [refresh]);

    const updateAll = useCallback(async (updates: Partial<UserPreferences>) => {
        if (!isElectron) return;
        await window.electronAPI.preferences.setAll(updates);
        await refresh();
    }, [refresh]);

    const reset = useCallback(async () => {
        if (!isElectron) return;
        await window.electronAPI.preferences.reset();
        await refresh();
    }, [refresh]);

    return { preferences, loading, updatePref, updateAll, reset, refresh };
}

// Top visited sites
export function useTopVisited(limit = 10) {
    const [sites, setSites] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isElectron) return;

        setLoading(true);
        window.electronAPI.history.getTopVisited(limit)
            .then(setSites)
            .finally(() => setLoading(false));
    }, [limit]);

    return { sites, loading };
}

// Utility to add visit from anywhere
export async function trackVisit(url: string, title: string, favicon?: string) {
    if (!isElectron) return;
    await window.electronAPI.history.add(url, title, favicon);
}

// Utility to add bookmark from anywhere
export async function addBookmarkQuick(url: string, title: string, favicon?: string) {
    if (!isElectron) return;
    return await window.electronAPI.bookmarks.add({
        url,
        title,
        favicon,
        folderId: 1, // Bookmarks Bar
        position: 0,
    });
}
