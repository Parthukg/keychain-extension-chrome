// Check if there's a pending autofill request
chrome.storage.local.get(['pendingAutofill'], (result) => {
    if (result.pendingAutofill) {
        const { username, password, timestamp } = result.pendingAutofill;

        // Check if the request is recent (within 10 seconds)
        const age = Date.now() - timestamp;
        if (age < 10000) {
            autofillAndSubmit(username, password);

            // Clear the pending autofill immediately for security
            chrome.storage.local.remove(['pendingAutofill']);
        } else {
            // Request is too old, clear it
            chrome.storage.local.remove(['pendingAutofill']);
        }
    }
});

// Auto-fill and submit Salesforce login form
function autofillAndSubmit(username, password) {
    // Wait a bit for the page to fully render
    setTimeout(() => {
        // Try multiple selectors for Salesforce login forms
        const usernameSelectors = [
            '#username',
            'input[name="username"]',
            'input[type="email"]',
            'input[id*="username"]',
            'input[name*="username"]'
        ];

        const passwordSelectors = [
            '#password',
            'input[name="pw"]',
            'input[type="password"]',
            'input[id*="password"]',
            'input[name*="password"]'
        ];

        const submitSelectors = [
            '#Login',
            'input[type="submit"]',
            'input[name="Login"]',
            'button[type="submit"]',
            'input[id*="login"]',
            'button[id*="login"]'
        ];

        // Find username field
        let usernameField = null;
        for (const selector of usernameSelectors) {
            usernameField = document.querySelector(selector);
            if (usernameField) break;
        }

        // Find password field
        let passwordField = null;
        for (const selector of passwordSelectors) {
            passwordField = document.querySelector(selector);
            if (passwordField) break;
        }

        // Find submit button
        let submitButton = null;
        for (const selector of submitSelectors) {
            submitButton = document.querySelector(selector);
            if (submitButton) break;
        }

        // Fill the form
        if (usernameField && passwordField) {
            // Set values
            usernameField.value = username;
            passwordField.value = password;

            // Trigger input events to ensure form validation
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            usernameField.dispatchEvent(new Event('change', { bubbles: true }));
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));

            // Clear credentials from memory
            username = null;
            password = null;

            // Submit the form
            if (submitButton) {
                setTimeout(() => {
                    submitButton.click();
                }, 500);
            } else {
                // Try to find and submit the form directly
                const form = usernameField.closest('form');
                if (form) {
                    setTimeout(() => {
                        form.submit();
                    }, 500);
                }
            }
        }
    }, 1000);
}
