//
// Define the default values
//
const settingsURL = browser.runtime.getURL('pages/settings.html')
const blankURL = browser.runtime.getURL('pages/blank.html')
const homepageURL = browser.runtime.getURL('pages/homepage.html')
const defaultVariables = {
    homepageURL: 'https://web.tabliss.io/',
    newTabURL: 'https://web.tabliss.io/',
    toolbarHeight: 42,
    toolbarTransparency: 0.8,
    defaultPosition: 'bottom',
    theme: 'auto',
    iconTheme: 'heroIcons',
    hideMethod: 'scroll',
    buttonsInToolbarDiv: 6,
    buttonOrder: [
        'homeButton',
        'duplicateTabButton',
        'hideButton',
        'closeTabButton',
        'newTabButton',
        'menuButton',
        'toggleDesktopSiteButton',
        'openWithButton',
        'undoCloseTabButton',
        'closeAllTabsButton',
        'closeOtherTabsButton',
        'settingsButton',
        'goBackButton',
        'goForwardButton',
        'reloadButton',
        'scrollTopButton',
        'scrollBottomButton',
        'moveToolbarButton',
    ],
    checkboxStates: {
        homeButton: true,
        duplicateTabButton: true,
        hideButton: true,
        closeTabButton: true,
        newTabButton: true,
        menuButton: true,
        toggleDesktopSiteButton: true,
        openWithButton: true,
        undoCloseTabButton: true,
        closeAllTabsButton: true,
        closeOtherTabsButton: true,
        settingsButton: true,
        goBackButton: false,
        goForwardButton: false,
        reloadButton: false,
        scrollTopButton: false,
        scrollBottomButton: false,
        moveToolbarButton: false,
    },
}
const settingsToCheck = [
    'homepageURL',
    'newTabURL',
    'toolbarHeight',
    'toolbarTransparency',
    'defaultPosition',
    'theme',
    'iconTheme',
    'hideMethod',
    'buttonOrder',
    'checkboxStates',
    'buttonsInToolbarDiv',
]

browser.storage.local.get('isDesktopSite').then((result) => {
    if (result.isDesktopSite) {
        browser.webRequest.onBeforeSendHeaders.addListener(
            rewriteUserAgentHeader,
            { urls: ['*://*/*'] },
            ['blocking', 'requestHeaders']
        )
    }
})

//
// Listeners
//
let updatedEventTriggered

function handleInstallOrUpdate(details) {
    if (details.reason === 'install') {
        setSettingsValues()
        browser.storage.local
            .set({ disableUpdatesMsg: false, installedOrUpdated: true })
            .then(() => {
                browser.runtime.openOptionsPage()
            })
    } else if (details.reason === 'update') {
        setSettingsValues()
        browser.storage.local.get('disableUpdatesMsg').then((result) => {
            if (!result.disableUpdatesMsg) {
                browser.storage.local
                    .set({ installedOrUpdated: true })
                    .then(() => {
                        browser.runtime.openOptionsPage()
                    })
            }
        })
    }
}

browser.tabs.onActivated.addListener(function () {
    updatedEventTriggered = true
})

browser.runtime.onInstalled.addListener(handleInstallOrUpdate)

