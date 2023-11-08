// Listener to close or create tabs.
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'closeTab') {
        // Promisify the browser.tabs.query function
        const queryTabs = (url) => new Promise((resolve) => {
            browser.tabs.query({ url }, (tabs) => {
                resolve(tabs);
            });
        });
        // Use Promise.all to query both sets of tabs in parallel
        Promise.all([queryTabs('*://*/*'), queryTabs('moz-extension://*/*')])
        .then(([webTabs, extensionTabs]) => {
            const tabsNumber = webTabs.length + extensionTabs.length;   
            if (tabsNumber > 1) {
                // Close the current tab.
                browser.tabs.remove(sender.tab.id);
            } else {
                // Open a new tab with the specified URL.
                browser.tabs.update(sender.tab.id, { url: message.url });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else if (message.action === 'updateTab') {
        browser.tabs.update(sender.tab.id, { url: message.url });
    } else if (message.action === 'createTab') {
        browser.tabs.create({ url: message.url });
    };
});


// Define the default values.
const defaultVariables = {
    homepageURL: 'https://web.tabliss.io',
    newTabURL: 'https://web.tabliss.io',
    toolbarHeight: '42',
    hideMethod: 'scroll',
};
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'hideMethod']).then((result) => {
    if (!result.homepageURL) {
        browser.storage.sync.set({ homepageURL: defaultVariables.homepageURL });
    };
    if (!result.newTabURL) {
        browser.storage.sync.set({ newTabURL: defaultVariables.newTabURL });
    };
    if (!result.toolbarHeight) {
        browser.storage.sync.set({ toolbarHeight: defaultVariables.toolbarHeight });
    };
    if (!result.hideMethod) {
        browser.storage.sync.set({ hideMethod: defaultVariables.hideMethod });
    };
});


