//
// Variables
//
let currentUrl = window.location.href
let iframeVisible = true
let menuDivHidden = true
let iframeHidden
let unhideIcon
let dragging
let toolbarIframe
let iframeDocument
let toolbarDiv
let menuDiv
let toolbarButtons
let menuButtonFlag
let hideMethodInUse
let isThrottled
let prevScrollPos
const settings = {}
const isPrivate = browser.extension.inIncognitoContext
const buttonsToDisable = [
    'duplicateTabButton',
    'newTabButton',
    'settingsButton',
    'undoCloseTabButton',
    'closeAllTabsButton',
    'closeOtherTabsButton'
]

//
// Get settings
//
function getSettingsValues() {
    const keys = [
        'homepageURL',
        'newTabURL',
        'toolbarHeight',
        'toolbarWidth',
        'toolbarTransparency',
        'topBottomMargin',
        'defaultPosition',
        'theme',
        'iconTheme',
        'hideMethod',
        'pageUpDownScrollType',
        'pageUpDownScrollOverlap',
        'pageUpDownScrollOverlapLongpress',
        'excludedUrls',
        'checkboxStates',
        'buttonOrder',
        'buttonsInToolbarDiv'
    ]
    return browser.storage.sync.get(keys).then((result) => {
        keys.forEach((key) => {
            settings[key] = result[key]
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
            return
        }
        const observer = new MutationObserver(() => {
            if (document.body) {
                observer.disconnect()
                appendToolbarAndResolve(resolve)
            }
        })
        observer.observe(document.documentElement, {
            childList: true,
            subtree: false
        })
    })
}

function appendToolbarAndResolve(resolve) {
    if (iframeHidden) {
        unhideIcon = document.createElement('div')
        unhideIcon.setAttribute('id', 'essUnhideIcon')
        const img = document.createElement('img')
        img.src = browser.runtime.getURL(
            `icons/${settings.iconTheme}/unhide.svg`
        )
        img.style =
            'pointer-events: none; height: 50%; width: 50%; margin: auto'
        unhideIcon.style =
            'display: flex; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 2px solid #38373f !important; background: rgba(43, 42, 51, 0.8) !important; color-scheme: light; border-radius: 20%; box-sizing: border-box'
        unhideIcon.appendChild(img)
        document.body.insertAdjacentElement('beforeend', unhideIcon)
        makeDraggable(unhideIcon)
        resolve()
    } else {
        toolbarIframe = document.createElement('iframe')
        toolbarIframe.style =
            'display: block !important; height: 0; position: fixed; z-index: 2147483647; margin: 0; padding: 0; min-height: unset; max-height: unset; min-width: unset; max-width: unset; border: 0; background: transparent; color-scheme: light; border-radius: 0'
        toolbarIframe.src = browser.runtime.getURL('pages/toolbar.html')
        toolbarIframe.setAttribute('id', 'essBtnsToolbar')
        document.body.insertAdjacentElement('afterend', toolbarIframe)
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () =>
                applyColorSchemeToIframe(toolbarIframe)
            )
        toolbarIframe.addEventListener('load', () => {
            iframeDocument =
                toolbarIframe.contentDocument ||
                toolbarIframe.contentWindow.document
            toolbarDiv = iframeDocument.getElementById('toolbar')
            menuDiv = iframeDocument.getElementById('menu')
            toolbarButtons = iframeDocument.querySelectorAll('.toolbar-button')
            applyColorSchemeToIframe(toolbarIframe)
            if (toolbarDiv && menuDiv) {
                styleToolbarDivs()
            }
            resolve()
        })
    }
}

function applyColorSchemeToIframe(iframe) {
    if (settings.theme === 'light') {
        iframe.style.colorScheme = 'light'
    } else if (settings.theme === 'dark') {
        iframe.style.colorScheme = 'dark'
    } else {
        const prefersDarkScheme = window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches
        iframe.style.colorScheme = prefersDarkScheme ? 'dark' : 'light'
    }
}