browser.browserAction.onClicked.addListener((tab) => {
    browser.storage.local.set({ senderURL: tab.url }).then(() => {
        browser.runtime.openOptionsPage()
    })
})

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'closeTab':
            browser.storage.local
                .set({ lastClosedTabURL: sender.tab.url })
                .then(() => {
                    browser.tabs.remove(sender.tab.id)
                })
            setTimeout(function () {
                if (!updatedEventTriggered) {
                    browser.tabs.create({ url: message.url })
                }
            }, 1000)
            updatedEventTriggered = false
            break
        case 'updateTab':
            browser.tabs.update(sender.tab.id, { url: message.url })
            break
        case 'createTab':
            browser.tabs.create({ url: message.url })
            break
        case 'duplicateTab':
            browser.tabs.create({ url: message.url, active: false })
            break
        case 'goBack':
            browser.tabs.goBack(sender.tab.id)
            break
        case 'goForward':
            browser.tabs.goForward(sender.tab.id)
            break
        case 'reload':
            browser.tabs.reload(sender.tab.id, { bypassCache: true })
            break
        case 'openSettings':
            browser.storage.local
                .set({ senderURL: sender.tab.url })
                .then(() => {
                    browser.runtime.openOptionsPage()
                })
            break
        case 'resetSettings':
            resetSettingsToDefault().then(() => {
                sendResponse({ success: true })
            })
            return true
        case 'undoCloseTab':
            browser.storage.local.get('lastClosedTabURL').then((result) => {
                if (result.lastClosedTabURL) {
                    let urls = Array.isArray(result.lastClosedTabURL)
                        ? result.lastClosedTabURL
                        : [result.lastClosedTabURL]
                    if (urls.length > 0) {
                        urls.forEach((url) => {
                            browser.tabs.create({ url: url })
                        })
                        browser.storage.local.remove('lastClosedTabURL')
                    }
                }
            })
            break
        case 'closeAllTabs':
            browser.tabs.query({}, function (tabs) {
                const closedTabURLs = tabs.map((tab) => tab.url)
                browser.storage.local
                    .set({ lastClosedTabURL: closedTabURLs })
                    .then(() => {
                        const tabIds = tabs.map((tab) => tab.id)
                        browser.tabs.remove(tabIds)
                    })
            })
            setTimeout(function () {
                if (!updatedEventTriggered) {
                    browser.tabs.create({ url: message.url })
                }
            }, 1000)
            updatedEventTriggered = false
            break
        case 'closeOtherTabs':
            browser.tabs.query({}, function (tabs) {
                const tabsToClose = tabs.filter(
                    (tab) => tab.id !== sender.tab.id
                )
                const closedTabURLs = tabsToClose.map((tab) => tab.url)
                browser.storage.local
                    .set({ lastClosedTabURL: closedTabURLs })
                    .then(() => {
                        const tabIds = tabsToClose.map((tab) => tab.id)
                        browser.tabs.remove(tabIds)
                    })
            })
            break
        case 'toggleDesktopSite':
            browser.storage.local.get('isDesktopSite').then((result) => {
                if (result.isDesktopSite) {
                    browser.webRequest.onBeforeSendHeaders.addListener(
                        rewriteUserAgentHeader,
                        { urls: ['*://*/*'] },
                        ['blocking', 'requestHeaders']
                    )
                } else {
                    browser.webRequest.onBeforeSendHeaders.removeListener(
                        rewriteUserAgentHeader
                    )
                }
                browser.tabs.reload(sender.tab.id, { bypassCache: true })
                browser.tabs.query(
                    { url: ['*://*/*', settingsURL, blankURL] },
                    function (tabs) {
                        for (const tab of tabs) {
                            if (tab.id !== sender.tab.id) {
                                browser.tabs.sendMessage(tab.id, {
                                    action: 'reloadToolbar',
                                })
                            }
                        }
                    }
                )
            })
            break
    }
})

//
// Functions
//
function setSettingsValues() {
    browser.storage.sync.get(settingsToCheck).then((result) => {
        settingsToCheck.forEach((setting) => {
            if (!result[setting]) {
                const defaultValue = defaultVariables[setting]
                if (setting === 'buttonsInToolbarDiv') {
                    const trueCheckboxesCount = Object.values(
                        result.checkboxStates || {}
                    ).filter((state) => state === true).length
                    const calculatedValue = trueCheckboxesCount || defaultValue
                    browser.storage.sync.set({ [setting]: calculatedValue })
                } else {
                    browser.storage.sync.set({ [setting]: defaultValue })
                }
            }
        })
        // Check and append missing elements to the buttonOrder array
        if (
            result.buttonOrder &&
            result.buttonOrder.length !== defaultVariables.buttonOrder.length
        ) {
            const updatedButtonOrder = defaultVariables.buttonOrder.filter(
                (item) => !result.buttonOrder.includes(item)
            )
            browser.storage.sync.set({
                buttonOrder: result.buttonOrder.concat(updatedButtonOrder),
            })
        }
        // Check and append missing elements to the checkboxStates array
        if (
            result.checkboxStates &&
            Object.keys(result.checkboxStates).length !==
                Object.keys(defaultVariables.checkboxStates).length
        ) {
            const existingCheckboxStates = result.checkboxStates || {}
            const addedItems = Object.keys(
                defaultVariables.checkboxStates
            ).filter((key) => !(key in existingCheckboxStates))
            // Set added items to false
            const updatedCheckboxStates = {
                ...existingCheckboxStates,
                ...Object.fromEntries(addedItems.map((item) => [item, false])),
            }
            browser.storage.sync.set({ checkboxStates: updatedCheckboxStates })
        }
    })
}

function resetSettingsToDefault() {
    browser.storage.local.set({ isDesktopSite: false })
    browser.webRequest.onBeforeSendHeaders.removeListener(
        rewriteUserAgentHeader
    )
    return browser.storage.sync.set(defaultVariables)
}

function rewriteUserAgentHeader(e) {
    for (const header of e.requestHeaders) {
        if (header.name.toLowerCase() === 'user-agent') {
            const firefoxVersion = header.value.split('/').pop()
            if (!isNaN(firefoxVersion) && firefoxVersion > 120) {
                const uaGenerated =
                    'Mozilla/5.0 (X11; Linux x86_64; rv:' +
                    firefoxVersion +
                    ') Gecko/20100101 Firefox/' +
                    firefoxVersion
                header.value = uaGenerated
            } else {
                const uaFallback =
                    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
                header.value = uaFallback
            }
        }
    }
    return { requestHeaders: e.requestHeaders }
}
