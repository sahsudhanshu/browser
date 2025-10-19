const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer to use IPC
contextBridge.exposeInMainWorld('electronAPI', {
    // History API
    history: {
        add: (url, title, favicon) =>
            ipcRenderer.invoke('history:add', url, title, favicon),
        get: (limit, offset) =>
            ipcRenderer.invoke('history:get', limit, offset),
        search: (query, limit) =>
            ipcRenderer.invoke('history:search', query, limit),
        getByDate: (startDate, endDate) =>
            ipcRenderer.invoke('history:getByDate', startDate, endDate),
        delete: (url) =>
            ipcRenderer.invoke('history:delete', url),
        clear: (olderThan) =>
            ipcRenderer.invoke('history:clear', olderThan),
        getTopVisited: (limit) =>
            ipcRenderer.invoke('history:getTopVisited', limit),
        updateDuration: (url, duration) =>
            ipcRenderer.invoke('history:updateDuration', url, duration),
        addSearch: (query, resultUrl) =>
            ipcRenderer.invoke('history:addSearch', query, resultUrl),
        getSearchHistory: (limit) =>
            ipcRenderer.invoke('history:getSearchHistory', limit),
    },

    // Bookmarks API
    bookmarks: {
        add: (bookmark) =>
            ipcRenderer.invoke('bookmarks:add', bookmark),
        get: (folderId) =>
            ipcRenderer.invoke('bookmarks:get', folderId),
        getAll: () =>
            ipcRenderer.invoke('bookmarks:getAll'),
        search: (query) =>
            ipcRenderer.invoke('bookmarks:search', query),
        update: (id, updates) =>
            ipcRenderer.invoke('bookmarks:update', id, updates),
        delete: (id) =>
            ipcRenderer.invoke('bookmarks:delete', id),
        move: (id, folderId, position) =>
            ipcRenderer.invoke('bookmarks:move', id, folderId, position),
        addFolder: (folder) =>
            ipcRenderer.invoke('bookmarks:addFolder', folder),
        getFolders: (parentId) =>
            ipcRenderer.invoke('bookmarks:getFolders', parentId),
        getAllFolders: () =>
            ipcRenderer.invoke('bookmarks:getAllFolders'),
        updateFolder: (id, updates) =>
            ipcRenderer.invoke('bookmarks:updateFolder', id, updates),
        deleteFolder: (id) =>
            ipcRenderer.invoke('bookmarks:deleteFolder', id),
        export: () =>
            ipcRenderer.invoke('bookmarks:export'),
        import: (data) =>
            ipcRenderer.invoke('bookmarks:import', data),
    },

    // Preferences API
    preferences: {
        get: (key) =>
            ipcRenderer.invoke('preferences:get', key),
        set: (key, value) =>
            ipcRenderer.invoke('preferences:set', key, value),
        getAll: () =>
            ipcRenderer.invoke('preferences:getAll'),
        setAll: (preferences) =>
            ipcRenderer.invoke('preferences:setAll', preferences),
        reset: () =>
            ipcRenderer.invoke('preferences:reset'),
        export: () =>
            ipcRenderer.invoke('preferences:export'),
        import: (preferences) =>
            ipcRenderer.invoke('preferences:import', preferences),
    },
});
