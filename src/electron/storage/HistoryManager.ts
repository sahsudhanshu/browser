import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface HistoryEntry {
    id?: number;
    url: string;
    title: string;
    visitCount: number;
    lastVisit: number;
    favicon?: string;
    duration?: number; // time spent on page in seconds
}

export interface SearchQuery {
    id?: number;
    query: string;
    timestamp: number;
    resultUrl?: string;
}

export class HistoryManager {
    private db: Database.Database;

    constructor(userDataPath?: string) {
        const dbPath = path.join(
            userDataPath || app.getPath('userData'),
            'history.db'
        );
        
        this.db = new Database(dbPath);
        this.initializeDatabase();
    }

    private initializeDatabase() {
        // Create history table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                visitCount INTEGER DEFAULT 1,
                lastVisit INTEGER NOT NULL,
                favicon TEXT,
                duration INTEGER DEFAULT 0,
                UNIQUE(url)
            );

            CREATE INDEX IF NOT EXISTS idx_lastVisit ON history(lastVisit DESC);
            CREATE INDEX IF NOT EXISTS idx_url ON history(url);
            CREATE INDEX IF NOT EXISTS idx_title ON history(title);

            -- Search queries table
            CREATE TABLE IF NOT EXISTS search_queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                resultUrl TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_search_timestamp ON search_queries(timestamp DESC);
        `);
    }

    addVisit(url: string, title: string, favicon?: string): void {
        const stmt = this.db.prepare(`
            INSERT INTO history (url, title, visitCount, lastVisit, favicon)
            VALUES (?, ?, 1, ?, ?)
            ON CONFLICT(url) DO UPDATE SET
                visitCount = visitCount + 1,
                lastVisit = excluded.lastVisit,
                title = excluded.title,
                favicon = COALESCE(excluded.favicon, favicon)
        `);

        stmt.run(url, title, Date.now(), favicon || null);
    }

    getHistory(limit = 100, offset = 0): HistoryEntry[] {
        const stmt = this.db.prepare(`
            SELECT * FROM history
            ORDER BY lastVisit DESC
            LIMIT ? OFFSET ?
        `);

        return stmt.all(limit, offset) as HistoryEntry[];
    }

    searchHistory(query: string, limit = 50): HistoryEntry[] {
        const stmt = this.db.prepare(`
            SELECT * FROM history
            WHERE url LIKE ? OR title LIKE ?
            ORDER BY lastVisit DESC
            LIMIT ?
        `);

        const searchPattern = `%${query}%`;
        return stmt.all(searchPattern, searchPattern, limit) as HistoryEntry[];
    }

    getHistoryByDate(startDate: number, endDate: number): HistoryEntry[] {
        const stmt = this.db.prepare(`
            SELECT * FROM history
            WHERE lastVisit BETWEEN ? AND ?
            ORDER BY lastVisit DESC
        `);

        return stmt.all(startDate, endDate) as HistoryEntry[];
    }

    deleteHistory(url: string): void {
        const stmt = this.db.prepare('DELETE FROM history WHERE url = ?');
        stmt.run(url);
    }

    clearHistory(olderThan?: number): void {
        if (olderThan) {
            const stmt = this.db.prepare('DELETE FROM history WHERE lastVisit < ?');
            stmt.run(olderThan);
        } else {
            this.db.exec('DELETE FROM history');
        }
    }

    addSearchQuery(query: string, resultUrl?: string): void {
        const stmt = this.db.prepare(`
            INSERT INTO search_queries (query, timestamp, resultUrl)
            VALUES (?, ?, ?)
        `);

        stmt.run(query, Date.now(), resultUrl || null);
    }

    getSearchHistory(limit = 50): SearchQuery[] {
        const stmt = this.db.prepare(`
            SELECT * FROM search_queries
            ORDER BY timestamp DESC
            LIMIT ?
        `);

        return stmt.all(limit) as SearchQuery[];
    }

    getTopVisited(limit = 10): HistoryEntry[] {
        const stmt = this.db.prepare(`
            SELECT * FROM history
            ORDER BY visitCount DESC, lastVisit DESC
            LIMIT ?
        `);

        return stmt.all(limit) as HistoryEntry[];
    }

    updateDuration(url: string, duration: number): void {
        const stmt = this.db.prepare(`
            UPDATE history
            SET duration = duration + ?
            WHERE url = ?
        `);

        stmt.run(duration, url);
    }

    close(): void {
        this.db.close();
    }
}
