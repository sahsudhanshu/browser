
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './utils.js';
import { StorageIPCHandler } from './storage/StorageIPCHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let storageHandler: StorageIPCHandler;

app.on("ready", () => {
    // Initialize storage handlers
    storageHandler = new StorageIPCHandler();

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            webviewTag: true, // Enable webview tag
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    if (isDev()) {
        mainWindow.loadURL(`http://localhost:5123`);
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});

app.on('before-quit', () => {
    if (storageHandler) {
        storageHandler.cleanup();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});