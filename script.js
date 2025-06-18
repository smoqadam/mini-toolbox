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
  },
  {
    id: 'breathing',
    name: 'Breathe',
    icon: '🫁',
    description: 'Guided breathing exercises for relaxation'
  },
  {
    id: 'hex-editor',
    name: 'Hex Editor',
    icon: '🔍',
    description: 'View and edit binary files in hexadecimal format'
  }
];

// Listen for messages from iframes
window.addEventListener('message', (event) => {
  if (event.data.type === 'OPEN_APP') {
    openAppInCurrentTab(event.data.appId, event.data.appName);
  }
  if (event.data.type === 'REQUEST_APPS') {
    // Send apps data to home page
    event.source.postMessage({
      type: 'APPS_DATA',
      apps: apps
    }, '*');
  }
});

function createNewTab(title = 'Home', appId = 'home') {
  const tabId = `tab-${++tabCount}`;
  
  const tab = document.createElement('div');
  tab.className = 'flex items-center bg-white/80 hover:bg-white/90 rounded-xl px-4 py-2 cursor-pointer transition-all duration-300 min-w-0 max-w-48 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/50 shadow-sm';
  tab.dataset.tabId = tabId;
  tab.onclick = () => switchToTab(tabId);
  
  tab.innerHTML = `
    <span class="tab-title text-sm font-medium text-gray-700 truncate flex-1">${title}</span>
    <button class="tab-close ml-2 w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-xs" onclick="closeTab('${tabId}', event)">×</button>
  `;
  
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content w-full h-full absolute top-0 left-0 hidden';
  tabContent.id = tabId;
  
  const iframe = createAppContent(appId);
  tabContent.appendChild(iframe);
  
  const newTabBtn = document.getElementById('new-tab-btn');
  tabsContainer.insertBefore(tab, newTabBtn);
  contentContainer.appendChild(tabContent);
  
  switchToTab(tabId);
  saveTabsState();
  return tabId;
}

function switchToTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.add('hidden');
    c.classList.remove('block');
  });
  
  document.querySelectorAll('#tabs > div[data-tab-id]').forEach(t => {
    t.classList.remove('bg-white', 'shadow-md', 'border-gray-300/50');
    t.classList.add('bg-white/80', 'hover:bg-white/90', 'border-gray-200/50', 'shadow-sm');
    t.querySelector('.tab-title').classList.remove('text-gray-900');
    t.querySelector('.tab-title').classList.add('text-gray-700');
  });
  
  const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
  const activeContent = document.getElementById(tabId);
  
  if (activeTab && activeContent) {
    activeTab.classList.remove('bg-white/80', 'hover:bg-white/90', 'border-gray-200/50', 'shadow-sm');
    activeTab.classList.add('bg-white', 'shadow-md', 'border-gray-300/50');
    activeTab.querySelector('.tab-title').classList.remove('text-gray-700');
    activeTab.querySelector('.tab-title').classList.add('text-gray-900');
    
    activeContent.classList.remove('hidden');
    activeContent.classList.add('block');
  }
  
  activeTabId = tabId;
  saveTabsState();
}

function closeTab(tabId, event) {
  if (event) {
    event.stopPropagation();
  }
  
  // Clean up localStorage for this tab
  localStorage.removeItem(`notes-${tabId}`);
  localStorage.removeItem(`drawing-${tabId}`);
  localStorage.removeItem(`todos-${tabId}`);
  localStorage.removeItem(`breathing-${tabId}`);
  
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  const content = document.getElementById(tabId);
  const wasActive = tab.classList.contains('bg-white');
  
  tab.remove();
  content.remove();
  
  const remainingTabs = document.querySelectorAll('#tabs > div[data-tab-id]');
  if (remainingTabs.length === 0) {
    createNewTab('Home', 'home');
    return;
  }
  
  if (wasActive) {
    const lastTab = remainingTabs[remainingTabs.length - 1];
    switchToTab(lastTab.dataset.tabId);
  }
  
  saveTabsState();
}

