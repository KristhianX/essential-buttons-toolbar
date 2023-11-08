// Listener to close or create tabs.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeTab') {
        // Check if there is more than one tab open
        browser.tabs.query({ active: false }, (tabs) => {
            if (tabs.length >= 1) {
                // Close the current tab.
                browser.tabs.remove(sender.tab.id);
            } else {
                // Open new tab page.
                browser.tabs.update(sender.tab.id, { url: message.url });
            };
        });
    } else if (message.action === 'updateTab') {
        browser.tabs.update(sender.tab.id, { url: message.url });
    } else if (message.action === 'createTab') {
        browser.tabs.create({ url: message.url });
    } else if (message.action === 'debugTabs') {
        const response = {};
        
        browser.tabs.query({ active: false }, (tabs) => {
            response.activeFalse = tabs.length;
            checkDone();
        });
        
        browser.tabs.query({ title: '**' }, (tabs) => {
            response.title = tabs.length;
            checkDone();
        });
        
        browser.tabs.query({ active: false, title: '**' }, (tabs) => {
            response.activeTitle = tabs.length;
            checkDone();
        });
        
        browser.tabs.query({ url: '*://*/*' }, (tabs) => {
        response.url = tabs.length;
        checkDone();
        });
    
        browser.tabs.query({}, (tabs) => {
            response.empty = tabs.length;
            checkDone();
        });
    
        function checkDone() {
            if (Object.keys(response).length === 5) {
                // Once all queries are done, send the response
                sendResponse({ response });
            };
        };
    
        // Return true to indicate that we will send a response asynchronously
        return true;
    };
});


// Define the default values.
const defaultVariables = {
    homepageURL: 'https://web.tabliss.io',
    newTabURL: 'https://web.tabliss.io',
    toolbarHeight: '46',
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


