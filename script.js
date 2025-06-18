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
  launcher.className = 'h-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex flex-col items-center justify-center p-8 relative overflow-hidden';
  
  // Add animated background elements
  launcher.innerHTML = `
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style="animation-delay: 4s;"></div>
    </div>
    
    <div class="text-center max-w-6xl w-full relative z-10">
      <!-- Clock and Date Section -->
      <div class="mb-8">
        <div id="current-time" class="text-6xl md:text-7xl font-thin tracking-wider mb-2 text-gray-800 drop-shadow-sm"></div>
        <div id="current-date" class="text-xl md:text-2xl font-light text-gray-600 drop-shadow-sm"></div>
      </div>
      
      <!-- Apps Grid -->
      <div id="app-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"></div>
      
      <!-- Open Source Attribution -->
      <div class="mt-16 bg-white/40 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-200/50">
        
        <div class="text-sm text-gray-500 text-center leading-relaxed">
          <a href="https://github.com/smoqadam/mini-toolbox" target="_blank" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors mt-1 inline-block">
            Contribute on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  `;
  
  const appGrid = launcher.querySelector('#app-grid');
  apps.forEach((app, index) => {
    const appCard = document.createElement('div');
    appCard.className = 'group bg-white/70 backdrop-blur-md rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl hover:bg-white/90 border border-gray-200/50 text-center transform hover:-translate-y-2 shadow-lg';
    appCard.onclick = () => openAppInCurrentTab(app.id, app.name);
    appCard.style.animationDelay = `${index * 0.1}s`;
    appCard.classList.add('animate-fadeInUp');
    
    appCard.innerHTML = `
      <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">${app.icon}</div>
      <div class="text-2xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">${app.name}</div>
      <div class="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">${app.description}</div>
    `;
    
    appGrid.appendChild(appCard);
  });
  
  // Start clock updates
  setTimeout(() => {
    updateClock(launcher);
    updateStats(launcher);
    
    // Update clock every second
    setInterval(() => updateClock(launcher), 1000);
    // Update stats every 10 seconds
    setInterval(() => updateStats(launcher), 10000);
  }, 100);
  
  return launcher;
}

function updateClock(launcher) {
  const timeElement = launcher.querySelector('#current-time');
  const dateElement = launcher.querySelector('#current-date');
  
  if (!timeElement || !dateElement) return;
  
  const now = new Date();
  
  // Update time
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
  
  // Update date
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
}

function updateStats(launcher) {
  const tabsCountElement = launcher.querySelector('#tabs-count');
  const storageUsedElement = launcher.querySelector('#storage-used');
  
  if (!tabsCountElement || !storageUsedElement) return;
  
  // Count open tabs
  const openTabs = document.querySelectorAll('#tabs > div[data-tab-id]').length;
  tabsCountElement.textContent = openTabs;
  
  // Calculate storage usage
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  
  // Convert to readable format
  const sizeKB = Math.round(totalSize / 1024);
  if (sizeKB < 1024) {
    storageUsedElement.textContent = `${sizeKB}KB`;
  } else {
    const sizeMB = (sizeKB / 1024).toFixed(1);
    storageUsedElement.textContent = `${sizeMB}MB`;
  }
}

function createNewTab(title = 'New Tab', content = null) {
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
  
  if (content) {
    tabContent.appendChild(content);
  } else {
    tabContent.appendChild(createLauncherContent());
  }
  
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
  
  saveTabsState();
}

function openAppInCurrentTab(appId, appName) {
  const currentTab = document.querySelector(`[data-tab-id="${activeTabId}"]`);
  const currentContent = document.getElementById(activeTabId);
  
  currentTab.querySelector('.tab-title').textContent = appName;
  
  const iframe = document.createElement('iframe');
  iframe.src = `apps/${appId}/index.html`;
  iframe.className = 'w-full h-full border-0';
  
  iframe.onload = () => {
    iframe.contentWindow.postMessage({
      type: 'TAB_ID',
      tabId: activeTabId
    }, '*');
  };
  
  currentContent.innerHTML = '';
  currentContent.appendChild(iframe);
  
  saveTabsState();
}

function createNewTabButton() {
  const newTabBtn = document.createElement('button');
  newTabBtn.id = 'new-tab-btn';
  newTabBtn.className = 'w-10 h-10 rounded-xl bg-white/80 hover:bg-white/90 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 text-lg font-light ml-2 flex-shrink-0 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/50 shadow-sm';
  newTabBtn.innerHTML = '+';
  newTabBtn.onclick = () => createNewTab('Home');
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
    
    tabs.push({
      id: tabId,
      title: title,
      appId: iframe ? iframe.src.match(/apps\/(\w+)\//)?.[1] : null,
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
      const content = tabData.appId ? 
        createAppContent(tabData.appId) : 
        createLauncherContent();
      
      const tabId = createNewTabWithId(tabData.id, tabData.title, content);
      
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

function createNewTabWithId(tabId, title, content) {
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
  tabContent.appendChild(content);
  
  const newTabBtn = document.getElementById('new-tab-btn');
  tabsContainer.insertBefore(tab, newTabBtn);
  contentContainer.appendChild(tabContent);
  
  return tabId;
}

function initializeBrowser() {
  tabsContainer.appendChild(createNewTabButton());
  
  if (!loadTabsState()) {
    createNewTab('Home');
  }
}

setInterval(saveTabsState, 30000);
window.addEventListener('beforeunload', saveTabsState);
document.addEventListener('DOMContentLoaded', initializeBrowser);
