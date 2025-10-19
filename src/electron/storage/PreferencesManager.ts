import Store from 'electron-store';

export interface UserPreferences {
    // Appearance
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    zoomLevel: number;
    
    // Browser behavior
    defaultSearchEngine: string;
    homePage: string;
    showBookmarksBar: boolean;
    openNewTabsInBackground: boolean;
    
    // Privacy
    clearHistoryOnExit: boolean;
    clearCookiesOnExit: boolean;
    doNotTrack: boolean;
    
    // Downloads
    downloadPath: string;
    askDownloadLocation: boolean;
    
    // Advanced
    hardwareAcceleration: boolean;
    autoplayMedia: boolean;
    blockPopups: boolean;
    
    // AI Assistant
    perplexityApiKey?: string;
    aiModel: string;
}

const defaultPreferences: UserPreferences = {
    theme: 'system',
    fontSize: 14,
    zoomLevel: 1.0,
    defaultSearchEngine: 'https://www.google.com/search?q=',
    homePage: '',
    showBookmarksBar: true,
    openNewTabsInBackground: false,
    clearHistoryOnExit: false,
    clearCookiesOnExit: false,
    doNotTrack: true,
    downloadPath: '',
    askDownloadLocation: true,
    hardwareAcceleration: true,
    autoplayMedia: true,
    blockPopups: true,
    aiModel: 'llama-3.1-sonar-small-128k-online'
};

export class PreferencesManager {
    private store: Store<UserPreferences>;

    constructor() {
        this.store = new Store<UserPreferences>({
            name: 'preferences',
            defaults: defaultPreferences,
            // Encrypt sensitive data
            encryptionKey: 'nova-browser-preferences-key',
        });
    }

    get<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
        return this.store.get(key);
    }

    set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
        this.store.set(key, value);
    }

    getAll(): UserPreferences {
        return this.store.store;
    }

    setAll(preferences: Partial<UserPreferences>): void {
        for (const [key, value] of Object.entries(preferences)) {
            this.store.set(key as keyof UserPreferences, value as any);
        }
    }

    reset(): void {
        this.store.clear();
    }

    resetToDefault(key: keyof UserPreferences): void {
        this.store.set(key, defaultPreferences[key]);
    }

    export(): UserPreferences {
        return this.store.store;
    }

    import(preferences: Partial<UserPreferences>): void {
        this.setAll(preferences);
    }

    // Listen for changes
    onChange<K extends keyof UserPreferences>(
        key: K,
        callback: (newValue?: UserPreferences[K], oldValue?: UserPreferences[K]) => void
    ): () => void {
        return this.store.onDidChange(key, callback);
    }

    onAnyChange(callback: (newValue?: UserPreferences, oldValue?: UserPreferences) => void): () => void {
        return this.store.onDidAnyChange(callback);
    }
}
