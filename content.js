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
let iframeHidden = false
let iframeVisible = true
let menuDivHidden = true
let defaultButtonStyle
let defaultImgStyle
let toolbarIframe
let toolbarDiv
let menuDiv
let menuButtonFlag
let hideMethodInUse
let isThrottled
let prevScrollPos

//
// TODO: 
//  Improve undo close tab button
//  Add toggle desktop site button
//  Add option to display an unhide button when the toolbar is hidden
//  Option to change toolbar theme (TRON)
//  Import and export settings
//  Add-on idea: Fix problematic pages
//  about:newtab altenernative
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
                // Check if the current page's URL should be excluded.
                isCurrentPageExcluded = excludedUrls.some((excludedUrl) => {
                    const pattern = new RegExp('^' + excludedUrl.replace(/\*/g, '.*') + '$');
                    return pattern.test(currentUrl);
                });
                // Check if all values are available, otherwise, recursively call checkValues.
                if (homepageURL && newTabURL && toolbarHeight && toolbarTransparency && defaultPosition && iconTheme && hideMethod && checkboxStates && buttonOrder && buttonsInToolbarDiv) {
                    resolve();
                } else {
                    setTimeout(checkValues, 100);
                }
            });
        };
        checkValues();
    });
}

//
// Toolbar
//
function createToolbar() {
    // Icons from https://github.com/feathericons/feather and https://github.com/tailwindlabs/heroicons
    defaultButtonStyle = 'height: 100%; aspect-ratio: 1; cursor: pointer; border: none; border-radius: 20%; background: transparent';
    defaultImgStyle = 'height: 50%; aspect-ratio: 1';    
    // Placing it outside the body to make it be on top of other elements with max z-index in the body.
    toolbarIframe = document.createElement('iframe');
    toolbarIframe.setAttribute('id', 'essBtnsToolbar');
    toolbarIframe.style = 'height: ' + toolbarHeight + 'px; ' + defaultPosition + ': 0px; left: 0px; width: 100%; display: block; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 0; background: transparent; color-scheme: light; border-radius: 0';
    document.body.insertAdjacentElement('afterend', toolbarIframe);
    toolbarDiv = document.createElement('div');
    toolbarDiv.style = 'height: ' + toolbarHeight + 'px; padding: 0 4%; box-sizing: border-box; display: flex; justify-content: space-between; width: 100%; position: absolute; background-color: rgba(43, 42, 51, ' + toolbarTransparency + '); border-style: solid; border-color: #38373f';
    menuDiv = document.createElement('div');
    menuDiv.style = 'height: ' + toolbarHeight + 'px; padding: 0 4%; box-sizing: border-box; display: none; justify-content: space-between; width: 100%; position: absolute; background-color: #2b2a33; border-style: solid; border-color: #38373f';
    if (defaultPosition === 'top') {
        toolbarDiv.style.borderWidth = '0 0 2px';
        toolbarDiv.style.top = '0';
        menuDiv.style.borderWidth = '0 0 2px';
        menuDiv.style.bottom = '0';
    } else {
        toolbarDiv.style.borderWidth = '2px 0 0';
        toolbarDiv.style.bottom = '0';
        menuDiv.style.borderWidth = '2px 0 0';
        menuDiv.style.top = '0';
    }; 
    toolbarIframe.addEventListener('load', function() {
        toolbarIframe.contentWindow.document.body.appendChild(menuDiv);
        toolbarIframe.contentWindow.document.body.appendChild(toolbarDiv);
        toolbarIframe.contentWindow.document.body.style = 'margin: 0; height: 100%';
    });
}

function closeMenu() {
    if (!menuDivHidden) {
        menuDiv.style.display = 'none';
        menuDivHidden = true;
        toolbarIframe.style.height = toolbarHeight + 'px';
        menuButtonFlag.style.background = 'transparent'
    }
};

