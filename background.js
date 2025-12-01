console.log('🔐 Keychain Background: Service worker started');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Keychain Background: Received message:', message);

    if (message.action === 'performLogin') {
        performLogin(message.credential);
        sendResponse({ success: true });
    }

    return true; // Keep channel open for async response
});

// Perform auto-login
async function performLogin(credential) {
    console.log('Keychain Background: Starting login process for:', credential.platform);

    try {
        // Store credentials temporarily in local storage for content script to use
        await chrome.storage.local.set({
            pendingAutofill: {
                username: credential.username,
                password: credential.password,
                timestamp: Date.now()
            }
        });

        console.log('Keychain Background: Credentials stored in local storage');

        // Open login page in new tab
        const tab = await chrome.tabs.create({ url: credential.url });
        console.log('Keychain Background: New tab created with ID:', tab.id);

        // Wait for tab to load, then inject content script
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            console.log('Keychain Background: Tab update - tabId:', tabId, 'status:', changeInfo.status);

            if (tabId === tab.id && changeInfo.status === 'complete') {
                console.log('Keychain Background: Target tab loaded, removing listener');
                chrome.tabs.onUpdated.removeListener(listener);

                console.log('Keychain Background: Injecting content script...');

                // Inject content script file
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }).then((results) => {
                    console.log('Keychain Background: Content script injected successfully', results);
                }).catch(err => {
                    console.error('Keychain Background: Failed to inject content script:', err);
                });
            }
        });
    } catch (error) {
        console.error('Keychain Background: Error during login:', error);
    }
}
