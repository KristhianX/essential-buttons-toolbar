//
// Variables
//
const settingsURL = browser.runtime.getURL('pages/settings.html')
const blankURL = browser.runtime.getURL('pages/blank.html')
const essHomepageURL = browser.runtime.getURL('pages/homepage.html')
const divHomepageURL = document.getElementById('customHomepageURL')
const divNewTabURL = document.getElementById('customNewTabURL')
const setHomepageSelect = document.getElementById('setHomepage')
const setNewTabSelect = document.getElementById('setNewTab')
const homepageURLInput = document.getElementById('homepageURL')
const newTabURLInput = document.getElementById('newTabURL')
const toolbarHeightRangeInput = document.getElementById('toolbarHeight')
const toolbarWidthRangeInput = document.getElementById('toolbarWidth')
const toolbarTransparencyRangeInput = document.getElementById(
    'toolbarTransparency'
)
const topBottomMarginRangeInput = document.getElementById('topBottomMargin')
const defaultPositionSelect = document.getElementById('defaultPosition')
const themeSelect = document.getElementById('theme')
const iconThemeSelect = document.getElementById('iconTheme')
const hideMethodSelect = document.getElementById('hideMethod')
const previewButtons = document.querySelectorAll('.preview-button')
const customUrlInput = document.getElementById('customUrl')
const excludedUrlsList = document.getElementById('excludedUrls')
const version = browser.runtime.getManifest().version
let currentlyDisplayedDescription
const addonInfoCloseButton = document.getElementById('addonInfoCloseButton')
const checkbox = document.getElementById('disableUpdatesMsg')

//
// Setup conditions
//
browser.storage.local
    .get(['senderURL', 'installedOrUpdated', 'disableUpdatesMsg'])
    .then((result) => {
        if (result.senderURL) {
            customUrlInput.value = result.senderURL
            browser.storage.local.remove('senderURL')
        } else {
            customUrlInput.value = window.location.href
        }
        if (result.installedOrUpdated === true) {
            headerInfo.style.display = 'none'
            addonInfo.style.display = 'block'
            browser.storage.local.set({ installedOrUpdated: false })
        }
        if (result.disableUpdatesMsg) {
            const isChecked = result.disableUpdatesMsg
            checkbox.checked = isChecked
        }
    })

//
// Load the values from storage
//
function loadValues() {
    // Remove existing li elements
    const liElements = excludedUrlsList.querySelectorAll('li')
    liElements.forEach((li) => {
        li.remove()
    })
    browser.storage.sync
        .get([
            'setHomepage',
            'setNewTab',
            'homepageURL',
            'newTabURL',
            'toolbarHeight',
            'toolbarWidth',
            'topBottomMargin',
            'defaultPosition',
            'theme',
            'iconTheme',
            'hideMethod',
            'excludedUrls',
            'buttonOrder',
            'checkboxStates',
            'toolbarTransparency',
            'buttonsInToolbarDiv'
        ])
        .then((result) => {
            setHomepageSelect.value = result.setHomepage
            setNewTabSelect.value = result.setNewTab
            homepageURLInput.value = result.homepageURL
            newTabURLInput.value = result.newTabURL
            currentValueHeight.textContent = result.toolbarHeight
            toolbarHeightRangeInput.value = result.toolbarHeight
            currentValueWidth.textContent = result.toolbarWidth
            toolbarWidthRangeInput.value = result.toolbarWidth
            previewButtons.forEach((previewButton) => {
                previewButton.style.height =
                    result.toolbarHeight / window.visualViewport.scale -
                    4 +
                    'px'
            })
            toolbarContainer.style.width = result.toolbarWidth + 'vw'
            menuContainer.style.width = result.toolbarWidth + 'vw'
            toolbarContainer.style.minHeight =
                result.toolbarHeight / window.visualViewport.scale + 'px'
            menuContainer.style.minHeight =
                result.toolbarHeight / window.visualViewport.scale + 'px'
            currentValueTransparency.textContent = result.toolbarTransparency
            toolbarTransparencyRangeInput.value = result.toolbarTransparency
            currentValueTBMargin.textContent = result.topBottomMargin
            topBottomMarginRangeInput.value = result.topBottomMargin
            defaultPositionSelect.value = result.defaultPosition
            themeSelect.value = result.theme
            iconThemeSelect.value = result.iconTheme
            hideMethodSelect.value = result.hideMethod
            overrideTheme(result.theme)
            displayInputURL()
            updateLabels(result.defaultPosition)
            // Display and append the button elements based on the order
            if (result.buttonOrder && result.checkboxStates) {
                let buttonsAppended = 0
                result.buttonOrder.forEach((buttonId) => {
                    const buttonData = buttonsData.find(
                        (button) => button.id === buttonId
                    )
                    if (buttonData) {
                        const buttonElement = updateButtonIcon(
                            buttonData,
                            result.iconTheme,
                            result.defaultPosition
                        )
                        if (buttonElement) {
                            if (
                                result.checkboxStates[buttonId] &&
                                buttonsAppended < result.buttonsInToolbarDiv
                            ) {
                                toolbarContainer.appendChild(buttonElement)
                                buttonsAppended++
                            } else if (result.checkboxStates[buttonId]) {
                                menuContainer.appendChild(buttonElement)
                            } else {
                                availableContainer.appendChild(buttonElement)
                            }
                        }
                        buttonElement.style.display = 'inline-flex'
                        buttonElement.classList.add('drag-able')
                    }
                })
            }
            if (result.excludedUrls) {
                const excludedUrls = result.excludedUrls || []
                excludedUrls.forEach((url) => {
                    const li = createLiElement(url)
                    excludedUrlsList.appendChild(li)
                })
            }
        })
}

