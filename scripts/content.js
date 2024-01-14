//
// Variables
//
let currentUrl = window.location.href
let iframeHidden
let iframeVisible = true
let menuDivHidden = true
let toolbarIframe
let toolbarDiv
let menuDiv
let menuButtonFlag
let hideMethodInUse
let isThrottled
let prevScrollPos
const settings = {}

//
//  Get settings
//
function getSettingsValues() {
    return new Promise((resolve) => {
        const keys = [
            'homepageURL',
            'newTabURL',
            'toolbarHeight',
            'toolbarTransparency',
            'defaultPosition',
            'iconTheme',
            'hideMethod',
            'excludedUrls',
            'checkboxStates',
            'buttonOrder',
            'buttonsInToolbarDiv',
        ]
        browser.storage.sync.get(keys).then((result) => {
            keys.forEach((key) => {
                settings[key] = result[key]
            })
            resolve()
        })
    })
}

//
// Toolbar
//
function appendToolbar() {
    return new Promise((resolve) => {
        if (document.body) {
            appendToolbarAndResolve(resolve)
        } else {
            const observer = new MutationObserver(() => {
                if (document.body) {
                    observer.disconnect()
                    appendToolbarAndResolve(resolve)
                }
            })
            observer.observe(document, { childList: true })
        }
    })
}

function appendToolbarAndResolve(resolve) {
    toolbarIframe = document.createElement('iframe')
    toolbarIframe.src = browser.runtime.getURL('pages/toolbar.html')
    toolbarIframe.setAttribute('id', 'essBtnsToolbar')
    toolbarIframe.style =
        'display: block; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 0; background: transparent; color-scheme: light; border-radius: 0'
    document.body.insertAdjacentElement('afterend', toolbarIframe)
    function handleToolbarLoad() {
        const iframeDocument = toolbarIframe.contentWindow.document
        toolbarDiv = iframeDocument.createElement('div')
        menuDiv = iframeDocument.createElement('div')
        iframeDocument.body.appendChild(toolbarDiv)
        iframeDocument.body.appendChild(menuDiv)
        styleToolbar()
        window.visualViewport.addEventListener('resize', updateToolbarHeight)
        resolve()
        toolbarIframe.removeEventListener('load', handleToolbarLoad)
    }
    toolbarIframe.addEventListener('load', handleToolbarLoad)
}

function styleToolbar() {
    toolbarDiv.style = `height: 100%; display: flex; background-color: rgba(43, 42, 51, ${settings.toolbarTransparency})`
    menuDiv.style = 'height: 50%; display: none; background-color: #2b2a33'
    if (settings.defaultPosition === 'top') {
        toolbarDiv.style.top = '0'
        menuDiv.style.bottom = '0'
        toolbarDiv.style.borderWidth = '0 0 2px'
        menuDiv.style.borderWidth = '0 0 2px'
    } else {
        toolbarDiv.style.bottom = '0'
        menuDiv.style.top = '0'
        toolbarDiv.style.borderWidth = '2px 0 0'
        menuDiv.style.borderWidth = '2px 0 0'
    }
}

function closeMenu() {
    if (!menuDivHidden) {
        menuDivHidden = true
        menuDiv.style.display = 'none'
        toolbarDiv.style.height = '100%'
        const currentToolbarHeight =
            toolbarIframe.getBoundingClientRect().height
        toolbarIframe.style.height = currentToolbarHeight / 2 + 'px'
        menuButtonFlag.style.background = 'transparent'
    }
}

