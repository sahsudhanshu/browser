import React, { useState, useRef } from 'react';
import './App.css';

function Tab({ url, active, onClick, onClose }) {
  return (
    <div className={`tab${active ? ' active' : ''}`} onClick={onClick}>
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{url}</span>
      <button className="close-tab" onClick={e => { e.stopPropagation(); onClose(); }}>×</button>
    </div>
  );
}

function Sidebar({ bookmarks, history, onBookmarkClick, onHistoryClick, onRemoveBookmark }) {
  return (
    <div className="sidebar">
      <h3>Bookmarks</h3>
      <ul>
        {bookmarks.map((bm, i) => (
          <li key={i}>
            <span onClick={() => onBookmarkClick(bm)}>{bm}</span>
            <button onClick={() => onRemoveBookmark(bm)}>×</button>
          </li>
        ))}
      </ul>
      <h3>History</h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>
            <span onClick={() => onHistoryClick(h)}>{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsModal({ show, onClose, darkMode, setDarkMode }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>
        <label>
          <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
          Dark Mode
        </label>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function DownloadManager({ downloads }) {
  return (
    <div className="download-manager">
      <h3>Downloads</h3>
      <ul>
        {downloads.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [tabs, setTabs] = useState([
    { url: 'https://www.google.com', id: 1 }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [address, setAddress] = useState(tabs[0].url);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const webviewRef = useRef(null);

  // Navigation functions
  const handleBack = () => {
    if (webviewRef.current) webviewRef.current.goBack();
  };
  const handleForward = () => {
    if (webviewRef.current) webviewRef.current.goForward();
  };
  const handleReload = () => {
    if (webviewRef.current) webviewRef.current.reload();
  };

  // Address bar
  const handleAddressChange = (e) => setAddress(e.target.value);
  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };
  const defaultSearchEngine = 'https://www.google.com/search?q=';
  const handleGo = () => {
    let url = address;
    if (!isValidUrl(address)) {
      url = defaultSearchEngine + encodeURIComponent(address);
    }
    setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, url } : tab));
    setHistory(h => [...h, url]);
  };

  // Tab management
  const handleNewTab = () => {
    const newId = tabs.length ? Math.max(...tabs.map(t => t.id)) + 1 : 1;
    setTabs([...tabs, { id: newId, url: 'https://www.google.com' }]);
    setActiveTab(newId);
    setAddress('https://www.google.com');
  };
  const handleTabClick = (id) => {
    setActiveTab(id);
    const tab = tabs.find(t => t.id === id);
    setAddress(tab.url);
  };
  const handleCloseTab = (id) => {
    let newTabs = tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) newTabs = [{ id: 1, url: 'https://www.google.com' }];
    setTabs(newTabs);
    setActiveTab(newTabs[0].id);
    setAddress(newTabs[0].url);
  };

  // Bookmarks
  const addBookmark = () => {
    if (!bookmarks.includes(address)) setBookmarks([...bookmarks, address]);
  };
  const removeBookmark = (url) => {
    setBookmarks(bookmarks.filter(bm => bm !== url));
  };
  const handleBookmarkClick = (url) => {
    setAddress(url);
    setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, url } : tab));
  };

  // History
  const handleHistoryClick = (url) => {
    setAddress(url);
    setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, url } : tab));
  };

  // Settings
  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  // Download manager (dummy)
  const addDownload = () => {
    setDownloads([...downloads, address]);
  };

  // Current tab
  const currentTab = tabs.find(t => t.id === activeTab);

  React.useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  return (
    <div className="browser-container">
      <Sidebar
        bookmarks={bookmarks}
        history={history}
        onBookmarkClick={handleBookmarkClick}
        onHistoryClick={handleHistoryClick}
        onRemoveBookmark={removeBookmark}
      />
      <div className="main-content">
        <div className="tabs-bar">
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              url={tab.url}
              active={tab.id === activeTab}
              onClick={() => handleTabClick(tab.id)}
              onClose={() => handleCloseTab(tab.id)}
            />
          ))}
          <button className="new-tab" onClick={handleNewTab}>+</button>
        </div>
        <div className="nav-bar">
          <button onClick={handleBack}>←</button>
          <button onClick={handleForward}>→</button>
          <button onClick={handleReload}>⟳</button>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            style={{ width: '60%' }}
          />
          <button onClick={handleGo}>Go</button>
          <button onClick={addBookmark}>☆</button>
          <button onClick={addDownload}>↓</button>
          <button onClick={openSettings}>⚙️</button>
        </div>
        <div className="webview-container">
          {/* Electron webview tag for displaying web pages */}
          <webview
            ref={webviewRef}
            src={currentTab.url}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            allowpopups="true"
          />
        </div>
        <DownloadManager downloads={downloads} />
        <SettingsModal show={showSettings} onClose={closeSettings} darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </div>
  );
}

export default App;