function displayInputURL() {
    divHomepageURL.style.display =
        setHomepageSelect.value === 'custom' ? 'block' : 'none'
    divNewTabURL.style.display =
        setNewTabSelect.value === 'custom' ? 'block' : 'none'
}

function updateLabels(position) {
    if (position === 'top' || position === 'bottom') {
        document.querySelector('label[for="toolbarHeight"]').textContent =
            'Toolbar Height (px):'
        document.querySelector('label[for="toolbarWidth"]').textContent =
            'Toolbar Width (%):'
    } else {
        document.querySelector('label[for="toolbarHeight"]').textContent =
            'Toolbar Width (px):'
        document.querySelector('label[for="toolbarWidth"]').textContent =
            'Toolbar Height (%):'
    }
}

//
// Header info
//
versionHeader.textContent = version
function handleCheckboxChange() {
    const isChecked = checkbox.checked
    browser.storage.local.set({ disableUpdatesMsg: isChecked })
}

checkbox.addEventListener('change', handleCheckboxChange)

browser.storage.local.get('disableUpdatesMsg', function (result) {
    const isChecked = result.disableUpdatesFlag || false
    checkbox.checked = isChecked
})

//
// Help messages
//
homepageURLQuestionMark.addEventListener('click', (e) => {
    e.preventDefault()
    homepageURLInfo.style.display = 'block'
    homepageURLQuestionMark.style.display = 'none'
})
homepageURLCloseButton.addEventListener('click', () => {
    homepageURLInfo.style.display = 'none'
    homepageURLQuestionMark.style.display = 'inline-block'
})
hideMethodQuestionMark.addEventListener('click', (e) => {
    e.preventDefault()
    hideMethodInfo.style.display = 'block'
    hideMethodQuestionMark.style.display = 'none'
})
hideMethodCloseButton.addEventListener('click', () => {
    hideMethodInfo.style.display = 'none'
    hideMethodQuestionMark.style.display = 'inline-block'
})
customUrlQuestionMark.addEventListener('click', (e) => {
    e.preventDefault()
    customUrlInfo.style.display = 'block'
    customUrlQuestionMark.style.display = 'none'
})
customUrlCloseButton.addEventListener('click', () => {
    customUrlInfo.style.display = 'none'
    customUrlQuestionMark.style.display = 'inline-block'
})
buttonsSettingsQuestionMark.addEventListener('click', (e) => {
    e.preventDefault()
    buttonsSettingsInfo.style.display = 'block'
    buttonsSettingsQuestionMark.style.display = 'none'
})
buttonsSettingsCloseButton.addEventListener('click', () => {
    buttonsSettingsInfo.style.display = 'none'
    buttonsSettingsQuestionMark.style.display = 'inline-block'
})
infoCardCloseButton.addEventListener('click', closeButtonInfo)
addonInfoCloseButton.addEventListener('click', () => {
    addonInfo.style.display = 'none'
    headerInfo.style.display = 'inline-flex'
})
headerInfo.addEventListener('click', () => {
    headerInfo.style.display = 'none'
    addonInfo.style.display = 'block'
})

