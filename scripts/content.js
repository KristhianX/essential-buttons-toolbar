//
// Variables
//
let homepageURL
let newTabURL
let toolbarHeight
let toolbarTransparency
let defaultPosition
let iconTheme
let hideMethod
let checkboxStates
let buttonOrder
let buttonsInToolbarDiv
let excludedUrls
let currentUrl = window.location.href
let isCurrentPageExcluded
let iframeHidden
let iframeVisible = true
let menuDivHidden = true
let toolbarIframe
let toolbarStyle
let toolbarDiv
let menuDiv
let menuButtonFlag
let hideMethodInUse
let isThrottled
let prevScrollPos

//
// TODO:
//  Add option to display an unhide button when the toolbar is hidden
//  Improve undo close tab button
//  Option to change toolbar theme
//  Import and export settings
//  Add-on idea: Fix problematic pages
//  about:newtab altenernative
//  Archive; daily; 📬
//

//
// Get settings from storage
//
function getSettingsValues() {
    return new Promise((resolve) => {
        const checkValues = () => {
            browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'checkboxStates', 'buttonOrder', 'buttonsInToolbarDiv', 'toolbarTransparency']).then((result) => {
                homepageURL = result.homepageURL
                newTabURL = result.newTabURL
                toolbarHeight = result.toolbarHeight
                toolbarTransparency = result.toolbarTransparency
                defaultPosition = result.defaultPosition
                iconTheme = result.iconTheme
                hideMethod = result.hideMethod
                checkboxStates = result.checkboxStates
                buttonOrder = result.buttonOrder
                buttonsInToolbarDiv = result.buttonsInToolbarDiv
                excludedUrls = result.excludedUrls || []
                isCurrentPageExcluded = excludedUrls.some((excludedUrl) => {
                    const pattern = new RegExp('^' + excludedUrl.replace(/\*/g, '.*') + '$')
                    return pattern.test(currentUrl)
                })
                // Check if all values are available, otherwise, recursively call checkValues.
                if (homepageURL && newTabURL && toolbarHeight && toolbarTransparency && defaultPosition && iconTheme && hideMethod && checkboxStates && buttonOrder && buttonsInToolbarDiv) {
                    resolve()
                } else {
                    setTimeout(checkValues, 100)
                }
            })
        }
        checkValues()
    })
}

//
// Toolbar
//
function createToolbar() {
    toolbarIframe = document.createElement('iframe')
    toolbarIframe.src = browser.runtime.getURL('pages/toolbar.html')
    toolbarIframe.setAttribute('id', 'essBtnsToolbar')
    toolbarIframe.style = 'display: block; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 0; background: transparent; color-scheme: light; border-radius: 0'
    toolbarStyle = toolbarIframe.style
    toolbarDiv = document.createElement('div')
    toolbarDiv.style = 'height: 100%; display: flex; background-color: rgba(43, 42, 51, ' + toolbarTransparency + ')'
    menuDiv = document.createElement('div')
    menuDiv.style = 'height: 50%; display: none; background-color: #2b2a33'
    if (defaultPosition === 'top') {
        toolbarDiv.style.top = '0'
        menuDiv.style.bottom = '0'
        toolbarDiv.style.borderWidth = '0 0 5px'
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
        const currentToolbarHeight = toolbarIframe.getBoundingClientRect().height
        toolbarIframe.style.height =  currentToolbarHeight / 2 + 'px'
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
                browser.runtime.sendMessage({ action: 'updateTab', url: homepageURL })
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
                browser.runtime.sendMessage({ action: 'duplicateTab', url: updatedUrl })
            }, 100)
        },
    },
    menuButton: {
        behavior: function () {
            if (menuDivHidden) {
                this.style.background = '#6495edcc'
                menuDivHidden = false
                const currentToolbarHeight = toolbarIframe.getBoundingClientRect().height
                toolbarIframe.style.height =  currentToolbarHeight * 2 + 'px'
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
                browser.runtime.sendMessage({ action: 'closeTab', url: homepageURL })
            }, 100)
        },
    },
    newTabButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'createTab', url: newTabURL })
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
                    imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg')
                } else {
                    toolbarIframe.style.top = 'unset'
                    toolbarIframe.style.bottom = '0px'
                    toolbarDiv.style.bottom = '0'
                    toolbarDiv.style.top = 'unset'
                    menuDiv.style.top = '0'
                    menuDiv.style.bottom = 'unset'
                    toolbarDiv.style.borderWidth = '2px 0 0'
                    menuDiv.style.borderWidth = '2px 0 0'
                    imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg')
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
                document.documentElement.scrollTop = document.documentElement.scrollHeight
            }, 100)
        },
    },
    closeAllTabsButton: {
        behavior: function () {
            this.style.background = '#6495edcc'
            setTimeout(() => {
                this.style.background = 'transparent'
                closeMenu()
                browser.runtime.sendMessage({ action: 'closeAllTabs', url: homepageURL })
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
                browser.storage.local.get('isDesktopSite').then( (result) => {
                    if (!result.isDesktopSite) {
                        browser.storage.local.set({ isDesktopSite: true }).then( () => {
                            browser.runtime.sendMessage({ action: 'toggleDesktopSite' })
                        })
                    } else {
                        browser.storage.local.set({ isDesktopSite: false }).then( () => {
                            browser.runtime.sendMessage({ action: 'toggleDesktopSite' })
                        })
                    }
                })
            }, 100)
        },
    },
    // Add more buttons
}