function styleToolbarDivs() {
    toolbarDiv.style.opacity = settings.toolbarTransparency
    if (settings.defaultPosition === 'top') {
        toolbarIframe.style.cssText += `width: ${settings.toolbarWidth}vw !important;`
        toolbarDiv.classList.add('horizontal')
        menuDiv.classList.add('horizontal')
        toolbarDiv.style.height = '100%'
        menuDiv.style.height = '50%'
        toolbarDiv.style.top = '0'
        menuDiv.style.bottom = '0'
        toolbarButtons.forEach((toolbarButton) => {
            toolbarButton.style.height = '100%'
        })
        if (Number(settings.toolbarWidth) === 100) {
            toolbarDiv.style.borderWidth = '0 0 2px'
            menuDiv.style.borderWidth = '0 0 2px'
        } else {
            toolbarDiv.style.borderWidth = '0 2px 2px'
            menuDiv.style.borderWidth = '0 2px 2px'
        }
    } else if (settings.defaultPosition === 'bottom') {
        toolbarIframe.style.cssText += `width: ${settings.toolbarWidth}vw !important;`
        toolbarDiv.classList.add('horizontal')
        menuDiv.classList.add('horizontal')
        toolbarDiv.style.height = '100%'
        menuDiv.style.height = '50%'
        toolbarDiv.style.bottom = '0'
        menuDiv.style.top = '0'
        toolbarButtons.forEach((toolbarButton) => {
            toolbarButton.style.height = '100%'
        })
        if (Number(settings.toolbarWidth) === 100) {
            toolbarDiv.style.borderWidth = '2px 0 0'
            menuDiv.style.borderWidth = '2px 0 0'
        } else {
            toolbarDiv.style.borderWidth = '2px 2px 0'
            menuDiv.style.borderWidth = '2px 2px 0'
        }
    } else if (settings.defaultPosition === 'left') {
        toolbarIframe.style.cssText += `height: ${settings.toolbarWidth}vh !important;`
        toolbarDiv.classList.add('vertical')
        menuDiv.classList.add('vertical')
        toolbarDiv.style.width = '100%'
        menuDiv.style.width = '50%'
        toolbarDiv.style.left = '0'
        menuDiv.style.right = '0'
        toolbarButtons.forEach((toolbarButton) => {
            toolbarButton.style.width = '100%'
        })
        if (Number(settings.toolbarWidth) === 100) {
            toolbarDiv.style.borderWidth = '0 2px 0 0'
            menuDiv.style.borderWidth = '0 2px 0 0'
        } else {
            toolbarDiv.style.borderWidth = '2px 2px 2px 0'
            menuDiv.style.borderWidth = '2px 2px 2px 0'
        }
    } else {
        toolbarIframe.style.cssText += `height: ${settings.toolbarWidth}vh !important;`
        toolbarDiv.classList.add('vertical')
        menuDiv.classList.add('vertical')
        toolbarDiv.style.width = '100%'
        menuDiv.style.width = '50%'
        toolbarDiv.style.right = '0'
        menuDiv.style.left = '0'
        toolbarButtons.forEach((toolbarButton) => {
            toolbarButton.style.width = '100%'
        })
        if (Number(settings.toolbarWidth) === 100) {
            toolbarDiv.style.borderWidth = '0 0 0 2px'
            menuDiv.style.borderWidth = '0 0 0 2px'
        } else {
            toolbarDiv.style.borderWidth = '2px 0 2px 2px'
            menuDiv.style.borderWidth = '2px 0 2px 2px'
        }
    }
    if (isPrivate) {
        toolbarDiv.style.backgroundColor = `rgba(var(--private-background), ${settings.toolbarTransparency})`
    }
}