//
// Handle tabs
//
function createTab(tabId, tabText) {
    const tab = document.createElement('div')
    tab.id = tabId
    tab.textContent = tabText
    tab.addEventListener('click', function () {
        showTab(tabId)
    })
    document.getElementById('settingsTabs').appendChild(tab)
}

function showTab(tabId) {
    addonInfo.style.display = 'none'
    headerInfo.style.display = 'inline-flex'
    statusMessage.style.display = 'none'
    generalSettings.style.display = tabId === 'generalTab' ? 'block' : 'none'
    buttonsSettings.style.display = tabId === 'buttonsTab' ? 'block' : 'none'
    excludeSettings.style.display = tabId === 'excludeTab' ? 'block' : 'none'
    generalTab.style.borderColor =
        tabId === 'generalTab'
            ? 'var(--primary-color)'
            : 'var(--background-color)'
    buttonsTab.style.borderColor =
        tabId === 'buttonsTab'
            ? 'var(--primary-color)'
            : 'var(--background-color)'
    excludeTab.style.borderColor =
        tabId === 'excludeTab'
            ? 'var(--primary-color)'
            : 'var(--background-color)'
}

createTab('generalTab', 'General')
createTab('buttonsTab', 'Buttons')
createTab('excludeTab', 'Exclude')

//
// General settings
//
toolbarHeightRangeInput.addEventListener('input', function () {
    const currentValue = toolbarHeightRangeInput.value
    currentValueHeight.textContent = currentValue
})

toolbarWidthRangeInput.addEventListener('input', function () {
    const currentValue = toolbarWidthRangeInput.value
    currentValueWidth.textContent = currentValue
})

toolbarTransparencyRangeInput.addEventListener('input', function () {
    const currentValue = toolbarTransparencyRangeInput.value
    currentValueTransparency.textContent = currentValue
})

topBottomMarginRangeInput.addEventListener('input', function () {
    const currentValue = topBottomMarginRangeInput.value
    currentValueTBMargin.textContent = currentValue
})

setHomepageSelect.addEventListener('input', function () {
    displayInputURL()
})

setNewTabSelect.addEventListener('input', function () {
    displayInputURL()
})

defaultPositionSelect.addEventListener('input', function () {
    updateLabels(defaultPositionSelect.value)
})

//
// Buttons settings
//
const buttonsData = [
    { id: 'homeButton', label: 'Home' },
    { id: 'duplicateTabButton', label: 'Duplicate tab' },
    { id: 'menuButton', label: 'Menu' },
    { id: 'closeTabButton', label: 'Close tab' },
    { id: 'undoCloseTabButton', label: 'Undo close tab(s)' },
    { id: 'newTabButton', label: 'New tab' },
    { id: 'hideButton', label: 'Hide toolbar' },
    { id: 'moveToolbarButton', label: 'Move toolbar' },
    { id: 'goBackButton', label: 'Go back' },
    { id: 'goForwardButton', label: 'Go forward' },
    { id: 'reloadButton', label: 'Reload page' },
    { id: 'settingsButton', label: 'Open add-on settings' },
    { id: 'scrollTopButton', label: 'Scroll page to the top' },
    { id: 'scrollBottomButton', label: 'Scroll page to the bottom' },
    { id: 'pageUpButton', label: 'Page up' },
    { id: 'pageDownButton', label: 'Page down' },
    { id: 'closeAllTabsButton', label: 'Close all tabs' },
    { id: 'closeOtherTabsButton', label: 'Close other tabs' },
    { id: 'toggleDesktopSiteButton', label: 'Toggle desktop site (global)' },
    { id: 'openWithButton', label: 'Open with' },
    { id: 'copyLinkButton', label: 'Copy link' },
    { id: 'addTopSiteButton', label: 'Add to Top Sites' },
    { id: 'shareButton', label: 'Share URL' }
]

