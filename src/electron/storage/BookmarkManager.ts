import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface Bookmark {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
    folderId: number | null; // null = root
    position: number;
    dateAdded: number;
    tags?: string;
}

export interface BookmarkFolder {
    id?: number;
    name: string;
    parentId: number | null; // null = root
    position: number;
    dateAdded: number;
}

export class BookmarkManager {
    private db: Database.Database;

    constructor(userDataPath?: string) {
        const dbPath = path.join(
            userDataPath || app.getPath('userData'),
            'bookmarks.db'
        );
        
        this.db = new Database(dbPath);
        this.initializeDatabase();
    }

    private initializeDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS bookmark_folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parentId INTEGER,
                position INTEGER NOT NULL DEFAULT 0,
                dateAdded INTEGER NOT NULL,
                FOREIGN KEY(parentId) REFERENCES bookmark_folders(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS bookmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                favicon TEXT,
                folderId INTEGER,
                position INTEGER NOT NULL DEFAULT 0,
                dateAdded INTEGER NOT NULL,
                tags TEXT,
                FOREIGN KEY(folderId) REFERENCES bookmark_folders(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_bookmark_folder ON bookmarks(folderId);
            CREATE INDEX IF NOT EXISTS idx_bookmark_url ON bookmarks(url);
            CREATE INDEX IF NOT EXISTS idx_folder_parent ON bookmark_folders(parentId);

            -- Create default folders if they don't exist
            INSERT OR IGNORE INTO bookmark_folders (id, name, parentId, position, dateAdded)
            VALUES 
                (1, 'Bookmarks Bar', NULL, 0, ${Date.now()}),
                (2, 'Other Bookmarks', NULL, 1, ${Date.now()});
        `);
    }

    addBookmark(bookmark: Omit<Bookmark, 'id' | 'dateAdded'>): number {
        const stmt = this.db.prepare(`
            INSERT INTO bookmarks (title, url, favicon, folderId, position, dateAdded, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            bookmark.title,
            bookmark.url,
            bookmark.favicon || null,
            bookmark.folderId,
            bookmark.position,
            Date.now(),
            bookmark.tags || null
        );

        return result.lastInsertRowid as number;
    }

    getBookmarks(folderId: number | null = null): Bookmark[] {
        const stmt = this.db.prepare(`
            SELECT * FROM bookmarks
            WHERE folderId IS ? OR folderId = ?
            ORDER BY position ASC
        `);

        return stmt.all(folderId, folderId) as Bookmark[];
    }

    getAllBookmarks(): Bookmark[] {
        const stmt = this.db.prepare('SELECT * FROM bookmarks ORDER BY dateAdded DESC');
        return stmt.all() as Bookmark[];
    }

    searchBookmarks(query: string): Bookmark[] {
        const stmt = this.db.prepare(`
            SELECT * FROM bookmarks
            WHERE title LIKE ? OR url LIKE ? OR tags LIKE ?
            ORDER BY dateAdded DESC
        `);

        const searchPattern = `%${query}%`;
        return stmt.all(searchPattern, searchPattern, searchPattern) as Bookmark[];
    }

    updateBookmark(id: number, updates: Partial<Bookmark>): void {
        const fields = Object.keys(updates)
            .filter(k => k !== 'id' && k !== 'dateAdded')
            .map(k => `${k} = ?`)
            .join(', ');

        if (!fields) return;

        const values = Object.entries(updates)
            .filter(([k]) => k !== 'id' && k !== 'dateAdded')
            .map(([, v]) => v);

        const stmt = this.db.prepare(`UPDATE bookmarks SET ${fields} WHERE id = ?`);
        stmt.run(...values, id);
    }

    deleteBookmark(id: number): void {
        const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
        stmt.run(id);
    }

    addFolder(folder: Omit<BookmarkFolder, 'id' | 'dateAdded'>): number {
        const stmt = this.db.prepare(`
            INSERT INTO bookmark_folders (name, parentId, position, dateAdded)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(
            folder.name,
            folder.parentId,
            folder.position,
            Date.now()
        );

        return result.lastInsertRowid as number;
    }

    getFolders(parentId: number | null = null): BookmarkFolder[] {
        const stmt = this.db.prepare(`
            SELECT * FROM bookmark_folders
            WHERE parentId IS ? OR parentId = ?
            ORDER BY position ASC
        `);

        return stmt.all(parentId, parentId) as BookmarkFolder[];
    }

    getAllFolders(): BookmarkFolder[] {
        const stmt = this.db.prepare('SELECT * FROM bookmark_folders ORDER BY position ASC');
        return stmt.all() as BookmarkFolder[];
    }

    updateFolder(id: number, updates: Partial<BookmarkFolder>): void {
        const fields = Object.keys(updates)
            .filter(k => k !== 'id' && k !== 'dateAdded')
            .map(k => `${k} = ?`)
            .join(', ');

        if (!fields) return;

        const values = Object.entries(updates)
            .filter(([k]) => k !== 'id' && k !== 'dateAdded')
            .map(([, v]) => v);

        const stmt = this.db.prepare(`UPDATE bookmark_folders SET ${fields} WHERE id = ?`);
        stmt.run(...values, id);
    }

    deleteFolder(id: number): void {
        // Cascade delete handled by foreign key
        const stmt = this.db.prepare('DELETE FROM bookmark_folders WHERE id = ?');
        stmt.run(id);
    }

    moveBookmark(id: number, newFolderId: number | null, newPosition: number): void {
        const stmt = this.db.prepare(`
            UPDATE bookmarks
            SET folderId = ?, position = ?
            WHERE id = ?
        `);

        stmt.run(newFolderId, newPosition, id);
    }

    exportBookmarks(): { folders: BookmarkFolder[], bookmarks: Bookmark[] } {
        return {
            folders: this.getAllFolders(),
            bookmarks: this.getAllBookmarks()
        };
    }

    importBookmarks(data: { folders?: BookmarkFolder[], bookmarks?: Bookmark[] }): void {
        const transaction = this.db.transaction(() => {
            if (data.folders) {
                for (const folder of data.folders) {
                    this.addFolder({
                        name: folder.name,
                        parentId: folder.parentId,
                        position: folder.position
                    });
                }
            }

            if (data.bookmarks) {
                for (const bookmark of data.bookmarks) {
                    this.addBookmark({
                        title: bookmark.title,
                        url: bookmark.url,
                        favicon: bookmark.favicon,
                        folderId: bookmark.folderId,
                        position: bookmark.position,
                        tags: bookmark.tags
                    });
                }
            }
        });

        transaction();
    }

    close(): void {
        this.db.close();
    }
}
