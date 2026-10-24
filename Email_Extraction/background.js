let currentEmailData = {
  subject: '',
  from: '',
  fromEmail: '',
  to: '',
  body: '',
  timestamp: null,
  links: []
};

chrome.runtime.onInstalled.addListener(r => {
  if(r.reason == 'install'){
    chrome.tabs.create({
      url: 'onboarding-page.html'
    });
  }
});

// Track which hostname we've injected into per tabId to avoid repeated injections
const injectedTabs = new Map(); // tabId -> hostname

function getSupportedHost(url) {
  try {
    const h = new URL(url).hostname;
    if (h.includes('mail.google.com')) return 'mail.google.com';
    if (h.includes('web.whatsapp.com')) return 'web.whatsapp.com';
    if (h.includes('web.telegram.org')) return 'web.telegram.org';
  } catch (e) {}
  return null;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (!tab || !tab.url) return;
  if (changeInfo.status !== 'complete') return; // wait until load complete

  const host = getSupportedHost(tab.url);
  if (!host) {
    if (injectedTabs.has(tabId)) injectedTabs.delete(tabId);
    return;
  }

  const prev = injectedTabs.get(tabId);
  if (prev === host) return; // already injected for this host

  chrome.scripting.executeScript({ files: ['contentScript.js'], target: { tabId: tabId } }, () => {
    if (chrome.runtime.lastError) {
      console.warn('Injection failed for tab', tabId, chrome.runtime.lastError);
      return;
    }
    injectedTabs.set(tabId, host);
    console.log('Injected reader content script into', host, 'tab', tabId);
  });
});

// Inject when a tab becomes active (handles existing open tabs)
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url) return;
    const host = getSupportedHost(tab.url);
    if (!host) return;
    const prev = injectedTabs.get(activeInfo.tabId);
    if (prev === host) return;
    chrome.scripting.executeScript({ files: ['contentScript.js'], target: { tabId: activeInfo.tabId } }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Activation injection failed for tab', activeInfo.tabId, chrome.runtime.lastError);
        return;
      }
      injectedTabs.set(activeInfo.tabId, host);
      console.log('Injected on activation into', host, 'tab', activeInfo.tabId);
    });
  });
});

// Clean up when tabs are removed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (injectedTabs.has(tabId)) injectedTabs.delete(tabId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateEmail') {
    currentEmailData = {
      subject: request.data.subject || 'No Subject',
      from: request.data.from || 'Unknown Sender',
      fromEmail: request.data.fromEmail || '',
      to: request.data.to || 'Unknown',
      body: request.data.body || 'No content',
      links: request.data.links || [],
      platform: request.data.platform || 'unknown',
      timestamp: new Date().toLocaleString()
    };

    chrome.storage.local.set({ lastEmail: currentEmailData }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getEmail') {
    sendResponse({ email: currentEmailData });
  }
});