function updateToolbarHeight() {
    const calculatedHeight = calculateToolbarHeight()
    if (iframeHidden) {
        unhideIcon.style.height = `${calculatedHeight}px`
        unhideIcon.style.width = `${calculatedHeight}px`
        unhideIcon.style.left = `${
            visualViewport.width - calculatedHeight * 1.5
        }px`
        settings.defaultPosition === 'top'
            ? (unhideIcon.style.top = `${calculatedHeight * 1.5}px`)
            : (unhideIcon.style.top = `${
                  visualViewport.height - calculatedHeight * 2.5
              }px`)
    } else {
        if (
            settings.defaultPosition === 'top' ||
            settings.defaultPosition === 'bottom'
        ) {
            toolbarIframe.style.cssText += `height: ${calculatedHeight}px !important;`
            if (Number(settings.toolbarWidth) !== 100) {
                toolbarIframe.style.left = '50%'
                toolbarIframe.style.transform = 'translateX(-50%)'
            } else {
                toolbarIframe.style.left = '0'
            }
            settings.defaultPosition === 'top'
                ? (toolbarIframe.style.top = '0px')
                : (toolbarIframe.style.bottom = '0px')
            if (Number(settings.topBottomMargin) !== 0) {
                const margin = Math.floor(
                    settings.topBottomMargin / window.visualViewport.scale
                )
                toolbarIframe.style.margin = `${margin}px 0`
            }
        } else {
            toolbarIframe.style.cssText += `width: ${calculatedHeight}px !important;`
            if (Number(settings.toolbarWidth) !== 100) {
                toolbarIframe.style.top = '50%'
                toolbarIframe.style.transform = 'translateY(-50%)'
            } else {
                toolbarIframe.style.top = '0'
            }
            settings.defaultPosition === 'left'
                ? (toolbarIframe.style.left = '0px')
                : (toolbarIframe.style.right = '0px')
            if (Number(settings.topBottomMargin) !== 0) {
                const margin = Math.floor(
                    settings.topBottomMargin / window.visualViewport.scale
                )
                toolbarIframe.style.margin = `0 ${margin}px`
            }
        }
    }
}

function calculateToolbarHeight() {
    if (iframeHidden) {
        return (calculatedHeight = Math.floor(
            settings.toolbarHeight / window.visualViewport.scale
        ))
    } else {
        return (calculatedHeight = menuDivHidden
            ? Math.floor(settings.toolbarHeight / window.visualViewport.scale)
            : Math.floor(
                  (settings.toolbarHeight / window.visualViewport.scale) * 2
              ))
    }
}

function closeMenu() {
    if (!menuDivHidden) {
        menuDivHidden = true
        menuDiv.style.display = 'none'
        if (menuDiv.classList.contains('horizontal')) {
            toolbarDiv.style.height = '100%'
            const currentToolbarHeight =
                toolbarIframe.getBoundingClientRect().height
            toolbarIframe.style.height = currentToolbarHeight / 2 + 'px'
        } else {
            toolbarDiv.style.width = '100%'
            const currentToolbarWidth =
                toolbarIframe.getBoundingClientRect().width
            toolbarIframe.style.width = currentToolbarWidth / 2 + 'px'
        }
        menuButtonFlag.classList.remove('pressed')
    }
}

function makeDraggable(element) {
    element.addEventListener('mousedown', handleDragStart)
    element.addEventListener('touchstart', handleDragStart)
    function handleDragStart() {
        unhideToolbar()
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
        document.body.style.userSelect = 'none'
        const elWidth = element.getBoundingClientRect().width
        const elHeight = element.getBoundingClientRect().height
        const moveHandler = (event) => {
            //event.preventDefault()
            dragging = true
            const clientX = event.clientX || event.touches[0].clientX
            const clientY = event.clientY || event.touches[0].clientY
            const xPos = clientX - elWidth / 2
            const yPos = clientY - elHeight / 2
            element.style.left = `${xPos}px`
            element.style.top = `${yPos}px`
        }
        document.addEventListener('mousemove', moveHandler)
        document.addEventListener('touchmove', moveHandler)
        document.addEventListener('mouseup', handleDragEnd)
        document.addEventListener('touchend', handleDragEnd)
        function handleDragEnd() {
            dragging = false
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
            document.body.style.userSelect = ''
            document.removeEventListener('mousemove', moveHandler)
            document.removeEventListener('touchmove', moveHandler)
        }
    }
}

function unhideToolbar() {
    setTimeout(function () {
        if (!dragging) {
            iframeHidden = false
            initializeToolbar()
        }
    }, 200)
}

