let tabCount = 0;
let activeTabId = null;
const tabsContainer = document.getElementById('tabs');
const contentContainer = document.getElementById('content');

const apps = [
  {
    id: 'draw',
    name: 'Draw',
    icon: '🎨',
    description: 'Create digital artwork with brushes and colors'
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    description: 'Write and organize your thoughts'
  },
  {
    id: 'todos',
    name: 'Todo',
    icon: '✅',
    description: 'Manage your tasks and stay productive'
  }
];

function createLauncherContent() {
  const launcher = document.createElement('div');
  launcher.className = 'h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-8';
  launcher.innerHTML = `
    <div class="text-center max-w-4xl w-full">
      <h1 class="text-5xl font-light text-white mb-12 drop-shadow-lg">Personal Toolkit</h1>
      <div id="app-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </div>
  `;
  
  const appGrid = launcher.querySelector('#app-grid');
  apps.forEach(app => {
    const appCard = document.createElement('div');
    appCard.className = 'group bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white border border-white/20 text-center';
    appCard.onclick = () => openAppInCurrentTab(app.id, app.name);
    
    appCard.innerHTML = `
      <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">${app.icon}</div>
      <div class="text-xl font-semibold text-gray-800 mb-2">${app.name}</div>
      <div class="text-sm text-gray-600 leading-relaxed">${app.description}</div>
    `;
    
    appGrid.appendChild(appCard);
  });
  
  return launcher;
}

function createNewTab(title = 'New Tab', content = null) {
  const tabId = `tab-${++tabCount}`;
  
  const tab = document.createElement('div');
  tab.className = 'flex items-center bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer transition-colors duration-200 min-w-0 max-w-48';
  tab.dataset.tabId = tabId;
  tab.onclick = () => switchToTab(tabId);
  
  tab.innerHTML = `
    <span class="tab-title text-sm font-medium text-gray-700 truncate flex-1">${title}</span>
    <button class="tab-close ml-2 w-5 h-5 rounded-full hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-xs" onclick="closeTab('${tabId}', event)">×</button>
  `;
  
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content w-full h-full absolute top-0 left-0 hidden';
  tabContent.id = tabId;
  
  if (content) {
    tabContent.appendChild(content);
  } else {
    tabContent.appendChild(createLauncherContent());
  }
  
  const newTabBtn = document.getElementById('new-tab-btn');
  tabsContainer.insertBefore(tab, newTabBtn);
  contentContainer.appendChild(tabContent);
  
  switchToTab(tabId);
  saveTabsState(); // Save state when creating new tab
  return tabId;
}

function switchToTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.add('hidden');
    c.classList.remove('block');
  });
  
  document.querySelectorAll('#tabs > div[data-tab-id]').forEach(t => {
    t.classList.remove('bg-white', 'shadow-sm');
    t.classList.add('bg-gray-100', 'hover:bg-gray-200');
    t.querySelector('.tab-title').classList.remove('text-gray-900');
    t.querySelector('.tab-title').classList.add('text-gray-700');
  });
  
  const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
  const activeContent = document.getElementById(tabId);
  
  if (activeTab && activeContent) {
    activeTab.classList.remove('bg-gray-100', 'hover:bg-gray-200');
    activeTab.classList.add('bg-white', 'shadow-sm');
    activeTab.querySelector('.tab-title').classList.remove('text-gray-700');
    activeTab.querySelector('.tab-title').classList.add('text-gray-900');
    
    activeContent.classList.remove('hidden');
    activeContent.classList.add('block');
  }
  
  activeTabId = tabId;
  saveTabsState(); // Save state when switching tabs
}

function closeTab(tabId, event) {
  if (event) {
    event.stopPropagation();
  }
  
  // Clean up localStorage for this tab
  localStorage.removeItem(`notes-${tabId}`);
  localStorage.removeItem(`drawing-${tabId}`);
  
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  const content = document.getElementById(tabId);
  const wasActive = tab.classList.contains('bg-white');
  
  tab.remove();
  content.remove();
  
  const remainingTabs = document.querySelectorAll('#tabs > div[data-tab-id]');
  if (remainingTabs.length === 0) {
    createNewTab('Home');
    return;
  }
  
  if (wasActive) {
    const lastTab = remainingTabs[remainingTabs.length - 1];
    switchToTab(lastTab.dataset.tabId);
  }
  
  saveTabsState(); // Save state when closing tab
}

