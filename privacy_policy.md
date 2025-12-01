# Privacy Policy for Keychain

**Last Updated: November 29, 2025**

## 1. Introduction
Keychain ("we", "our", or "us") is a Chrome extension designed to help users manage their Salesforce and other platform credentials securely. We are committed to protecting your privacy. This Privacy Policy explains how we handle your data.

## 2. Data Collection and Usage
**We do not collect, transmit, or sell your personal data.**

### 2.1. Local Storage
All credentials (usernames, passwords, and URLs) that you save within Keychain are stored locally on your device using the `chrome.storage.sync` API.
*   **Encrypted Sync**: If you are signed in to Chrome, this data may be synced across your devices by Google's encrypted sync service.
*   **No External Servers**: We (the developers) do not operate any servers to receive or store your data. Your data never leaves your browser environment except via Chrome's own secure sync mechanism.

### 2.2. Permissions
Keychain requires specific permissions to function:
*   **Storage**: To save your credentials locally.
*   **Host Permissions**: To detect when you are on a login page (e.g., `salesforce.com`) and to autofill your credentials when you request it.
*   **Scripting**: To perform the auto-login action.

## 3. Third-Party Services
Keychain does not use any third-party analytics, tracking tools, or advertising networks.

## 4. Changes to This Policy
We may update this Privacy Policy from time to time. If we make significant changes, we will notify users through an update to the extension.

## 5. Contact Us
If you have any questions about this Privacy Policy, please contact the developer via the Chrome Web Store support tab.