//
// Buttons
//
const buttonElements = {
    homeButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'updateTab',
                    url: settings.homepageURL
                })
            }, 100)
        }
    },
    duplicateTabButton: {
        behavior: function (e) {
            e.preventDefault()
            let updatedUrl = window.location.href
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'duplicateTab',
                    url: updatedUrl
                })
            }, 100)
        }
    },
    menuButton: {
        behavior: function () {
            if (menuDivHidden) {
                this.classList.add('pressed')
                menuDivHidden = false
                if (menuDiv.classList.contains('horizontal')) {
                    const currentToolbarHeight =
                        toolbarIframe.getBoundingClientRect().height
                    toolbarIframe.style.height = currentToolbarHeight * 2 + 'px'
                    toolbarDiv.style.height = '50%'
                } else {
                    const currentToolbarWidth =
                        toolbarIframe.getBoundingClientRect().width
                    toolbarIframe.style.width = currentToolbarWidth * 2 + 'px'
                    toolbarDiv.style.width = '50%'
                }
                menuDiv.style.display = 'flex'
                menuButtonFlag = this
            } else {
                closeMenu()
            }
        }
    },
    closeTabButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                browser.runtime.sendMessage({
                    action: 'closeTab',
                    url: settings.homepageURL
                })
            }, 100)
        }
    },
    newTabButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'createTab',
                    url: settings.newTabURL
                })
            }, 100)
        }
    },
    hideButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                iframeHidden = true
                closeMenu()
                initializeToolbar()
            }, 100)
        }
    },
    moveToolbarButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                const chevronUp = this.querySelector(
                    `svg.chevron-up.${settings.iconTheme}`
                )
                closeMenu()
                if (
                    toolbarIframe.style.bottom === '0px' &&
                    toolbarDiv.classList.contains('horizontal')
                ) {
                    toolbarIframe.style.bottom = 'unset'
                    toolbarIframe.style.top = '0px'
                    toolbarDiv.style.bottom = 'unset'
                    toolbarDiv.style.top = '0'
                    menuDiv.style.top = 'unset'
                    menuDiv.style.bottom = '0'
                    if (Number(settings.toolbarWidth) === 100) {
                        toolbarDiv.style.borderWidth = '0 0 2px'
                        menuDiv.style.borderWidth = '0 0 2px'
                    } else {
                        toolbarDiv.style.borderWidth = '0 2px 2px'
                        menuDiv.style.borderWidth = '0 2px 2px'
                    }
                    if (chevronUp) chevronUp.style.transform = 'rotate(180deg)'
                } else if (
                    toolbarIframe.style.top === '0px' &&
                    toolbarDiv.classList.contains('horizontal')
                ) {
                    toolbarIframe.style.top = 'unset'
                    toolbarIframe.style.bottom = '0px'
                    toolbarDiv.style.bottom = '0'
                    toolbarDiv.style.top = 'unset'
                    menuDiv.style.top = '0'
                    menuDiv.style.bottom = 'unset'
                    if (Number(settings.toolbarWidth) === 100) {
                        toolbarDiv.style.borderWidth = '2px 0 0'
                        menuDiv.style.borderWidth = '2px 0 0'
                    } else {
                        toolbarDiv.style.borderWidth = '2px 2px 0'
                        menuDiv.style.borderWidth = '2px 2px 0'
                    }
                    if (chevronUp) chevronUp.style.transform = 'rotate(0deg)'
                } else if (
                    toolbarIframe.style.left === '0px' &&
                    toolbarDiv.classList.contains('vertical')
                ) {
                    toolbarIframe.style.left = 'unset'
                    toolbarIframe.style.right = '0px'
                    toolbarDiv.style.right = '0'
                    toolbarDiv.style.left = 'unset'
                    menuDiv.style.left = '0'
                    menuDiv.style.right = 'unset'
                    if (Number(settings.toolbarWidth) === 100) {
                        toolbarDiv.style.borderWidth = '0 0 0 2px'
                        menuDiv.style.borderWidth = '0 0 0 2px'
                    } else {
                        toolbarDiv.style.borderWidth = '2px 0 2px 2px'
                        menuDiv.style.borderWidth = '2px 0 2px 2px'
                    }
                    if (chevronUp) chevronUp.style.transform = 'rotate(270deg)'
                } else {
                    toolbarIframe.style.right = 'unset'
                    toolbarIframe.style.left = '0px'
                    toolbarDiv.style.left = '0'
                    toolbarDiv.style.right = 'unset'
                    menuDiv.style.right = '0'
                    menuDiv.style.left = 'unset'
                    if (Number(settings.toolbarWidth) === 100) {
                        toolbarDiv.style.borderWidth = '0 2px 0 0'
                        menuDiv.style.borderWidth = '0 2px 0 0'
                    } else {
                        toolbarDiv.style.borderWidth = '2px 2px 2px 0'
                        menuDiv.style.borderWidth = '2px 2px 2px 0'
                    }
                    if (chevronUp) chevronUp.style.transform = 'rotate(90deg)'
                }
                this.classList.remove('pressed')
            }, 100)
        }
    },
    // devToolsButton: {
    //     behavior: function () {
    //         this.classList.add('pressed')
    //         const bookmarkletCode = "(function () { var script = document.createElement('script'); script.src='https://cdn.jsdelivr.net/npm/eruda'; document.body.append(script); script.onload = function () { eruda.init(); } })();"
    //         const bookmarkletAnchor = document.createElement('a')
    //         bookmarkletAnchor.href = 'javascript:' + bookmarkletCode
    //         document.body.appendChild(bookmarkletAnchor)
    //         bookmarkletAnchor.click()
    //         document.body.removeChild(bookmarkletAnchor)
    //         setTimeout(() => {
    //             this.classList.remove('pressed')
    //             //closeMenu()
    //         }, 100)
    //     },
    // },
    goBackButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'goBack' })
            }, 100)
        }
    },
    goForwardButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'goForward' })
            }, 100)
        }
    },
    reloadButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'reload' })
            }, 100)
        }
    },
    settingsButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'openSettings' })
            }, 100)
        }
    },
    undoCloseTabButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'undoCloseTab' })
            }, 100)
        }
    },
    scrollTopButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                findScrollableElement().scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        }
    },
    scrollBottomButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                const element = findScrollableElement()
                element.scrollTo({
                    top: element.scrollHeight,
                    behavior: 'smooth'
                })
            }, 100)
        }
    },
    pageUpButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                const element = findScrollableElement()
                const overlapSetting = settings.pageUpDownScrollOverlap || 80
                const offset = Math.max(window.innerHeight - overlapSetting, 10)
                const targetTop = Math.max(0, element.scrollTop - offset)
                element.scrollTo({ top: targetTop, behavior: settings.pageUpDownScrollType })
            }, 100)
        },
        longPressBehavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                const element = findScrollableElement()
                const overlapSetting = settings.pageUpDownScrollOverlapLongpress || 60
                const offset = Math.max(window.innerHeight - overlapSetting, 10)
                const targetTop = Math.max(0, element.scrollTop - offset)
                element.scrollTo({ top: targetTop, behavior: settings.pageUpDownScrollType })
            }, 100)
        }
    },
    pageDownButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                const element = findScrollableElement()
                const overlapSetting = settings.pageUpDownScrollOverlap || 80
                const offset = Math.max(window.innerHeight - overlapSetting, 10)
                const targetTop = Math.min(
                    element.scrollHeight,
                    element.scrollTop + offset
                )
                element.scrollTo({ top: targetTop, behavior: settings.pageUpDownScrollType })
            }, 100)
        },
        longPressBehavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                const element = findScrollableElement()
                const overlapSetting = settings.pageUpDownScrollOverlapLongpress || 60
                const offset = Math.max(window.innerHeight - overlapSetting, 10)
                const targetTop = Math.min(
                    element.scrollHeight,
                    element.scrollTop + offset
                )
                element.scrollTo({ top: targetTop, behavior: settings.pageUpDownScrollType })
            }, 100)
        }
    },
    closeAllTabsButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'closeAllTabs',
                    url: settings.homepageURL
                })
            }, 100)
        }
    },
    closeOtherTabsButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({ action: 'closeOtherTabs' })
            }, 100)
        }
    },
    toggleDesktopSiteButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.storage.local.get('isDesktopSite').then((result) => {
                    if (!result.isDesktopSite) {
                        browser.storage.local
                            .set({ isDesktopSite: true })
                            .then(() => {
                                browser.runtime.sendMessage({
                                    action: 'toggleDesktopSite'
                                })
                            })
                    } else {
                        browser.storage.local
                            .set({ isDesktopSite: false })
                            .then(() => {
                                browser.runtime.sendMessage({
                                    action: 'toggleDesktopSite'
                                })
                            })
                    }
                })
            }, 100)
        }
    },
    openWithButton: {
        behavior: function () {
            window.stop()
            this.classList.add('pressed')
            const currentUrl = window.location.href
            const scheme = currentUrl.split(':').shift()
            const shortUrl = currentUrl.split(':').pop()
            const intentUrl = `intent:${shortUrl}#Intent;action=android.intent.action.VIEW;scheme=${scheme};end`
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'updateTab',
                    url: intentUrl
                })
            }, 100)
        }
    },
    copyLinkButton: {
        behavior: function () {
            this.classList.add('pressed')
            const currentUrl = window.location.href
            navigator.clipboard
                .writeText(currentUrl)
                .then(() => {
                    //text copied notification
                })
                .catch((err) => {
                    //error notification. Create function notify(text) 3s.
                })
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
            }, 100)
        }
    },
    addTopSiteButton: {
        behavior: function () {
            this.classList.add('pressed')
            triggerAddTopSitePrompt()
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
            }, 100)
        }
    },
    shareButton: {
        behavior: function () {
            this.classList.add('pressed')
            setTimeout(() => {
                this.classList.remove('pressed')
                closeMenu()
                navigator.share({
                    title: document.title,
                    url: window.location.href
                })
            }, 100)
        }
    }
    // Add more buttons
}

