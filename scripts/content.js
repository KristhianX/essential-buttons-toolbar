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
    'closeOtherTabsButton',
]

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
            const nonExcludedKeys = keys.filter((key) => key !== 'excludedUrls')
            const isEmpty = nonExcludedKeys.some((key) => !result[key])
            if (isEmpty) {
                return getSettingsValues()
            }
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
    return new Promise((resolve, reject) => {
        let retryCount = 0
        const maxRetries = 8
        const initialDelay = 100
        const backoffFactor = 2
        function tryAppend() {
            if (document.body) {
                appendToolbarAndResolve(resolve)
            } else if (retryCount < maxRetries) {
                const delay = initialDelay * Math.pow(backoffFactor, retryCount)
                setTimeout(tryAppend, delay)
                retryCount++
            } else {
                reject(new Error('Toolbar appending failed'))
            }
        }
        tryAppend()
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
        function applyColorSchemeToIframe() {
            const prefersDarkScheme = window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches
            toolbarIframe.style.colorScheme = prefersDarkScheme
                ? 'dark'
                : 'light'
        }
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', applyColorSchemeToIframe)
        toolbarIframe.addEventListener('load', () => {
            iframeDocument =
                toolbarIframe.contentDocument ||
                toolbarIframe.contentWindow.document
            toolbarDiv = iframeDocument.getElementById('toolbar')
            menuDiv = iframeDocument.getElementById('menu')
            applyColorSchemeToIframe()
            if (toolbarDiv && menuDiv) {
                styleToolbarDivs()
            }
            resolve()
        })
    }
}

function styleToolbarDivs() {
    toolbarDiv.style.opacity = settings.toolbarTransparency
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
    if (isPrivate) {
        toolbarDiv.style.backgroundColor = `rgba(109, 65, 148, ${settings.toolbarTransparency})`
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
        toolbarIframe.style.height = `${calculatedHeight}px`
        toolbarIframe.style.width = '100%'
        toolbarIframe.style.left = '0'
        settings.defaultPosition === 'top'
            ? (toolbarIframe.style.top = '0px')
            : (toolbarIframe.style.bottom = '0px')
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
        toolbarDiv.style.height = '100%'
        const currentToolbarHeight =
            toolbarIframe.getBoundingClientRect().height
        toolbarIframe.style.height = currentToolbarHeight / 2 + 'px'
        menuButtonFlag.style.background = 'transparent'
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
            window.stop()
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
                iframeHidden = true
                closeMenu()
                initializeToolbar()
            }, 100)
        },
    },
    moveToolbarButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                const chevronUp = this.querySelector(
                    `svg.chevron-up.${settings.iconTheme}`
                )
                const chevronDown = this.querySelector(
                    `svg.chevron-down.${settings.iconTheme}`
                )
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
                    if (chevronDown) chevronDown.style.display = 'flex'
                    if (chevronUp) chevronUp.style.display = 'none'
                } else {
                    toolbarIframe.style.top = 'unset'
                    toolbarIframe.style.bottom = '0px'
                    toolbarDiv.style.bottom = '0'
                    toolbarDiv.style.top = 'unset'
                    menuDiv.style.top = '0'
                    menuDiv.style.bottom = 'unset'
                    toolbarDiv.style.borderWidth = '2px 0 0'
                    menuDiv.style.borderWidth = '2px 0 0'
                    if (chevronUp) chevronUp.style.display = 'flex'
                    if (chevronDown) chevronDown.style.display = 'none'
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
            window.stop()
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
            window.stop()
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
            window.stop()
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
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        },
    },
    scrollBottomButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth',
                })
            }, 100)
        },
    },
    closeAllTabsButton: {
        behavior: function () {
            window.stop()
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
            window.stop()
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
    openWithButton: {
        behavior: function () {
            window.stop()
            this.style.background = '#6495edcc'
            const currentUrl = window.location.href
            const scheme = currentUrl.split(':').shift()
            const shortUrl = currentUrl.split(':').pop()
            const intentUrl = `intent:${shortUrl}#Intent;action=android.intent.action.VIEW;scheme=${scheme};end`
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({
                    action: 'updateTab',
                    url: intentUrl,
                })
            }, 100)
        },
    },
    // Add more buttons
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
                    const chevronClass =
                        settings.defaultPosition === 'bottom'
                            ? 'chevron-up'
                            : 'chevron-down'
                    showSVG(svgs, settings.iconTheme, chevronClass)
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
                button.addEventListener(
                    'click',
                    buttonElements[buttonId].behavior
                )
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
    removeToolbar()
    await getSettingsValues()
    const isCurrentPageExcluded = settings.excludedUrls?.some((excludedUrl) => {
        const pattern = new RegExp('^' + excludedUrl.replace(/\*/g, '.*') + '$')
        return pattern.test(currentUrl)
    })
    if (!isCurrentPageExcluded) {
        await appendToolbar()
        updateToolbarHeight()
        window.addEventListener('load', checkExistenceAndHeight)
        toggleButtonVisibility()
        appendButtons()
        hideOnScroll()
        window.visualViewport.addEventListener('resize', updateToolbarHeight)
    }
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'reloadToolbar') {
        initializeToolbar()
    }
})

initializeToolbar()
