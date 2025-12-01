console.log('🔐 Keychain Popup: Script loaded');

// DOM Elements
const credentialForm = document.getElementById('credentialForm');
const credentialsList = document.getElementById('credentialsList');
const platformSelect = document.getElementById('platform');
const environmentSelect = document.getElementById('environment');
const urlInput = document.getElementById('url');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const addCredentialSection = document.getElementById('addCredentialSection');

// Handle environment change
environmentSelect.addEventListener('change', () => {
  if (platformSelect.value === 'salesforce') {
    if (environmentSelect.value === 'production') {
      urlInput.value = 'https://login.salesforce.com';
    } else if (environmentSelect.value === 'sandbox') {
      urlInput.value = 'https://test.salesforce.com';
    }
  }
});

// Toggle form visibility
toggleFormBtn.addEventListener('click', () => {
  addCredentialSection.classList.toggle('hidden');
  toggleFormBtn.classList.toggle('active');
});

// Load and display credentials on popup open
document.addEventListener('DOMContentLoaded', loadCredentials);

// Form submission handler
credentialForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const credential = {
    id: Date.now().toString(),
    platform: platformSelect.value,
    url: urlInput.value.trim(),
    username: usernameInput.value.trim(),
    password: passwordInput.value
  };

  await saveCredential(credential);

  // Clear form
  credentialForm.reset();
  platformSelect.value = 'salesforce';
  urlInput.value = 'https://login.salesforce.com';

  // Reload credentials list
  loadCredentials();

  // Hide form after saving
  addCredentialSection.classList.add('hidden');
  toggleFormBtn.classList.remove('active');

  showToast('✅ Credential saved successfully!');
});

// Save credential to storage
async function saveCredential(credential) {
  const { credentials = [] } = await chrome.storage.sync.get('credentials');
  credentials.push(credential);
  await chrome.storage.sync.set({ credentials });
}

// Load credentials from storage
async function loadCredentials() {
  const { credentials = [] } = await chrome.storage.sync.get('credentials');

  if (credentials.length === 0) {
    credentialsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">No credentials saved yet!</p>
        <p class="empty-subtext">Click the <span class="highlight">+</span> button above to add your first login.</p>
      </div>
    `;
    return;
  }

  // Add header and list
  const listHtml = credentials.map(cred => createCredentialCard(cred)).join('');
  credentialsList.innerHTML = `
    <h2 class="list-title">Saved Credentials</h2>
    ${listHtml}
  `;

  // Attach event listeners to buttons
  attachEventListeners();
}

// Get platform icon
function getPlatformIcon(platform) {
  const icons = {
    'salesforce': '☁️',
    'github': '🐙',
    'aws': '☁️',
    'azure': '☁️',
    'default': '🔐'
  };
  return icons[platform] || icons.default;
}

// Create credential card HTML
function createCredentialCard(credential) {
  const maskedPassword = '•'.repeat(12);
  const urlDisplay = credential.url.replace(/^https?:\/\//, '');
  const platformIcon = getPlatformIcon(credential.platform || 'salesforce');
  const platformName = credential.platform ? credential.platform.charAt(0).toUpperCase() + credential.platform.slice(1) : 'Salesforce';

  return `
    <div class="credential-item" data-id="${credential.id}" data-platform="${credential.platform || 'salesforce'}">
      <div class="credential-header">
        <span class="credential-icon">${platformIcon}</span>
        <div class="credential-info">
          <div class="credential-platform">${platformName}</div>
          <div class="credential-url">${urlDisplay}</div>
          <div class="credential-username">${credential.username}</div>
        </div>
      </div>
      <div class="credential-password">${maskedPassword}</div>
      <div class="credential-actions">
        <button class="btn btn-small btn-login" data-action="login">
          🚀 Login
        </button>
        <button class="btn btn-small btn-delete" data-action="delete">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
}

// Attach event listeners to credential action buttons
function attachEventListeners() {
  document.querySelectorAll('.credential-item').forEach(item => {
    const credentialId = item.dataset.id;

    // Login button
    item.querySelector('[data-action="login"]')?.addEventListener('click', () => {
      handleLogin(credentialId);
    });

    // Delete button
    item.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      handleDelete(credentialId);
    });
  });
}

// Handle login action
async function handleLogin(credentialId) {
  const { credentials = [] } = await chrome.storage.sync.get('credentials');
  const credential = credentials.find(c => c.id === credentialId);

  if (!credential) {
    showToast('❌ Credential not found');
    return;
  }

  // Only Salesforce is supported for now
  if (credential.platform !== 'salesforce') {
    showToast('⚠️ Auto-login only available for Salesforce currently');
    return;
  }

  console.log('Keychain Popup: Sending login request to background worker');

  // Send login request to background service worker
  chrome.runtime.sendMessage({
    action: 'performLogin',
    credential: credential
  }, (response) => {
    console.log('Keychain Popup: Background worker response:', response);
  });

  showToast('🚀 Opening Salesforce...');
}

// Handle copy action
async function handleCopy(credentialId, field) {
  const { credentials = [] } = await chrome.storage.sync.get('credentials');
  const credential = credentials.find(c => c.id === credentialId);

  if (!credential) {
    showToast('❌ Credential not found');
    return;
  }

  const textToCopy = field === 'username' ? credential.username : credential.password;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast(`✅ ${field === 'username' ? 'Username' : 'Password'} copied!`);
  } catch (err) {
    showToast('❌ Failed to copy');
  }
}

// Handle delete action
async function handleDelete(credentialId) {
  if (!confirm('Are you sure you want to delete this credential?')) {
    return;
  }

  const { credentials = [] } = await chrome.storage.sync.get('credentials');
  const updatedCredentials = credentials.filter(c => c.id !== credentialId);

  await chrome.storage.sync.set({ credentials: updatedCredentials });
  loadCredentials();

  showToast('🗑️ Credential deleted');
}

// Show toast notification
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