//
// Buttons
//
const buttonElements = {
    homeButton: {
        behavior: function () {
            this.style.background = '#6495EDcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'updateTab',
                    url: settings.homepageURL,
                })
            }, 100)
        },
    },
    duplicateTabButton: {
        behavior: function (e) {
            e.preventDefault()
            let updatedUrl = window.location.href
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'duplicateTab',
                    url: updatedUrl,
                })
            }, 100)
        },
    },
    menuButton: {
        behavior: function () {
            if (menuDivHidden) {
                this.style.background = '#6495edcc'
                menuDivHidden = false
                const currentToolbarHeight =
                    toolbarIframe.getBoundingClientRect().height
                toolbarIframe.style.height = currentToolbarHeight * 2 + 'px'
                toolbarDiv.style.height = '50%'
                menuDiv.style.display = 'flex'
                menuButtonFlag = this
            } else {
                closeMenu()
            }
        },
    },
    closeTabButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                browser.runtime.sendMessage({
                    action: 'closeTab',
                    url: settings.homepageURL,
                })
            }, 100)
        },
    },
    newTabButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'createTab',
                    url: settings.newTabURL,
                })
            }, 100)
        },
    },
    hideButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                toolbarIframe.style.display = 'none'
                iframeHidden = true
            }, 100)
        },
    },
    moveToolbarButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                const imgElement = this.querySelector('img')
                closeMenu()
                if (toolbarIframe.style.bottom === '0px') {
                    toolbarIframe.style.bottom = 'unset'
                    toolbarIframe.style.top = '0px'
                    toolbarDiv.style.bottom = 'unset'
                    toolbarDiv.style.top = '0'
                    menuDiv.style.top = 'unset'
                    menuDiv.style.bottom = '0'
                    toolbarDiv.style.borderWidth = '0 0 2px'
                    menuDiv.style.borderWidth = '0 0 2px'
                    imgElement.src = browser.runtime.getURL(
                        'icons/' + settings.iconTheme + '/chevronDown.svg'
                    )
                } else {
                    toolbarIframe.style.top = 'unset'
                    toolbarIframe.style.bottom = '0px'
                    toolbarDiv.style.bottom = '0'
                    toolbarDiv.style.top = 'unset'
                    menuDiv.style.top = '0'
                    menuDiv.style.bottom = 'unset'
                    toolbarDiv.style.borderWidth = '2px 0 0'
                    menuDiv.style.borderWidth = '2px 0 0'
                    imgElement.src = browser.runtime.getURL(
                        'icons/' + settings.iconTheme + '/chevronUp.svg'
                    )
                }
                this.style.background = 'transparent'
            }, 100)
        },
    },
    // devToolsButton: {
    //     behavior: function () {
    //         this.style.background = '#6495edcc'
    //         const bookmarkletCode = "(function () { var script = document.createElement('script'); script.src='https://cdn.jsdelivr.net/npm/eruda'; document.body.append(script); script.onload = function () { eruda.init(); } })();"
    //         const bookmarkletAnchor = document.createElement('a')
    //         bookmarkletAnchor.href = 'javascript:' + bookmarkletCode
    //         document.body.appendChild(bookmarkletAnchor)
    //         bookmarkletAnchor.click()
    //         document.body.removeChild(bookmarkletAnchor)
    //         setTimeout(() => {
    //             this.style.background = 'transparent'
    //             //closeMenu()
    //         }, 100)
    //     },
    // },
    goBackButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'goBack' })
            }, 100)
        },
    },
    goForwardButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'goForward' })
            }, 100)
        },
    },
    reloadButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'reload' })
            }, 100)
        },
    },
    settingsButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'openSettings' })
            }, 100)
        },
    },
    undoCloseTabButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'undoCloseTab' })
            }, 100)
        },
    },
    scrollTopButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                document.documentElement.scrollTop = 0
            }, 100)
        },
    },
    scrollBottomButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                document.documentElement.scrollTop =
                    document.documentElement.scrollHeight
            }, 100)
        },
    },
    closeAllTabsButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'closeAllTabs',
                    url: settings.homepageURL,
                })
            }, 100)
        },
    },
    closeOtherTabsButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'closeOtherTabs' })
            }, 100)
        },
    },
    toggleDesktopSiteButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.storage.local.get('isDesktopSite').then((result) => {
                    if (!result.isDesktopSite) {
                        browser.storage.local
                            .set({ isDesktopSite: true })
                            .then(() => {
                                browser.runtime.sendMessage({
                                    action: 'toggleDesktopSite',
                                })
                            })
                    } else {
                        browser.storage.local
                            .set({ isDesktopSite: false })
                            .then(() => {
                                browser.runtime.sendMessage({
                                    action: 'toggleDesktopSite',
                                })
                            })
                    }
                })
            }, 100)
        },
    },
    // Add more buttons
}

