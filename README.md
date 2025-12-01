# Keychain - Credential Manager

A premium Chrome extension for securely managing and auto-logging into your Salesforce accounts.

## Features

- 🔐 **Secure Local Storage**: Credentials stored locally using Chrome's encrypted sync storage
- ⚡ **One-Click Auto-Login**: Instantly log in to Salesforce (Production & Sandbox)
- 🎨 **Premium Dark UI**: Modern glassmorphism design with cyberpunk aesthetics
- 🔄 **Smart Environment Selector**: Automatically switch between Production and Sandbox URLs
- 🛡️ **Privacy First**: No data collection, no external servers, fully offline

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](#) (coming soon)
2. Click "Add to Chrome"
3. Grant the required permissions

### Manual Installation (Developer Mode)
1. Download `keychain-extension-v3.0.6.zip` from releases
2. Extract the zip file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked"
6. Select the extracted folder

## Usage

1. Click the Keychain icon in your Chrome toolbar
2. Click the `+` button to add a new credential
3. Select platform (Salesforce), environment (Production/Sandbox), and enter your credentials
4. Click "Save Credential"
5. To login, simply click the "Login" button next to any saved credential

## Permissions

- **storage**: Save credentials locally
- **activeTab**: Detect current page URL
- **scripting**: Auto-fill login forms
- **tabs**: Open login pages in new tabs
- **host_permissions**: Access Salesforce domains for auto-login

## Privacy

Keychain does not collect, transmit, or sell any user data. All credentials are stored locally on your device using Chrome's encrypted sync storage. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Version

Current version: **3.0.6**

## License

MIT License - See LICENSE file for details

## Support

For issues or feature requests, please use the Chrome Web Store support tab or create an issue on GitHub.