function triggerAddTopSitePrompt() {
    ;(async () => {
        try {
            const { createPrompt } = await import(
                browser.runtime.getURL('scripts/topSitePrompt.js')
            )
            createPrompt()
        } catch (error) {
            console.error('Error importing or executing createPrompt:', error)
        }
    })()
}

function toggleButtonVisibility() {
    if (iframeHidden) return
    const fragment = document.createDocumentFragment()
    settings.buttonOrder.forEach((buttonId) => {
        const button = iframeDocument.querySelector(
            `[data-button="${buttonId}"]`
        )
        if (button && settings.checkboxStates[buttonId]) {
            if (isPrivate && buttonsToDisable.includes(buttonId)) return
            const svgs = button.querySelectorAll('svg')
            switch (buttonId) {
                case 'duplicateTabButton':
                    showSVG(svgs, settings.iconTheme)
                    button.href = currentUrl
                    button.addEventListener('touchstart', function () {
                        if (currentUrl !== window.location.href) {
                            currentUrl = window.location.href
                            button.href = currentUrl
                        }
                    })
                    break
                case 'moveToolbarButton':
                    showSVG(svgs, settings.iconTheme)
                    const chevronUp = button.querySelector(
                        `svg.chevron-up.${settings.iconTheme}`
                    )
                    if (settings.defaultPosition === 'top') {
                        chevronUp.style.transform = 'rotate(180deg)'
                    } else if (settings.defaultPosition === 'left') {
                        chevronUp.style.transform = 'rotate(90deg)'
                    } else if (settings.defaultPosition === 'right') {
                        chevronUp.style.transform = 'rotate(270deg)'
                    }
                    break
                case 'toggleDesktopSiteButton':
                    browser.storage.local
                        .get('isDesktopSite')
                        .then((result) => {
                            const isDesktopSite = result.isDesktopSite
                            const toggleClass = isDesktopSite
                                ? 'smartphone'
                                : 'toggleDesktopSiteButton'
                            showSVG(svgs, settings.iconTheme, toggleClass)
                        })
                    break
                default:
                    showSVG(svgs, settings.iconTheme)
                    break
            }
            button.style.display = 'flex'
            fragment.appendChild(button)
            if (buttonElements[buttonId] && buttonElements[buttonId].behavior) {
                button.removeEventListener(
                    'click',
                    buttonElements[buttonId].behavior
                )

                // Add longpress detection for Page Up/Down buttons
                if (buttonId === 'pageUpButton' || buttonId === 'pageDownButton') {
                    let longPressTimer = null
                    let isLongPress = false

                    const startLongPress = () => {
                        longPressTimer = setTimeout(() => {
                            isLongPress = true
                            if (buttonElements[buttonId].longPressBehavior) {
                                buttonElements[buttonId].longPressBehavior.call(button)
                            }
                        }, 500)
                    }

                    const cancelLongPress = () => {
                        if (longPressTimer) {
                            clearTimeout(longPressTimer)
                            longPressTimer = null
                        }
                        if (!isLongPress) {
                            buttonElements[buttonId].behavior.call(button)
                        }
                        isLongPress = false
                    }

                    // Remove existing longpress event listeners if they exist
                    button.removeEventListener('mousedown', button._longPressStart)
                    button.removeEventListener('touchstart', button._longPressStart)

                    // Add longpress detection
                    button._longPressStart = () => {
                        isLongPress = false
                        startLongPress()
                    }

                    button._longPressEnd = () => {
                        cancelLongPress()
                    }

                    button.addEventListener('mousedown', button._longPressStart)
                    button.addEventListener('touchstart', button._longPressStart)
                    button.addEventListener('mouseup', button._longPressEnd)
                    button.addEventListener('touchend', button._longPressEnd)
                    button.addEventListener('mouseleave', button._longPressEnd)
                } else {
                    button.addEventListener(
                        'click',
                        buttonElements[buttonId].behavior
                    )
                }
                buttonElements[buttonId].element = button
            }
        }
    })
    iframeDocument.body.appendChild(fragment)
}