//
// Buttons
//
const buttonElements = {
    homeButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'updateTab', url: homepageURL });
            }, 100);
        },
    },
    duplicateTabButton: {
        behavior: function (e) {
            e.preventDefault();
            let updatedUrl = window.location.href;
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'duplicateTab', url: updatedUrl });
            }, 100);
        },
    },
    menuButton: {
        behavior: function () {
            if (menuDivHidden) {
                this.style.background = '#6eb9f7cc';
                menuDiv.style.display = 'flex';
                menuDivHidden = false;
                toolbarIframe.style.height = toolbarHeight * 2 + 'px';
                menuButtonFlag = this
            } else {
                this.style.background = 'transparent';
                menuDiv.style.display = 'none';
                menuDivHidden = true;
                toolbarIframe.style.height = toolbarHeight + 'px';
            }
        },
    },
    closeTabButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                browser.runtime.sendMessage({ action: 'closeTab', url: homepageURL });
            }, 100);
        },
    },
    newTabButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'createTab', url: newTabURL });
            }, 100);
        },
    },
    hideButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                toolbarIframe.style.display = 'none';
                iframeHidden = true;
            }, 100);        
        },
    },
    moveToolbarButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';            
            setTimeout(() => {
                const imgElement = this.querySelector('img');
                closeMenu();
                if (toolbarIframe.style.bottom === '0px') {
                    toolbarIframe.style.bottom = 'unset';
                    toolbarIframe.style.top = '0px';
                    toolbarDiv.style.bottom = 'unset';
                    toolbarDiv.style.top = '0';
                    menuDiv.style.top = 'unset';
                    menuDiv.style.bottom = '0';
                    toolbarDiv.style.borderWidth = '0 0 2px';
                    menuDiv.style.borderWidth = '0 0 2px';
                    imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg');
                } else {
                    toolbarIframe.style.top = 'unset';
                    toolbarIframe.style.bottom = '0px';
                    toolbarDiv.style.bottom = '0';
                    toolbarDiv.style.top = 'unset';
                    menuDiv.style.top = '0';
                    menuDiv.style.bottom = 'unset';
                    toolbarDiv.style.borderWidth = '2px 0 0';
                    menuDiv.style.borderWidth = '2px 0 0';
                    imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg');
                };
                this.style.background = 'transparent';
            }, 100);        
        },
    },
    // devToolsButton: {
    //     behavior: function () {
    //         this.style.background = '#6eb9f7cc';
    //         const bookmarkletCode = "(function () { var script = document.createElement('script'); script.src='https://cdn.jsdelivr.net/npm/eruda'; document.body.append(script); script.onload = function () { eruda.init(); } })();";
    //         const bookmarkletAnchor = document.createElement('a');
    //         bookmarkletAnchor.href = 'javascript:' + bookmarkletCode;
    //         document.body.appendChild(bookmarkletAnchor);
    //         bookmarkletAnchor.click();
    //         document.body.removeChild(bookmarkletAnchor);
    //         setTimeout(() => {
    //             this.style.background = 'transparent';
    //             //closeMenu();
    //         }, 100);
    //     },
    // },
    goBackButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'goBack' });
            }, 100);
        },
    },
    goForwardButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'goForward' });
            }, 100);
        },
    },
    reloadButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'reload' });
            }, 100);
        },
    },
    settingsButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'openSettings' });
            }, 100);
        },
    },
    undoCloseTabButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'undoCloseTab' });
            }, 100);
        },
    },
    scrollTopButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                document.documentElement.scrollTop = 0;
            }, 100);
        },
    },
    scrollBottomButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                document.documentElement.scrollTop = document.documentElement.scrollHeight;
            }, 100);
        },
    },
    closeAllTabsButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'closeAllTabs', url: homepageURL });
            }, 100);
        },
    },
    closeOtherTabsButton: {
        behavior: function () {
            this.style.background = '#6eb9f7cc';
            setTimeout(() => {
                this.style.background = 'transparent';
                closeMenu();
                browser.runtime.sendMessage({ action: 'closeOtherTabs' });
            }, 100);
        },
    },
    // Add more buttons
};

