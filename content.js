console.log('Keychain: Content script loaded');

// Check if there's a pending autofill request
chrome.storage.local.get(['pendingAutofill'], (result) => {
    if (result.pendingAutofill) {
        console.log('Keychain: Found pending autofill request');
        const { username, password, timestamp } = result.pendingAutofill;

        // Check if the request is recent (within 10 seconds)
        const age = Date.now() - timestamp;
        if (age < 10000) {
            console.log('Keychain: Request is recent, proceeding with autofill');
            autofillAndSubmit(username, password);

            // Clear the pending autofill
            chrome.storage.local.remove(['pendingAutofill']);
        } else {
            console.log('Keychain: Request is too old, ignoring');
            chrome.storage.local.remove(['pendingAutofill']);
        }
    } else {
        console.log('Keychain: No pending autofill request found');
    }
});

// Auto-fill and submit Salesforce login form
function autofillAndSubmit(username, password) {
    console.log('Keychain: Starting autofill process');

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
            if (usernameField) {
                console.log('Keychain: Found username field with selector:', selector);
                break;
            }
        }

        // Find password field
        let passwordField = null;
        for (const selector of passwordSelectors) {
            passwordField = document.querySelector(selector);
            if (passwordField) {
                console.log('Keychain: Found password field with selector:', selector);
                break;
            }
        }

        // Find submit button
        let submitButton = null;
        for (const selector of submitSelectors) {
            submitButton = document.querySelector(selector);
            if (submitButton) {
                console.log('Keychain: Found submit button with selector:', selector);
                break;
            }
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

            console.log('Keychain: Fields filled successfully');
            console.log('Keychain: Username length:', username.length);
            console.log('Keychain: Password length:', password.length);

            // Submit the form
            if (submitButton) {
                console.log('Keychain: Attempting to click submit button...');
                setTimeout(() => {
                    submitButton.click();
                    console.log('Keychain: Submit button clicked');
                }, 500);
            } else {
                // Try to find and submit the form directly
                const form = usernameField.closest('form');
                if (form) {
                    console.log('Keychain: Attempting to submit form...');
                    setTimeout(() => {
                        form.submit();
                        console.log('Keychain: Form submitted');
                    }, 500);
                } else {
                    console.error('Keychain: No submit button or form found');
                }
            }

            console.log('Keychain: Auto-fill completed');
        } else {
            console.error('Keychain: Could not find login form fields');
            console.error('Keychain: Username field found:', !!usernameField);
            console.error('Keychain: Password field found:', !!passwordField);
        }
    }, 1000);
}