function createButtons() {
    buttonOrder.forEach(buttonId => {
        if (buttonElements[buttonId] && checkboxStates[buttonId]) {
            let button
            const img = document.createElement('img')
            switch (buttonId) {
                case 'duplicateTabButton':
                button = document.createElement('a')
                img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg')
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
                if (defaultPosition === 'bottom') {
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg')
                } else {
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg')
                }
                break
                case 'toggleDesktopSiteButton':
                button = document.createElement('button')
                browser.storage.local.get('isDesktopSite').then( (result) => {
                    if (!result.isDesktopSite) {
                        img.src = browser.runtime.getURL('icons/' + iconTheme + '/toggleDesktopSiteButton.svg')
                    } else {
                        img.src = browser.runtime.getURL('icons/' + iconTheme + '/smartphone.svg')
                    }
                })
                break
                default:
                button = document.createElement('button')
                img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg')
                break
            }
            if (button) {
                button.appendChild(img)
                button.addEventListener('click', buttonElements[buttonId].behavior)
                buttonElements[buttonId].element = button
            }
        }
    })
}

function appendButtons() {
    let buttonsAppended = 0
    buttonOrder.forEach(buttonId => {
        if (buttonsAppended < buttonsInToolbarDiv && buttonElements[buttonId] && checkboxStates[buttonId]) {
            const buttonToAppend = buttonElements[buttonId].element
            toolbarDiv.appendChild(buttonToAppend)
            buttonsAppended++
        } else if (buttonElements[buttonId] && checkboxStates[buttonId]) {
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
        setTimeout(function() {
            isThrottled = false
        }, 100)
        if (Math.abs(prevScrollPos - currentScrollPos) <= 5) {
            return
        }
        if (prevScrollPos > currentScrollPos && !iframeHidden && !iframeVisible) {
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
        setTimeout(function() {
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
    if (hideMethod === 'scroll') {
        hideMethodInUse = 'scroll'
        isThrottled = false
        prevScrollPos = window.scrollY 
        window.addEventListener('scroll', handleScroll)
    } else if (hideMethod === 'touch') {
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
        calculatedHeight = toolbarHeight / window.visualViewport.scale * 2
    } else {
        calculatedHeight = toolbarHeight / window.visualViewport.scale
    }
    const newHeight = calculatedHeight + 'px'
    toolbarStyle.height = newHeight
    toolbarStyle.width = '100%'
    toolbarStyle.left = '0'
    if (defaultPosition === 'top') {
        toolbarStyle.top = '0px'
    } else if (defaultPosition === 'bottom') {
        toolbarStyle.bottom = '0px'
    }
}

//
// Initialize toolbar
//
function appendToolbar() {
    let timeout, interval
    const checkAndLoadToolbar = () => {
        if (document.body) {
            document.body.insertAdjacentElement('afterend', toolbarIframe)
            toolbarIframe.addEventListener('load', function () {
                toolbarIframe.contentWindow.document.body.appendChild(menuDiv)
                toolbarIframe.contentWindow.document.body.appendChild(toolbarDiv)
            })
            window.visualViewport.addEventListener('resize', updateToolbarHeight)
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }
    timeout = setTimeout(() => clearInterval(interval), 10000)
    interval = setInterval(checkAndLoadToolbar, 100)
}

function checkExistenceAndHeight() {
    let timeout, interval, calculatedHeight
    const checkToolbar = () => {
        const essBtnsToolbar = document.getElementById('essBtnsToolbar')
        if (!menuDivHidden) {
            calculatedHeight = toolbarHeight / window.visualViewport.scale * 2
        } else {
            calculatedHeight = toolbarHeight / window.visualViewport.scale
        }
        if (!essBtnsToolbar) {
            initializeToolbar()
            clearInterval(interval)
            clearTimeout(timeout)
        }
        if (essBtnsToolbar) {
            if (essBtnsToolbar.getBoundingClientRect().height !== calculatedHeight) {
                updateToolbarHeight()
            }
        }
    }
    timeout = setTimeout(() => clearInterval(interval), 10000)
    interval = setInterval(checkToolbar, 1000)
}

async function removeToolbar() {
    const essBtnsToolbar = document.getElementById('essBtnsToolbar')
    if (essBtnsToolbar) {
        essBtnsToolbar.remove()
        window.visualViewport.removeEventListener('resize', updateToolbarHeight)
    }    
}

async function initializeToolbar() {
    removeToolbar()
    await getSettingsValues()
    if (!isCurrentPageExcluded) {
        createToolbar()
        createButtons()
        appendButtons()
        await appendToolbar()
        updateToolbarHeight()
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