function createButtons() {
    settings.buttonOrder.forEach((buttonId) => {
        if (buttonElements[buttonId] && settings.checkboxStates[buttonId]) {
            let button
            const img = document.createElement('img')
            switch (buttonId) {
                case 'duplicateTabButton':
                    button = document.createElement('a')
                    img.src = browser.runtime.getURL(
                        `icons/${settings.iconTheme}/${buttonId}.svg`
                    )
                    button.href = currentUrl
                    button.addEventListener('touchstart', function () {
                        if (currentUrl !== window.location.href) {
                            currentUrl = window.location.href
                            button.href = currentUrl
                        }
                    })
                    break
                case 'moveToolbarButton':
                    button = document.createElement('button')
                    if (settings.defaultPosition === 'bottom') {
                        img.src = browser.runtime.getURL(
                            `icons/${settings.iconTheme}/chevronUp.svg`
                        )
                    } else {
                        img.src = browser.runtime.getURL(
                            `icons/${settings.iconTheme}/chevronDown.svg`
                        )
                    }
                    break
                case 'toggleDesktopSiteButton':
                    button = document.createElement('button')
                    browser.storage.local
                        .get('isDesktopSite')
                        .then((result) => {
                            if (!result.isDesktopSite) {
                                img.src = browser.runtime.getURL(
                                    `icons/${settings.iconTheme}/toggleDesktopSiteButton.svg`
                                )
                            } else {
                                img.src = browser.runtime.getURL(
                                    `icons/${settings.iconTheme}/smartphone.svg`
                                )
                            }
                        })
                    break
                default:
                    button = document.createElement('button')
                    img.src = browser.runtime.getURL(
                        `icons/${settings.iconTheme}/${buttonId}.svg`
                    )
                    break
            }
            if (button) {
                button.appendChild(img)
                button.addEventListener(
                    'click',
                    buttonElements[buttonId].behavior
                )
                buttonElements[buttonId].element = button
            }
        }
    })
}

function appendButtons() {
    let buttonsAppended = 0
    settings.buttonOrder.forEach((buttonId) => {
        if (
            buttonsAppended < settings.buttonsInToolbarDiv &&
            buttonElements[buttonId] &&
            settings.checkboxStates[buttonId]
        ) {
            const buttonToAppend = buttonElements[buttonId].element
            toolbarDiv.appendChild(buttonToAppend)
            buttonsAppended++
        } else if (
            buttonElements[buttonId] &&
            settings.checkboxStates[buttonId]
        ) {
            const buttonToAppend = buttonElements[buttonId].element
            menuDiv.appendChild(buttonToAppend)
        }
    })
}

//
// Hide on scroll method
//
function handleScroll() {
    let currentScrollPos = window.scrollY
    if (!isThrottled) {
        isThrottled = true
        setTimeout(function () {
            isThrottled = false
        }, 100)
        if (Math.abs(prevScrollPos - currentScrollPos) <= 5) {
            return
        }
        if (
            prevScrollPos > currentScrollPos &&
            !iframeHidden &&
            !iframeVisible
        ) {
            toolbarIframe.style.display = 'block'
            iframeVisible = true
        } else if (prevScrollPos < currentScrollPos && iframeVisible) {
            toolbarIframe.style.display = 'none'
            iframeVisible = false
        }
    }
    prevScrollPos = currentScrollPos
}

