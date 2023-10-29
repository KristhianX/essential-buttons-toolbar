// Listener to close the current tab.
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "closeTab") {
        // Check if there is more than one tab open
        browser.tabs.query({ windowType: "normal", url: "*://*/*" }, (tabs) => {
        if (tabs.length > 1) {
            // Close the current tab.
            browser.tabs.remove(sender.tab.id);
        } else {
            // Open new tab page.
            browser.tabs.update(sender.tab.id, { url: message.url });
        };
    });
};
});


// Define the default values.
const defaultVariables = {
    variable1: "https://web.tabliss.io",
    variable2: "https://web.tabliss.io",
    variable3: "46",
};
browser.storage.sync.get(['variable1', 'variable2', 'variable3']).then((result) => {
    if (!result.variable1) {
        browser.storage.sync.set({ variable1: defaultVariables.variable1 });
    };
    if (!result.variable2) {
        browser.storage.sync.set({ variable2: defaultVariables.variable2 });
    };
    if (!result.variable3) {
        browser.storage.sync.set({ variable3: defaultVariables.variable3 });
    };
});


