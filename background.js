// Set a flag to check if onActivated event is triggered.
let updatedEventTriggered = false;      
function onActivatedListener() {
    updatedEventTriggered = true;
}
browser.tabs.onActivated.addListener(onActivatedListener);

browser.browserAction.onClicked.addListener((tab) => {
    browser.storage.local.set({ senderURL: tab.url }).then( () => {
        browser.runtime.openOptionsPage();
    });
});

// Listener to close or create tabs.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeTab') {
        browser.storage.local.set({ lastClosedTabURL: sender.tab.url }).then( () => {
            browser.tabs.remove(sender.tab.id);
        });
        setTimeout(function() {
            if (!updatedEventTriggered) {
                // Run if onActivated event was not triggered.
                browser.tabs.create({ url: message.url });
            };
        }, 300);
        updatedEventTriggered = false;
    } else if (message.action === 'updateTab') {
        browser.tabs.update(sender.tab.id, { url: message.url });
    } else if (message.action === 'createTab') {
        browser.tabs.create({ url: message.url });
    } else if (message.action === 'duplicateTab') {
        browser.tabs.create({ url: message.url, active: false });
    } else if (message.action === 'goBack') {
        browser.tabs.goBack(sender.tab.id);
    } else if (message.action === 'goForward') {
        browser.tabs.goForward(sender.tab.id);
    } else if (message.action === 'reload') {
        browser.tabs.reload(sender.tab.id, { bypassCache: true });
    } else if (message.action === 'openSettings') {
        browser.storage.local.set({ senderURL: sender.tab.url }).then( () => {
            browser.runtime.openOptionsPage();
        });
    } else if (message.action === 'resetSettings') {
        resetSettingsToDefault().then(() => {
            sendResponse({ success: true });
        });
        return true;
    } else if (message.action === 'undoCloseTab') {
        browser.storage.local.get('lastClosedTabURL').then((result) => {
            if (result.lastClosedTabURL && result.lastClosedTabURL.length > 0) {
                result.lastClosedTabURL.forEach(url => {
                    browser.tabs.create({ url: url });
                });
                browser.storage.local.remove('lastClosedTabURL');
            }
        });
    } else if (message.action === 'closeAllTabs') {
        browser.tabs.query({}, function(tabs) {
            const closedTabURLs = tabs.map(tab => tab.url);
            browser.storage.local.set({ lastClosedTabURL: closedTabURLs }).then(() => {
                const tabIds = tabs.map(tab => tab.id);
                browser.tabs.remove(tabIds);
            });
        });
        setTimeout(function() {
            if (!updatedEventTriggered) {
                // Run if onActivated event was not triggered.
                browser.tabs.create({ url: message.url });
            };
        }, 1000);
        updatedEventTriggered = false;
    } else if (message.action === 'closeOtherTabs') {
        browser.tabs.query({}, function(tabs) {
            const tabsToClose = tabs.filter(tab => tab.id !== sender.tab.id);
            const closedTabURLs = tabsToClose.map(tab => tab.url);        
            browser.storage.local.set({ lastClosedTabURL: closedTabURLs }).then(() => {
                const tabIds = tabsToClose.map(tab => tab.id);
                browser.tabs.remove(tabIds);
            });
        });
    };
});

// Define the default values.
const defaultVariables = {
    homepageURL: 'https://web.tabliss.io',
    newTabURL: 'https://web.tabliss.io',
    toolbarHeight: '42',
    toolbarTransparency: '0.8',
    defaultPosition: 'bottom',
    iconTheme: 'heroIcons',
    hideMethod: 'scroll',
    buttonsInToolbarDiv: 6,
    buttonOrder: [
        'homeButton',
        'duplicateTabButton',
        'moveToolbarButton',
        'closeTabButton',
        'newTabButton',
        'menuButton',
        'hideButton',
        'undoCloseTabButton',
        'closeOtherTabsButton',
        'settingsButton',
        'goBackButton',
        'goForwardButton',
        'reloadButton',
        'scrollTopButton',
        'scrollBottomButton',
        'closeAllTabsButton',
    ],
    checkboxStates: {
        'homeButton': true,
        'duplicateTabButton': true,
        'hideButton': true,
        'closeTabButton': true,
        'newTabButton': true,
        'menuButton': true,
        'moveToolbarButton': true,
        'undoCloseTabButton': true,
        //'devToolsButton': true,
        'closeOtherTabsButton': true,
        'settingsButton': true,
        'goBackButton': false,
        'goForwardButton': false,
        'reloadButton': false,
        'scrollTopButton': false,
        'scrollBottomButton': false,
        'closeAllTabsButton': false
    },
};

const settingsToCheck = [
    'homepageURL',
    'newTabURL',
    'toolbarHeight',
    'toolbarTransparency',
    'defaultPosition',
    'iconTheme',
    'hideMethod',
    'buttonOrder',
    'checkboxStates',
    'buttonsInToolbarDiv'
];

browser.storage.sync.get(settingsToCheck).then((result) => {
    settingsToCheck.forEach((setting) => {
        if (!result[setting]) {
            const defaultValue = defaultVariables[setting];            
            if (setting === 'buttonsInToolbarDiv') {
                const trueCheckboxesCount = Object.values(result.checkboxStates || {}).filter(state => state === true).length;
                const calculatedValue = trueCheckboxesCount || defaultValue;
                browser.storage.sync.set({ [setting]: calculatedValue });
            } else {
                browser.storage.sync.set({ [setting]: defaultValue });
            }
        }
    });
    // Check and append missing elements to the buttonOrder array
    if (result.buttonOrder && result.buttonOrder.length !== defaultVariables.buttonOrder.length) {
        const updatedButtonOrder = defaultVariables.buttonOrder.filter(item => !result.buttonOrder.includes(item));
        browser.storage.sync.set({ buttonOrder: result.buttonOrder.concat(updatedButtonOrder) });
    }
    // Check and append missing elements to the checkboxStates array
    if (result.checkboxStates && Object.keys(result.checkboxStates).length !== Object.keys(defaultVariables.checkboxStates).length) {
        const existingCheckboxStates = result.checkboxStates || {};
        const addedItems = Object.keys(defaultVariables.checkboxStates).filter(key => !(key in existingCheckboxStates));
        // Set added items to false
        const updatedCheckboxStates = { ...existingCheckboxStates, ...Object.fromEntries(addedItems.map(item => [item, false])) };
        browser.storage.sync.set({ checkboxStates: updatedCheckboxStates });
    }    
});

function resetSettingsToDefault() {
    return browser.storage.sync.set(defaultVariables);
}

function handleInstallOrUpdate(details) {
    if (details.reason === 'install') {
        browser.storage.local.set({ disableUpdatesMsg: false, installedOrUpdated: true }).then( () => {
            browser.runtime.openOptionsPage();  
        })
    } else if (details.reason === 'update') {
        browser.storage.local.get('disableUpdatesMsg').then( (result) => {
            if (result.disableUpdatesMsg === false || !result.disableUpdatesMsg) {
                browser.storage.local.set({ installedOrUpdated: true }).then( () => {
                    browser.runtime.openOptionsPage();  
                })
            }
        })
    }
}

browser.runtime.onInstalled.addListener(handleInstallOrUpdate);