function updateButtonIcon(buttonData, iconTheme, defaultPosition) {
    const div = document.querySelector(`#${buttonData.id}`)
    const svgs = div.querySelectorAll('svg')
    if (buttonData.id === 'moveToolbarButton') {
        svgs.forEach((svg) => {
            const chevronClass =
                defaultPosition === 'bottom' ? 'chevron-up' : 'chevron-down'
            if (
                svg.classList.contains(iconTheme) &&
                svg.classList.contains(chevronClass)
            ) {
                svg.style.display = 'block'
            }
        })
    } else {
        svgs.forEach((svg) => {
            if (svg.classList.contains(iconTheme)) {
                svg.style.display = 'block'
            }
        })
    }
    return div
}

function updateButtonOrder() {
    const buttons = Array.from(toolbarContainer.querySelectorAll('.drag-able'))
        .concat(Array.from(menuContainer.querySelectorAll('.drag-able')))
        .concat(Array.from(availableContainer.querySelectorAll('.drag-able')))
    const buttonOrder = buttons.map((button) => button.id)
    return buttonOrder
}

function getCheckboxStates() {
    const buttons = Array.from(toolbarContainer.querySelectorAll('.drag-able'))
        .concat(Array.from(menuContainer.querySelectorAll('.drag-able')))
        .concat(Array.from(availableContainer.querySelectorAll('.drag-able')))
    const checkboxStates = {}
    buttons.forEach((button) => {
        checkboxStates[button.id] =
            toolbarContainer.contains(button) || menuContainer.contains(button)
    })
    return checkboxStates
}

function displayButtonInfo(e) {
    setTimeout(function () {
        if (e.target.classList.contains('is-idle')) {
            closeButtonInfo()
            clickedItem = e.target
            const buttonData = buttonsData.find(
                (button) => button.id === clickedItem.id
            )
            if (buttonData) {
                infoCard.style.display = 'block'
                infoCardTitle.textContent = buttonData.label
                const descriptionDiv = document.getElementById(
                    'infoCardDescription'
                )
                const descriptionDivId = `${clickedItem.id}Description`
                currentlyDisplayedDescription = descriptionDiv.querySelector(
                    `#${descriptionDivId}`
                )
                if (currentlyDisplayedDescription) {
                    currentlyDisplayedDescription.style.display = 'block'
                }
            }
        }
    }, 200)
}

function closeButtonInfo() {
    if (currentlyDisplayedDescription) {
        currentlyDisplayedDescription.style.display = 'none'
        infoCard.style.display = 'none'
    }
}

//
// Exclude settings
//
function createLiElement(url) {
    const li = document.createElement('li')
    const liSpan = document.createElement('span')
    li.appendChild(liSpan)
    liSpan.textContent = url
    const removeButton = document.createElement('button')
    removeButton.classList.add('remove-url')
    removeButton.textContent = 'Remove'
    li.appendChild(removeButton)
    return li
}

function addToExcludedUrls() {
    const urlToAdd = customUrlInput.value
    if (urlToAdd) {
        // Add the URL to the list.
        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || []
            if (excludedUrls.includes(urlToAdd)) return
            excludedUrls.push(urlToAdd)
            browser.storage.sync
                .set({ excludedUrls: excludedUrls })
                .then(() => {
                    sendMessageToTabs()
                    const li = createLiElement(urlToAdd)
                    excludedUrlsList.appendChild(li)
                    customUrlInput.value = ''
                })
        })
    }
}