function openAppInCurrentTab(appId, appName) {
  const currentTab = document.querySelector(`[data-tab-id="${activeTabId}"]`);
  const currentContent = document.getElementById(activeTabId);
  
  currentTab.querySelector('.tab-title').textContent = appName;
  
  const iframe = createAppContent(appId);
  
  currentContent.innerHTML = '';
  currentContent.appendChild(iframe);
  
  saveTabsState();
}

function createAppContent(appId) {
  const iframe = document.createElement('iframe');
  iframe.src = `apps/${appId}/index.html`;
  iframe.className = 'w-full h-full border-0';
  
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

function createNewTabButton() {
  const newTabBtn = document.createElement('button');
  newTabBtn.id = 'new-tab-btn';
  newTabBtn.className = 'w-10 h-10 rounded-xl bg-white/80 hover:bg-white/90 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 text-lg font-light ml-2 flex-shrink-0 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/50 shadow-sm';
  newTabBtn.innerHTML = '+';
  newTabBtn.onclick = () => createNewTab('Home', 'home');
  newTabBtn.title = 'New Tab';
  return newTabBtn;
}

function saveTabsState() {
  const tabs = [];
  document.querySelectorAll('#tabs > div[data-tab-id]').forEach(tab => {
    const tabId = tab.dataset.tabId;
    const title = tab.querySelector('.tab-title').textContent;
    const content = document.getElementById(tabId);
    const iframe = content.querySelector('iframe');
    
    // Determine app ID from iframe src
    let appId = 'home';
    if (iframe && iframe.src) {
      const match = iframe.src.match(/apps\/(\w+)\//);
      if (match) {
        appId = match[1];
      }
    }
    
    tabs.push({
      id: tabId,
      title: title,
      appId: appId,
      isActive: tab.classList.contains('bg-white') && tab.classList.contains('shadow-md')
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
    
    document.querySelectorAll('#tabs > div[data-tab-id]').forEach(tab => tab.remove());
    document.querySelectorAll('.tab-content').forEach(content => content.remove());
    
    state.tabs.forEach(tabData => {
      const tabId = createNewTabWithId(tabData.id, tabData.title, tabData.appId || 'home');
      
      if (tabData.isActive) {
        activeTabId = tabId;
      }
    });
    
    if (activeTabId) {
      switchToTab(activeTabId);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load tabs state:', error);
    return false;
  }
}

function createNewTabWithId(tabId, title, appId) {
  const tab = document.createElement('div');
  tab.className = 'flex items-center bg-white/80 hover:bg-white/90 rounded-xl px-4 py-2 cursor-pointer transition-all duration-300 min-w-0 max-w-48 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/50 shadow-sm';
  tab.dataset.tabId = tabId;
  tab.onclick = () => switchToTab(tabId);
  
  tab.innerHTML = `
    <span class="tab-title text-sm font-medium text-gray-700 truncate flex-1">${title}</span>
    <button class="tab-close ml-2 w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-xs" onclick="closeTab('${tabId}', event)">×</button>
  `;
  
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content w-full h-full absolute top-0 left-0 hidden';
  tabContent.id = tabId;
  
  const iframe = createAppContent(appId);
  tabContent.appendChild(iframe);
  
  const newTabBtn = document.getElementById('new-tab-btn');
  tabsContainer.insertBefore(tab, newTabBtn);
  contentContainer.appendChild(tabContent);
  
  return tabId;
}

function initializeBrowser() {
  tabsContainer.appendChild(createNewTabButton());
  
  if (!loadTabsState()) {
    createNewTab('Home', 'home');
  }
}

setInterval(saveTabsState, 30000);
window.addEventListener('beforeunload', saveTabsState);
document.addEventListener('DOMContentLoaded', initializeBrowser);
