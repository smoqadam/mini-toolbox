const textarea = document.getElementById('noteContent');
const saveStatus = document.getElementById('saveStatus');
const saveIndicator = document.getElementById('saveIndicator');

// Tab ID will be received via postMessage
let tabId = 'default-notes';
let storageKey = `notes-${tabId}`;

// Listen for tab ID from parent
window.addEventListener('message', (event) => {
  if (event.data.type === 'TAB_ID') {
    tabId = event.data.tabId;
    storageKey = `notes-${tabId}`;
    loadContent(); // Load content after receiving tab ID
  }
});

// Load saved content
function loadContent() {
  const savedContent = localStorage.getItem(storageKey);
  if (savedContent) {
    textarea.value = savedContent;
  }
}

// Auto-save functionality
let saveTimeout;

function saveContent() {
  localStorage.setItem(storageKey, textarea.value);
  saveStatus.textContent = 'Saved';
  saveIndicator.className = 'w-2 h-2 bg-green-500 rounded-full';
}

function showSaving() {
  saveStatus.textContent = 'Saving...';
  saveIndicator.className = 'w-2 h-2 bg-yellow-500 rounded-full';
}

textarea.addEventListener('input', () => {
  showSaving();
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveContent, 1000);
});

// Save immediately when leaving the page
window.addEventListener('beforeunload', saveContent);

// Load content on startup (will be reloaded when tab ID is received)
loadContent();
