import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { HistoryManager, HistoryEntry, SearchQuery } from './HistoryManager.js';
import { BookmarkManager, Bookmark, BookmarkFolder } from './BookmarkManager.js';
import { PreferencesManager, UserPreferences } from './PreferencesManager.js';

export class StorageIPCHandler {
    private historyManager: HistoryManager;
    private bookmarkManager: BookmarkManager;
    private preferencesManager: PreferencesManager;

    constructor() {
        this.historyManager = new HistoryManager();
        this.bookmarkManager = new BookmarkManager();
        this.preferencesManager = new PreferencesManager();
        
        this.registerHandlers();
    }

    private registerHandlers() {
        // History handlers
        ipcMain.handle('history:add', (_event: IpcMainInvokeEvent, url: string, title: string, favicon?: string) => {
            this.historyManager.addVisit(url, title, favicon);
        });

        ipcMain.handle('history:get', (_event: IpcMainInvokeEvent, limit?: number, offset?: number) => {
            return this.historyManager.getHistory(limit, offset);
        });

        ipcMain.handle('history:search', (_event: IpcMainInvokeEvent, query: string, limit?: number) => {
            return this.historyManager.searchHistory(query, limit);
        });

        ipcMain.handle('history:getByDate', (_event: IpcMainInvokeEvent, startDate: number, endDate: number) => {
            return this.historyManager.getHistoryByDate(startDate, endDate);
        });

        ipcMain.handle('history:delete', (_event: IpcMainInvokeEvent, url: string) => {
            this.historyManager.deleteHistory(url);
        });

        ipcMain.handle('history:clear', (_event: IpcMainInvokeEvent, olderThan?: number) => {
            this.historyManager.clearHistory(olderThan);
        });

        ipcMain.handle('history:getTopVisited', (_event: IpcMainInvokeEvent, limit?: number) => {
            return this.historyManager.getTopVisited(limit);
        });

        ipcMain.handle('history:updateDuration', (_event: IpcMainInvokeEvent, url: string, duration: number) => {
            this.historyManager.updateDuration(url, duration);
        });

        ipcMain.handle('history:addSearch', (_event: IpcMainInvokeEvent, query: string, resultUrl?: string) => {
            this.historyManager.addSearchQuery(query, resultUrl);
        });

        ipcMain.handle('history:getSearchHistory', (_event: IpcMainInvokeEvent, limit?: number) => {
            return this.historyManager.getSearchHistory(limit);
        });

        // Bookmark handlers
        ipcMain.handle('bookmarks:add', (_event: IpcMainInvokeEvent, bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => {
            return this.bookmarkManager.addBookmark(bookmark);
        });

        ipcMain.handle('bookmarks:get', (_event: IpcMainInvokeEvent, folderId?: number | null) => {
            return this.bookmarkManager.getBookmarks(folderId);
        });

        ipcMain.handle('bookmarks:getAll', () => {
            return this.bookmarkManager.getAllBookmarks();
        });

        ipcMain.handle('bookmarks:search', (_event: IpcMainInvokeEvent, query: string) => {
            return this.bookmarkManager.searchBookmarks(query);
        });

        ipcMain.handle('bookmarks:update', (_event: IpcMainInvokeEvent, id: number, updates: Partial<Bookmark>) => {
            this.bookmarkManager.updateBookmark(id, updates);
        });

        ipcMain.handle('bookmarks:delete', (_event: IpcMainInvokeEvent, id: number) => {
            this.bookmarkManager.deleteBookmark(id);
        });

        ipcMain.handle('bookmarks:move', (_event: IpcMainInvokeEvent, id: number, folderId: number | null, position: number) => {
            this.bookmarkManager.moveBookmark(id, folderId, position);
        });

        // Folder handlers
        ipcMain.handle('bookmarks:addFolder', (_event: IpcMainInvokeEvent, folder: Omit<BookmarkFolder, 'id' | 'dateAdded'>) => {
            return this.bookmarkManager.addFolder(folder);
        });

        ipcMain.handle('bookmarks:getFolders', (_event: IpcMainInvokeEvent, parentId?: number | null) => {
            return this.bookmarkManager.getFolders(parentId);
        });

        ipcMain.handle('bookmarks:getAllFolders', () => {
            return this.bookmarkManager.getAllFolders();
        });

        ipcMain.handle('bookmarks:updateFolder', (_event: IpcMainInvokeEvent, id: number, updates: Partial<BookmarkFolder>) => {
            this.bookmarkManager.updateFolder(id, updates);
        });

        ipcMain.handle('bookmarks:deleteFolder', (_event: IpcMainInvokeEvent, id: number) => {
            this.bookmarkManager.deleteFolder(id);
        });

        ipcMain.handle('bookmarks:export', () => {
            return this.bookmarkManager.exportBookmarks();
        });

        ipcMain.handle('bookmarks:import', (_event: IpcMainInvokeEvent, data: { folders?: BookmarkFolder[], bookmarks?: Bookmark[] }) => {
            this.bookmarkManager.importBookmarks(data);
        });

        // Preferences handlers
        ipcMain.handle('preferences:get', (_event: IpcMainInvokeEvent, key: keyof UserPreferences) => {
            return this.preferencesManager.get(key);
        });

        ipcMain.handle('preferences:set', (_event: IpcMainInvokeEvent, key: keyof UserPreferences, value: any) => {
            this.preferencesManager.set(key, value);
        });

        ipcMain.handle('preferences:getAll', () => {
            return this.preferencesManager.getAll();
        });

        ipcMain.handle('preferences:setAll', (_event: IpcMainInvokeEvent, preferences: Partial<UserPreferences>) => {
            this.preferencesManager.setAll(preferences);
        });

        ipcMain.handle('preferences:reset', () => {
            this.preferencesManager.reset();
        });

        ipcMain.handle('preferences:export', () => {
            return this.preferencesManager.export();
        });

        ipcMain.handle('preferences:import', (_event: IpcMainInvokeEvent, preferences: Partial<UserPreferences>) => {
            this.preferencesManager.import(preferences);
        });
    }

    cleanup() {
        this.historyManager.close();
        this.bookmarkManager.close();
    }
}