function createButtons() {
    buttonOrder.forEach(buttonId => {
        if (buttonElements[buttonId] && checkboxStates[buttonId]) {
            let button;
            const img = document.createElement('img');
            switch (buttonId) {
                case 'duplicateTabButton':
                    button = document.createElement('a');
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg');
                    button.style = defaultButtonStyle;
                    button.style.display = 'flex';
                    button.style.justifyContent = 'center';
                    button.style.alignItems = 'center';
                    button.href = currentUrl;
                    button.addEventListener('touchstart', function () {
                        if (currentUrl !== window.location.href) {
                            currentUrl = window.location.href;
                            button.href = currentUrl;
                        }
                    });
                    break;
                case 'moveToolbarButton':
                    button = document.createElement('button');
                    button.style = defaultButtonStyle;
                    if (defaultPosition === 'bottom') {
                        img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg');
                    } else {
                        img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg');
                    }
                    break;
                default:
                    button = document.createElement('button');
                    button.style = defaultButtonStyle;
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg');
                    break;
            }
            if (button) {
                img.style = defaultImgStyle;
                button.appendChild(img);
                button.addEventListener('click', buttonElements[buttonId].behavior);
                buttonElements[buttonId].element = button;
            }
        }
    });
}

function appendButtons() {
    let buttonsAppended = 0;
    buttonOrder.forEach(buttonId => {
        if (buttonsAppended < buttonsInToolbarDiv && buttonElements[buttonId] && checkboxStates[buttonId]) {
            const buttonToAppend = buttonElements[buttonId].element;
            toolbarDiv.appendChild(buttonToAppend);
            buttonsAppended++;
        } else if (buttonElements[buttonId] && checkboxStates[buttonId]) {
            const buttonToAppend = buttonElements[buttonId].element;
            menuDiv.appendChild(buttonToAppend);
        }
    });    
}

//
// Hide on scroll method
//
function handleScroll() {
    let currentScrollPos = window.scrollY;
    if (!isThrottled) {
        isThrottled = true;
        setTimeout(function() {
            isThrottled = false;
        }, 100);
        if (Math.abs(prevScrollPos - currentScrollPos) <= 5) {
            return;
        };
        if (prevScrollPos > currentScrollPos && !iframeHidden && !iframeVisible) {
            toolbarIframe.style.display = 'block';
            iframeVisible = true;
        } else if (prevScrollPos < currentScrollPos && iframeVisible) {
            toolbarIframe.style.display = 'none';
            iframeVisible = false;
        };
    };
    prevScrollPos = currentScrollPos;
}

function handleTouchStart(event) {
    prevTouchY = event.touches[0].clientY;
}                     

function handleTouchMove(event) {
    let currentTouchY = event.touches[0].clientY;
    if (!isThrottled) {
        isThrottled = true;
        setTimeout(function() {
            isThrottled = false;
        }, 100);
        if (Math.abs(prevTouchY - currentTouchY) <= 5) {
            return;
        };
        if (prevTouchY < currentTouchY && !iframeHidden && !iframeVisible) {
            toolbarIframe.style.display = 'block';
            iframeVisible = true;
        } else if (prevTouchY > currentTouchY && iframeVisible) {
            toolbarIframe.style.display = 'none';
            iframeVisible = false;
        };
    };
    prevTouchY = currentTouchY;
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
    };
}

//
// Initialize toolbar
//
async function removeToolbar() {
    const essBtnsToolbar = document.getElementById('essBtnsToolbar')
    if (essBtnsToolbar) {
        essBtnsToolbar.remove();
    }
}

async function initializeToolbar() {
    removeToolbar();
    await getSettingsValues();
    if (!isCurrentPageExcluded) {
        createToolbar();
        createButtons();
        appendButtons();
        hideOnScroll();
    }
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'reloadToolbar') {
        initializeToolbar();
    }
});

initializeToolbar();