function removeFromExcludedUrls(e) {
    if (e.target.classList.contains('remove-url')) {
        const urlToRemove = e.target.previousElementSibling.textContent
        const liElement = e.target.parentNode
        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || []
            const updatedUrls = excludedUrls.filter((u) => u !== urlToRemove)
            browser.storage.sync.set({ excludedUrls: updatedUrls }).then(() => {
                liElement.remove()
                sendMessageToTabs()
            })
        })
    }
}

excludedUrlsList.addEventListener('click', removeFromExcludedUrls)

addUrlButton.addEventListener('click', addToExcludedUrls)

excludedUrlsList.addEventListener('click', removeFromExcludedUrls)

//
// Save the values to storage and reload
//
generalSaveButton.addEventListener('click', () => {
    const setHomepage = setHomepageSelect.value
    const setNewTab = setNewTabSelect.value
    const rawHomepageURL = homepageURLInput.value.trim()
    const rawNewTabURL = newTabURLInput.value.trim()
    let defHomepageURL = setSanitizeUrl(rawHomepageURL)
    let defNewTabURL = setSanitizeUrl(rawNewTabURL)
    const toolbarHeight = toolbarHeightRangeInput.value
    const toolbarWidth = toolbarWidthRangeInput.value
    const toolbarTransparency = toolbarTransparencyRangeInput.value
    const topBottomMargin = topBottomMarginRangeInput.value
    const defaultPosition = defaultPositionSelect.value
    const theme = themeSelect.value
    const iconTheme = iconThemeSelect.value
    const hideMethod = hideMethodSelect.value
    if (setHomepage === 'homepage') {
        defHomepageURL = essHomepageURL
    } else if (setHomepage === 'blank') {
        defHomepageURL = blankURL
    }
    if (setNewTab === 'homepage') {
        defNewTabURL = essHomepageURL
    } else if (setNewTab === 'blank') {
        defNewTabURL = blankURL
    }
    browser.storage.sync
        .set({
            setHomepage: setHomepage,
            setNewTab: setNewTab,
            homepageURL: defHomepageURL,
            newTabURL: defNewTabURL,
            toolbarHeight: toolbarHeight,
            toolbarWidth: toolbarWidth,
            toolbarTransparency: toolbarTransparency,
            topBottomMargin: topBottomMargin,
            defaultPosition: defaultPosition,
            theme: theme,
            iconTheme: iconTheme,
            hideMethod: hideMethod
        })
        .then(() => {
            overrideTheme(theme)
            statusMessage.style.display = 'block'
            statusMessage.style.color = 'var(--primary-color)'
            sendMessageToTabs()
            setTimeout(function () {
                statusMessage.style.color = 'var(--text-color)'
            }, 1000)
        })
})

function setSanitizeUrl(url) {
    try {
        const urlObject = new URL(url)
        return urlObject.href // URL is valid, return as-is
    } catch (e) {
        // Invalid URL, add https:// by default
        return `https://${url}`
    }
}

generalResetButton.addEventListener('click', () => {
    const confirmed = window.confirm(
        'Are you sure you want to reset settings to default?'
    )
    if (confirmed) {
        browser.runtime.sendMessage({ action: 'resetSettings' }, (response) => {
            if (response.success) {
                document.querySelectorAll('.is-idle svg').forEach((svg) => {
                    svg.style.display = 'none'
                })
                loadValues()
                sendMessageToTabs()
            }
        })
    }
})

buttonsSaveButton.addEventListener('click', () => {
    const buttonsInToolbarDiv =
        toolbarContainer.querySelectorAll('.drag-able').length
    browser.storage.sync
        .set({
            buttonsInToolbarDiv: buttonsInToolbarDiv,
            buttonOrder: updateButtonOrder(),
            checkboxStates: getCheckboxStates()
        })
        .then(() => {
            statusMessage.style.display = 'block'
            statusMessage.style.color = 'var(--primary-color)'
            sendMessageToTabs()

            setTimeout(function () {
                statusMessage.style.color = 'var(--text-color)'
            }, 1000)
        })
})

