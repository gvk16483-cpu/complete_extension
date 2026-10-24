const popupContent = document.getElementById('popupContent');
const refreshBtn = document.getElementById('refreshBtn');
let lastEmailData = null;

console.log('📧 Popup script loaded');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatText(text) {
  if (!text) return '';
  let cleaned = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  return cleaned;
}

function displayEmail(emailData) {
  if (!emailData || (!emailData.body && !emailData.subject)) {
    console.log('No valid email data to display');
    popupContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📬</div>
        <div class="empty-text">No content loaded</div>
        <div class="empty-hint">Open Gmail, WhatsApp Web, or Telegram Web and select a message/chat</div>
        <div style="margin-top: 10px; font-size: 11px; color: #6b7280;">
          <button id="debugBtn" style="padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Debug</button>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      const debugBtn = document.getElementById('debugBtn');
      if (debugBtn) {
        debugBtn.addEventListener('click', () => {
          findSupportedTab((tab) => {
            if (tab) {
              chrome.scripting.executeScript({ files: ['contentScript.js'], target: { tabId: tab.id } }, () => {
                if (chrome.runtime.lastError) {
                  console.log('Injection error:', chrome.runtime.lastError);
                  alert('Could not inject content script into the tab. Try reloading the page.');
                  return;
                }
                chrome.tabs.sendMessage(tab.id, { action: 'sendCurrentEmail' }, (response) => {
                  console.log('Debug response:', response);
                  if (response?.success) {
                    setTimeout(loadEmail, 500);
                  } else {
                    alert('Could not extract content. Make sure the app has an open chat or message.');
                  }
                });
              });
            } else {
              alert('Supported tab not found. Open Gmail, WhatsApp Web, or Telegram Web.');
            }
          });
        });
      }
    }, 100);
    
    lastEmailData = null;
    return;
  }

  let linksHtml = '';
  if (emailData.links && emailData.links.length > 0) {
    linksHtml = `
      <div class="email-links">
        <div class="email-links-title">🔗 Links (${emailData.links.length})</div>
        <div class="email-links-list">
          ${emailData.links.map(link => `
            <div class="email-link-item">
              <div class="link-text">${escapeHtml(link.text)}</div>
              <div class="link-url">${escapeHtml(link.href)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Choose labels depending on platform
  const platform = (emailData.platform || 'gmail').toLowerCase();
  const subjectLabel = platform === 'gmail' ? 'Subject' : (platform === 'whatsapp' ? 'Chat' : (platform === 'telegram' ? 'Chat' : 'Title'));
  const fromLabel = platform === 'gmail' ? 'From' : 'Last sender';

  const html = `
    <div class="email-section">
      <div class="email-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="email-subject">${escapeHtml(emailData.subject || 'No Subject')}</div>
          <div style="font-size:12px; padding:3px 6px; background:#eef2ff; color:#1e3a8a; border-radius:4px;">${escapeHtml(platform.toUpperCase())}</div>
        </div>
        <div class="email-meta">
          <div class="meta-item">
            <span class="meta-label">${subjectLabel}:</span>
            <span class="meta-value">${escapeHtml(emailData.subject || 'No Subject')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${fromLabel}:</span>
            <span class="meta-value">${escapeHtml(emailData.from || 'Unknown')}
              ${emailData.fromEmail ? `<br><span style="font-size: 11px; color: #9ca3af;">&lt;${escapeHtml(emailData.fromEmail)}&gt;</span>` : ''}
            </span>
          </div>
        </div>
      </div>

      <div class="email-body">${formatText(emailData.body || '')}</div>

      ${linksHtml}

      <div class="email-timestamp">
        ${emailData.timestamp ? `Last updated: ${emailData.timestamp}` : 'Just now'}
      </div>
    </div>
  `;

  popupContent.innerHTML = html;
  lastEmailData = emailData;
}

function loadEmail() {
  // First, try to get from storage (persistent data)
  chrome.storage.local.get(['lastEmail'], (result) => {
    console.log('Checking storage for email:', result);
    if (result.lastEmail && result.lastEmail.subject) {
      console.log('✓ Found email in storage');
      displayEmail(result.lastEmail);
    } else {
      console.log('No email in storage, requesting from background...');
      // If no data in storage, request from background script
      chrome.runtime.sendMessage({ action: 'getEmail' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error communicating with background:', chrome.runtime.lastError);
          displayEmail(null);
        } else if (response?.email && (response.email.subject || response.email.body)) {
          console.log('✓ Got email from background');
          displayEmail(response.email);
        } else {
          console.log('No email data available');
          displayEmail(null);
        }
      });
    }
  });
}

function loadEmailIfChanged() {
  // Only reload if email data actually changed
  chrome.storage.local.get(['lastEmail'], (result) => {
    if (result.lastEmail && (result.lastEmail.subject || result.lastEmail.body)) {
      const newDataStr = JSON.stringify(result.lastEmail);
      const oldDataStr = JSON.stringify(lastEmailData);
      
      // Only update if the data is different
      if (newDataStr !== oldDataStr) {
        console.log('📨 Email data changed, updating display');
        displayEmail(result.lastEmail);
      }
    }
  });
}

function refreshEmail() {
  console.log('🔄 Refreshing email...');
  refreshBtn.style.transform = 'rotate(0deg)';
  refreshBtn.style.opacity = '0.5';
  
  findSupportedTab((tab) => {
    if (tab) {
      chrome.scripting.executeScript({ files: ['contentScript.js'], target: { tabId: tab.id } }, () => {
        if (chrome.runtime.lastError) {
          console.log('Injection error:', chrome.runtime.lastError);
          refreshBtn.style.opacity = '1';
          alert('Could not inject content script into the tab. Try reloading the page.');
          return;
        }
        chrome.tabs.sendMessage(tab.id, { action: 'sendCurrentEmail' }, (response) => {
          refreshBtn.style.opacity = '1';
          console.log('Refresh response:', response);
          if (response?.success) {
            setTimeout(loadEmail, 500);
          } else {
            alert('Could not extract content from the page.');
          }
        });
      });
    } else {
      refreshBtn.style.opacity = '1';
      alert('No supported tab found. Open Gmail, WhatsApp Web, or Telegram Web.');
      loadEmail();
    }
  });
}

// Helper: find a supported tab (Gmail, WhatsApp, Telegram)
function findSupportedTab(cb) {
  const patterns = ['mail.google.com', 'web.whatsapp.com', 'web.telegram.org'];
  chrome.tabs.query({}, (tabs) => {
    for (const p of patterns) {
      const t = tabs.find(tab => tab.url && tab.url.includes(p));
      if (t) { cb(t); return; }
    }
    cb(null);
  });
}

// Load email when popup opens
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded, requesting email...');
  loadEmail();
});

// Refresh button click handler
refreshBtn.addEventListener('click', refreshEmail);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateEmail') {
    loadEmailIfChanged();
  }
});

// Check for updates every 5 seconds, but only reload if data changed
setInterval(loadEmailIfChanged, 5000);