function showSVG(svgs, theme, additionalClass) {
    svgs.forEach((svg) => {
        if (
            svg.classList.contains(theme) &&
            (!additionalClass || svg.classList.contains(additionalClass))
        ) {
            svg.style.display = 'flex'
        }
    })
}

function appendButtons() {
    if (iframeHidden) return
    let buttonsAppended = 0
    const toolbarFragment = document.createDocumentFragment()
    const menuFragment = document.createDocumentFragment()
    settings.buttonOrder.forEach((buttonId) => {
        const button = iframeDocument.querySelector(
            `[data-button="${buttonId}"]`
        )
        if (button && settings.checkboxStates[buttonId]) {
            if (isPrivate && buttonsToDisable.includes(buttonId)) {
                buttonsAppended++
                return
            }
            if (buttonsAppended < settings.buttonsInToolbarDiv) {
                toolbarFragment.appendChild(button)
            } else {
                menuFragment.appendChild(button)
            }
            buttonsAppended++
        }
    })
    toolbarDiv.appendChild(toolbarFragment)
    menuDiv.appendChild(menuFragment)
}

function findScrollableElement() {
    const candidates = document.querySelectorAll('main, div, section')
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    if (document.documentElement.scrollHeight > viewportHeight) {
        return document.documentElement
    }
    if (document.body.scrollHeight > document.body.clientHeight) {
        return document.body
    }
    for (const el of candidates) {
        if (
            el.scrollHeight > viewportHeight * 0.95 &&
            el.clientWidth > viewportWidth * 0.8 &&
            (getComputedStyle(el).overflowY === 'auto' ||
                getComputedStyle(el).overflowY === 'scroll')
        ) {
            return el
        }
    }
    return document.documentElement
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
        if (prevScrollPos > currentScrollPos && !iframeVisible) {
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
    if (iframeHidden) return
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
// Initialize toolbar
//
function removeToolbar() {
    const targetElement =
        document.getElementById('essUnhideIcon') ||
        document.getElementById('essBtnsToolbar')
    closeMenu()
    if (targetElement) {
        targetElement.remove()
        window.removeEventListener('load', checkExistenceAndHeight)
        window.visualViewport.removeEventListener('resize', updateToolbarHeight)
    }
}

function checkExistenceAndHeight() {
    setTimeout(function () {
        const targetElement =
            document.getElementById('essUnhideIcon') ||
            document.getElementById('essBtnsToolbar')
        if (
            !targetElement ||
            (targetElement.id === 'essBtnsToolbar' &&
                targetElement.parentElement.tagName.toLowerCase() !== 'html')
        ) {
            initializeToolbar()
            return
        }
        const calculatedHeight = calculateToolbarHeight()
        if (targetElement.getBoundingClientRect().height !== calculatedHeight) {
            updateToolbarHeight()
        }
        window.removeEventListener('load', checkExistenceAndHeight)
    }, 2000)
}

async function initializeToolbar() {
    const problematicUrls = ['https://gaming.amazon.com']
    removeToolbar()
    getSettingsValues().then(async () => {
        const isCurrentPageExcluded = [
            ...(settings.excludedUrls || []),
            ...problematicUrls
        ].some((excludedUrl) => {
            const pattern = new RegExp(
                '^' + excludedUrl.replace(/\*/g, '.*') + '$'
            )
            return pattern.test(currentUrl)
        })
        if (!isCurrentPageExcluded) {
            await appendToolbar()
            updateToolbarHeight()
            window.addEventListener('load', checkExistenceAndHeight)
            toggleButtonVisibility()
            appendButtons()
            hideOnScroll()
            window.visualViewport.addEventListener(
                'resize',
                updateToolbarHeight
            )
        }
    })
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'reloadToolbar') {
        initializeToolbar()
    }
})

initializeToolbar()