function openAppInCurrentTab(appId, appName) {
  const currentTab = document.querySelector(`[data-tab-id="${activeTabId}"]`);
  const currentContent = document.getElementById(activeTabId);
  
  currentTab.querySelector('.tab-title').textContent = appName;
  
  const iframe = document.createElement('iframe');
  iframe.src = `apps/${appId}/index.html`;
  iframe.className = 'w-full h-full border-0';
  
  // Send tab ID to iframe when it loads
  iframe.onload = () => {
    iframe.contentWindow.postMessage({
      type: 'TAB_ID',
      tabId: activeTabId
    }, '*');
  };
  
  currentContent.innerHTML = '';
  currentContent.appendChild(iframe);
  
  saveTabsState(); // Save state when opening app
}

function createNewTabButton() {
  const newTabBtn = document.createElement('button');
  newTabBtn.id = 'new-tab-btn';
  newTabBtn.className = 'w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-lg font-light ml-2 flex-shrink-0';
  newTabBtn.innerHTML = '+';
  newTabBtn.onclick = () => createNewTab('Home');
  newTabBtn.title = 'New Tab';
  return newTabBtn;
}

// Tab persistence functions
function saveTabsState() {
  const tabs = [];
  document.querySelectorAll('#tabs > div[data-tab-id]').forEach(tab => {
    const tabId = tab.dataset.tabId;
    const title = tab.querySelector('.tab-title').textContent;
    const content = document.getElementById(tabId);
    const iframe = content.querySelector('iframe');
    
    tabs.push({
      id: tabId,
      title: title,
      appId: iframe ? iframe.src.match(/apps\/(\w+)\//)?.[1] : null,
      isActive: tab.classList.contains('bg-white')
    });
  });
  
  localStorage.setItem('browserTabs', JSON.stringify({
    tabs: tabs,
    tabCount: tabCount,
    activeTabId: activeTabId
  }));
}

function loadTabsState() {
  const saved = localStorage.getItem('browserTabs');
  if (!saved) return false;
  
  try {
    const state = JSON.parse(saved);
    tabCount = state.tabCount || 0;
    
    // Clear existing tabs
    document.querySelectorAll('#tabs > div[data-tab-id]').forEach(tab => tab.remove());
    document.querySelectorAll('.tab-content').forEach(content => content.remove());
    
    // Restore tabs
    state.tabs.forEach(tabData => {
      const content = tabData.appId ? 
        createAppContent(tabData.appId) : 
        createLauncherContent();
      
      const tabId = createNewTabWithId(tabData.id, tabData.title, content);
      
      if (tabData.isActive) {
        activeTabId = tabId;
      }
    });
    
    // Switch to active tab
    if (activeTabId) {
      switchToTab(activeTabId);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load tabs state:', error);
    return false;
  }
}

function createAppContent(appId) {
  const iframe = document.createElement('iframe');
  iframe.src = `apps/${appId}/index.html`;
  iframe.className = 'w-full h-full border-0';
  
  // Send tab ID to iframe when it loads
  iframe.onload = () => {
    const tabContent = iframe.closest('.tab-content');
    const tabId = tabContent ? tabContent.id : 'default';
    iframe.contentWindow.postMessage({
      type: 'TAB_ID',
      tabId: tabId
    }, '*');
  };
  
  return iframe;
}

function createNewTabWithId(tabId, title, content) {
  const tab = document.createElement('div');
  tab.className = 'flex items-center bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer transition-colors duration-200 min-w-0 max-w-48';
  tab.dataset.tabId = tabId;
  tab.onclick = () => switchToTab(tabId);
  
  tab.innerHTML = `
    <span class="tab-title text-sm font-medium text-gray-700 truncate flex-1">${title}</span>
    <button class="tab-close ml-2 w-5 h-5 rounded-full hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-xs" onclick="closeTab('${tabId}', event)">×</button>
  `;
  
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content w-full h-full absolute top-0 left-0 hidden';
  tabContent.id = tabId;
  tabContent.appendChild(content);
  
  const newTabBtn = document.getElementById('new-tab-btn');
  tabsContainer.insertBefore(tab, newTabBtn);
  contentContainer.appendChild(tabContent);
  
  return tabId;
}

function initializeBrowser() {
  tabsContainer.appendChild(createNewTabButton());
  
  // Try to load saved state, otherwise create default tab
  if (!loadTabsState()) {
    createNewTab('Home');
  }
}

// Auto-save tabs state periodically
setInterval(saveTabsState, 30000); // Save every 30 seconds

// Save state before page unload
window.addEventListener('beforeunload', saveTabsState);

document.addEventListener('DOMContentLoaded', initializeBrowser);
