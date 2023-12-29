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
browser.runtime.onMessage.addListener((message, sender) => {
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
        resetSettingsToDefault();
    } else if (message.action === 'undoCloseTab') {
        browser.storage.local.get('lastClosedTabURL').then( (result) => {
            if (result.lastClosedTabURL) {
                browser.tabs.create({ url: result.lastClosedTabURL });
                browser.storage.local.remove('lastClosedTabURL');
            }
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
    //buttonsInToolbarDiv: 6,
    buttonOrder: [
        'homeButton',
        'duplicateTabButton',
        'hideButton',
        'moveToolbarButton',
        'closeTabButton',
        'undoCloseTabButton',
        'newTabButton',
        'goBackButton',
        'goForwardButton',
        'reloadButton',
        'settingsButton'
    ],
    checkboxStates: {
        'homeButton': true,
        'duplicateTabButton': true,
        //'menuButton': true,
        'closeTabButton': true,
        'undoCloseTabButton': false,
        'newTabButton': true,
        'hideButton': true,
        'moveToolbarButton': true,
        //'devToolsButton': true,
        'goBackButton': false,
        'goForwardButton': false,
        'reloadButton': false,
        'settingsButton': false,
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
    'checkboxStates'
];

browser.storage.sync.get(settingsToCheck).then((result) => {
    settingsToCheck.forEach((setting) => {
        if (!result[setting]) {
            const defaultValue = defaultVariables[setting];
            browser.storage.sync.set({ [setting]: defaultValue });
        }
    });
    // Check and append missing elements to the buttonOrder array
    if (result.buttonOrder && result.buttonOrder.length !== defaultVariables.buttonOrder.length) {
        const updatedButtonOrder = defaultVariables.buttonOrder.filter(item => !result.buttonOrder.includes(item));
        browser.storage.sync.set({ buttonOrder: result.buttonOrder.concat(updatedButtonOrder) });
    }
    // Check and append missing elements to the checkboxStates array
    if (result.checkboxStates && Object.keys(result.checkboxStates).length !== Object.keys(defaultVariables.checkboxStates).length) {
        const updatedCheckboxStates = { ...defaultVariables.checkboxStates, ...result.checkboxStates };
        browser.storage.sync.set({ checkboxStates: updatedCheckboxStates });
    }
});

function resetSettingsToDefault() {
    browser.storage.sync.set(defaultVariables);
}