function sendMessageToTabs() {
    browser.tabs.query(
        { url: ['*://*/*', settingsURL, blankURL, essHomepageURL] },
        function (tabs) {
            for (const tab of tabs) {
                browser.tabs.sendMessage(tab.id, { action: 'reloadToolbar' })
            }
        }
    )
}

function overrideTheme(theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark')
    document.documentElement.classList.toggle('light-theme', theme === 'light')
}

loadValues()

//
// Tutorial: https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example
//
let containers
let draggableItem
let pointerStartX
let pointerStartY
let items = []
let prevRect = {}
let clientX
let clientY
let isDragging
let pointerOffsetX
let pointerOffsetY

function getAllItems() {
    if (!items?.length) {
        items = Array.from(containers.querySelectorAll('.drag-able'))
    }
    return items
}

function getIdleItems() {
    return getAllItems().filter((item) => item.classList.contains('is-idle'))
}

function setup() {
    containers = document.querySelector('.containers')
    if (!containers) return
    containers.addEventListener('mousedown', dragStart)
    containers.addEventListener('touchstart', dragStart)
    document.addEventListener('mouseup', dragEnd)
    document.addEventListener('touchend', dragEnd)
}

function dragStart(e) {
    if (draggableItem) {
        return
    } else {
        if (e.target.classList.contains('drag-able')) {
            draggableItem = e.target
        }
        if (!draggableItem) return
        displayButtonInfo(e)
        pointerStartX = e.clientX || e.touches[0].clientX
        pointerStartY = e.clientY || e.touches[0].clientY
        disablePageScroll()
        initDraggableItem()
        prevRect = draggableItem.getBoundingClientRect()
        document.addEventListener('mousemove', drag)
        document.addEventListener('touchmove', drag, { passive: false })
    }
}

function disablePageScroll() {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
}

function initDraggableItem() {
    draggableItem.classList.remove('is-idle')
    draggableItem.classList.add('is-draggable')
}

function drag(e) {
    if (!draggableItem) return
    e.preventDefault()
    clientX = e.clientX || e.touches[0].clientX || 0
    clientY = e.clientY || e.touches[0].clientY || 0
    pointerOffsetX = clientX - pointerStartX
    pointerOffsetY = clientY - pointerStartY
    draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`
}

function dragEnd(e) {
    if (!draggableItem) return
    highlightDragged(draggableItem)
    applyNewItemsOrder()
    cleanup()
}

function highlightDragged(item) {
    item.style.outline = '1px solid cornflowerblue'
    setTimeout(() => {
        item.style.outline = 'none'
    }, 1000)
}

function applyNewItemsOrder() {
    if (Math.abs(pointerOffsetX) >= 5 || Math.abs(pointerOffsetY) >= 5) {
        const dropTarget = getDropTargetContainer()
        if (dropTarget) {
            if (
                dropTarget.id === 'menuContainer' &&
                draggableItem.id === 'menuButton'
            ) {
                unsetDraggableItem()
                return
            }
            const draggedRect = draggableItem.getBoundingClientRect()
            const targetItems = dropTarget.querySelectorAll('.is-idle')
            let insertBeforeItem = null
            for (const targetItem of targetItems) {
                const targetRect = targetItem.getBoundingClientRect()
                if (
                    draggedRect.top <= targetRect.bottom &&
                    draggedRect.left <= targetRect.left
                ) {
                    insertBeforeItem = targetItem
                    break
                }
            }
            dropTarget.insertBefore(draggableItem, insertBeforeItem)
        }
    }
    unsetDraggableItem()
}

function getDropTargetContainer() {
    const dropTargets = document.querySelectorAll('.drop-target')
    for (const target of dropTargets) {
        const rect = target.getBoundingClientRect()
        if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
        ) {
            return target
        }
    }
    return null
}

function cleanup() {
    items = []
    clientX = null
    clientY = null
    enablePageScroll()
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('touchmove', drag)
}

function unsetDraggableItem() {
    draggableItem.style.transform = null
    draggableItem.classList.remove('is-draggable')
    draggableItem.classList.add('is-idle')
    draggableItem = null
}

function enablePageScroll() {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
    document.body.style.userSelect = ''
}

setup()