function handleTouchStart(event) {
    prevTouchY = event.touches[0].clientY
}

function handleTouchMove(event) {
    let currentTouchY = event.touches[0].clientY
    if (!isThrottled) {
        isThrottled = true
        setTimeout(function () {
            isThrottled = false
        }, 100)
        if (Math.abs(prevTouchY - currentTouchY) <= 5) {
            return
        }
        if (prevTouchY < currentTouchY && !iframeHidden && !iframeVisible) {
            toolbarIframe.style.display = 'block'
            iframeVisible = true
        } else if (prevTouchY > currentTouchY && iframeVisible) {
            toolbarIframe.style.display = 'none'
            iframeVisible = false
        }
    }
    prevTouchY = currentTouchY
}

function hideOnScroll() {
    if (hideMethodInUse === 'scroll') {
        window.removeEventListener('scroll', handleScroll)
    } else if (hideMethodInUse === 'touch') {
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
    }
    if (settings.hideMethod === 'scroll') {
        hideMethodInUse = 'scroll'
        isThrottled = false
        prevScrollPos = window.scrollY
        window.addEventListener('scroll', handleScroll)
    } else if (settings.hideMethod === 'touch') {
        hideMethodInUse = 'touch'
        isThrottled = false
        let prevTouchY
        window.addEventListener('touchstart', handleTouchStart)
        window.addEventListener('touchmove', handleTouchMove)
    }
}

//
// Update size and position
//
function updateToolbarHeight() {
    let calculatedHeight
    if (!menuDivHidden) {
        calculatedHeight =
            (settings.toolbarHeight / window.visualViewport.scale) * 2
    } else {
        calculatedHeight = settings.toolbarHeight / window.visualViewport.scale
    }
    toolbarIframe.style.height = `${calculatedHeight}px`
    toolbarIframe.style.width = '100%'
    toolbarIframe.style.left = '0'
    if (settings.defaultPosition === 'top') {
        toolbarIframe.style.top = '0px'
    } else {
        toolbarIframe.style.bottom = '0px'
    }
}

//
// Initialize toolbar
//
function checkExistenceAndHeight() {
    let timeout, interval, calculatedHeight
    const checkToolbar = () => {
        const essBtnsToolbar = document.getElementById('essBtnsToolbar')
        if (!menuDivHidden) {
            calculatedHeight =
                (settings.toolbarHeight / window.visualViewport.scale) * 2
        } else {
            calculatedHeight =
                settings.toolbarHeight / window.visualViewport.scale
        }
        if (!essBtnsToolbar) {
            initializeToolbar()
            clearInterval(interval)
            clearTimeout(timeout)
        }
        if (essBtnsToolbar) {
            if (
                essBtnsToolbar.getBoundingClientRect().height !==
                calculatedHeight
            ) {
                updateToolbarHeight()
            }
        }
    }
    timeout = setTimeout(() => clearInterval(interval), 10000)
    interval = setInterval(checkToolbar, 1000)
}

function removeToolbar() {
    const essBtnsToolbar = document.getElementById('essBtnsToolbar')
    if (essBtnsToolbar) {
        essBtnsToolbar.remove()
        window.visualViewport.removeEventListener('resize', updateToolbarHeight)
    }
}

async function initializeToolbar() {
    removeToolbar()
    await getSettingsValues()
    const isCurrentPageExcluded = settings.excludedUrls?.some((excludedUrl) => {
        const pattern = new RegExp('^' + excludedUrl.replace(/\*/g, '.*') + '$')
        return pattern.test(currentUrl)
    })
    if (!isCurrentPageExcluded) {
        await appendToolbar()
        updateToolbarHeight()
        createButtons()
        appendButtons()
        checkExistenceAndHeight()
        hideOnScroll()
    }
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'reloadToolbar') {
        initializeToolbar()
    }
})

initializeToolbar()
