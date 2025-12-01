// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'performLogin') {
        performLogin(message.credential);
        sendResponse({ success: true });
    }

    return true; // Keep channel open for async response
});

// Perform auto-login
async function performLogin(credential) {
    try {
        // Store credentials temporarily in local storage for content script to use
        await chrome.storage.local.set({
            pendingAutofill: {
                username: credential.username,
                password: credential.password,
                timestamp: Date.now()
            }
        });

        // Open login page in new tab
        const tab = await chrome.tabs.create({ url: credential.url });

        // Wait for tab to load, then inject content script
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);

                // Inject content script file
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }).catch(err => {
                    // Silent fail - don't expose error details
                    console.error('Failed to inject content script');
                });
            }
        });
    } catch (error) {
        console.error('Error during login process');
    }
}
