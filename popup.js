// Security utilities
const SecurityUtils = {
  // HTML escape to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Validate URL format
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      // Only allow https and http protocols
      if (!['https:', 'http:'].includes(url.protocol)) {
        return false;
      }
      // Prevent javascript: and data: URLs
      if (urlString.toLowerCase().includes('javascript:') ||
        urlString.toLowerCase().includes('data:')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Validate input length
  validateLength(value, maxLength) {
    return value && value.length > 0 && value.length <= maxLength;
  },

  // Sanitize input by trimming and limiting length
  sanitizeInput(value, maxLength = 255) {
    if (!value) return '';
    return value.trim().substring(0, maxLength);
  }
};

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

  // Sanitize inputs
  const url = SecurityUtils.sanitizeInput(urlInput.value, 2048);
  const username = SecurityUtils.sanitizeInput(usernameInput.value, 255);
  const password = passwordInput.value; // Don't trim passwords

  // Validate URL
  if (!SecurityUtils.isValidUrl(url)) {
    showToast('❌ Invalid URL. Please use a valid https:// or http:// URL');
    return;
  }

  // Validate username length
  if (!SecurityUtils.validateLength(username, 255)) {
    showToast('❌ Username must be between 1 and 255 characters');
    return;
  }

  // Validate password length
  if (!password || password.length === 0 || password.length > 1000) {
    showToast('❌ Password must be between 1 and 1000 characters');
    return;
  }

  const credential = {
    id: Date.now().toString(),
    platform: platformSelect.value,
    url: url,
    username: username,
    password: password
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

  // Clear existing content
  credentialsList.textContent = '';

  if (credentials.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    const icon = document.createElement('div');
    icon.className = 'empty-icon';
    icon.textContent = '📭';

    const text = document.createElement('p');
    text.className = 'empty-text';
    text.textContent = 'No credentials saved yet!';

    const subtext = document.createElement('p');
    subtext.className = 'empty-subtext';
    subtext.textContent = 'Click the ';

    const highlight = document.createElement('span');
    highlight.className = 'highlight';
    highlight.textContent = '+';

    subtext.appendChild(highlight);
    subtext.appendChild(document.createTextNode(' button above to add your first login.'));

    emptyState.appendChild(icon);
    emptyState.appendChild(text);
    emptyState.appendChild(subtext);
    credentialsList.appendChild(emptyState);
    return;
  }

  // Add header
  const title = document.createElement('h2');
  title.className = 'list-title';
  title.textContent = 'Saved Credentials';
  credentialsList.appendChild(title);

  // Add credential cards
  credentials.forEach(cred => {
    const card = createCredentialCard(cred);
    credentialsList.appendChild(card);
  });

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

// Create credential card DOM element (safe from XSS)
function createCredentialCard(credential) {
  const maskedPassword = '•'.repeat(12);
  const urlDisplay = credential.url.replace(/^https?:\/\//, '');
  const platformIcon = getPlatformIcon(credential.platform || 'salesforce');
  const platformName = credential.platform ?
    credential.platform.charAt(0).toUpperCase() + credential.platform.slice(1) :
    'Salesforce';

  // Create main container
  const item = document.createElement('div');
  item.className = 'credential-item';
  item.dataset.id = credential.id;
  item.dataset.platform = credential.platform || 'salesforce';

  // Create header
  const header = document.createElement('div');
  header.className = 'credential-header';

  const icon = document.createElement('span');
  icon.className = 'credential-icon';
  icon.textContent = platformIcon;

  const info = document.createElement('div');
  info.className = 'credential-info';

  const platform = document.createElement('div');
  platform.className = 'credential-platform';
  platform.textContent = platformName;

  const url = document.createElement('div');
  url.className = 'credential-url';
  url.textContent = urlDisplay;

  const username = document.createElement('div');
  username.className = 'credential-username';
  username.textContent = credential.username; // Safe - textContent auto-escapes

  info.appendChild(platform);
  info.appendChild(url);
  info.appendChild(username);

  header.appendChild(icon);
  header.appendChild(info);

  // Create password display
  const password = document.createElement('div');
  password.className = 'credential-password';
  password.textContent = maskedPassword;

  // Create actions
  const actions = document.createElement('div');
  actions.className = 'credential-actions';

  const loginBtn = document.createElement('button');
  loginBtn.className = 'btn btn-small btn-login';
  loginBtn.dataset.action = 'login';
  loginBtn.textContent = '🚀 Login';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-small btn-delete';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.textContent = '🗑️ Delete';

  actions.appendChild(loginBtn);
  actions.appendChild(deleteBtn);

  // Assemble card
  item.appendChild(header);
  item.appendChild(password);
  item.appendChild(actions);

  return item;
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

  // Send login request to background service worker
  chrome.runtime.sendMessage({
    action: 'performLogin',
    credential: credential
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
