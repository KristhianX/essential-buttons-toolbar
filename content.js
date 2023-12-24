// Retrieve the settings from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'checkboxStates', 'buttonOrder', 'buttonsInToolbarDiv']).then((result) => {
    const homepageURL = result.homepageURL || 'https://web.tabliss.io';
    const newTabURL = result.newTabURL || 'https://web.tabliss.io';
    const toolbarHeight = result.toolbarHeight || '42';
    const defaultPosition = result.defaultPosition || 'bottom';
    const iconTheme = result.iconTheme || 'heroIcons';
    const hideMethod = result.hideMethod || 'scroll';
    const checkboxStates = result.checkboxStates || {
        'homeButton': true,
        'duplicateTabButton': true,
        //'menuButton': true,
        'closeTabButton': true,
        'newTabButton': true,
        'hideButton': true,
        'moveToolbarButton': true,
        //'devToolsButton': true,
        'goBackButton': false,
        'goForwardButton': false,
        'reloadButton': false,
    };
    const buttonOrder = result.buttonOrder || [
        'homeButton',
        'duplicateTabButton',
        'hideButton',
        'moveToolbarButton',
        'closeTabButton',
        'newTabButton',
        'goBackButton',
        'goForwardButton',
        'reloadButton'
    ];
    //const buttonsInToolbarDiv = result.buttonsInToolbarDiv || 6;
    const excludedUrls = result.excludedUrls || [];
    const currentUrl = window.location.href;
    let iframeHidden = false;
    let iframeVisible = true;
    //let menuDivHidden = true;
    
    
    // Check if the current page's URL should be excluded.
    const isCurrentPageExcluded = excludedUrls.some((excludedUrl) => {
        const pattern = new RegExp('^' + excludedUrl.replace(/\*/g, '.*') + '$');
        return pattern.test(currentUrl);
    });
    
    
    if (!isCurrentPageExcluded) {
        // Default css style for the buttons.
        // Icons from https://github.com/feathericons/feather and https://github.com/tailwindlabs/heroicons
        const defaultButtonStyle = 'height: 100%; aspect-ratio: 1; cursor: pointer; border: none; border-radius: 20%; background: transparent';
        const defaultImgStyle = 'height: 50%; aspect-ratio: 1';
        
        
        // Creating the iframe with the maximum z-index value to ensure it is allways on top.
        // Placing it outside the body to make it be on top of other elements with max z-index in the body.
        const toolbarIframe = document.createElement('iframe');
        toolbarIframe.style = 'height: ' + toolbarHeight + 'px; ' + defaultPosition + ': 0px; left: 0px; width: 100vw; display: block; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 0; background: transparent; color-scheme: light';
        document.body.insertAdjacentElement('afterend', toolbarIframe);
        
        
        // document.documentElement.style.position = 'fixed';
        // document.documentElement.style.top = '0';
        // document.documentElement.style.left = '0';
        // document.documentElement.style.margin = '0';
        // document.documentElement.style.height = '100vh';
        // document.documentElement.style.width = '100vw';
        // document.documentElement.style.overflow = 'auto';
        // document.documentElement.style.boxSizing = 'border-box';
        // document.body.style.position = 'absolute';
        // document.body.style.top = '0';
        // document.body.style.left = '0';
        // document.body.style.margin = '0';
        // document.body.style.height = "100vh";
        // document.body.style.width = "100vw";
        // document.body.style.overflow = 'auto';
        // document.body.style.boxSizing = 'border-box';
        

        // Creating the toolbar.
        const toolbarDiv = document.createElement('div');
        toolbarDiv.style = 'height: ' + toolbarHeight + 'px; padding: 0 4%; box-sizing: border-box; display: flex; justify-content: space-between; width: 100%; position: absolute; background-color: rgba(43, 42, 51, 0.8); border-style: solid; border-color: #38373f';
        
        
        // Creating the menu.
        const menuDiv = document.createElement('div');
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
            //toolbarIframe.contentWindow.document.body.appendChild(menuDiv);
            toolbarIframe.contentWindow.document.body.appendChild(toolbarDiv);
            toolbarIframe.contentWindow.document.body.style = 'margin: 0; height: 100%';
        });
        
        
        // Map button IDs to their corresponding button elements and their behaviors
        const buttonElements = {
            homeButton: {
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'updateTab', url: homepageURL });
                        //closeMenu();
                    }, 100);
                },
            },
            duplicateTabButton: {
                element: document.createElement('a'),
                behavior: function (e) {
                    e.preventDefault();
                    this.style.background = '#6eb9f7cc';
                    let updatedUrl = window.location.href;
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'duplicateTab', url: updatedUrl });
                        //closeMenu();
                    }, 100);
                },
            },
            // menuButton: {
            //     element: document.createElement('button'),
            //     behavior: function () {
            //         this.style.background = '#6eb9f7cc';
            //         //const imgElement = this.querySelector('img');
            //         if (menuDivHidden) {
            //             //imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/x.svg');
            //             menuDiv.style.display = 'flex';
            //             menuDivHidden = false;
            //             toolbarIframe.style.height = toolbarHeight * 2 + 'px';
            //         } else {
            //             //imgElement.src = browser.runtime.getURL('icons/' + iconTheme + '/menuButton.svg');
            //             menuDiv.style.display = 'none';
            //             menuDivHidden = true;
            //             toolbarIframe.style.height = toolbarHeight + 'px';
            //         }
            //         setTimeout(() => {
            //             this.style.background = 'transparent';
            //         }, 100);
            //     },
            // },
            closeTabButton: {
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'closeTab', url: homepageURL });
                        //closeMenu();
                    }, 100);
                },
            },
            newTabButton: {
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'createTab', url: newTabURL });
                        //closeMenu();
                    }, 100);
                },
            },
            hideButton: {
                element: document.createElement('button'),
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
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';            
                    setTimeout(() => {
                        const imgElement = this.querySelector('img');
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
                        //menuButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/menu.svg');
                        this.style.background = 'transparent';
                        //closeMenu();
                    }, 100);        
                },
            },
            // devToolsButton: {
            //     element: document.createElement('button'),
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
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'goBack' });
                        //closeMenu();
                    }, 100);
                },
            },
            goForwardButton: {
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'goForward' });
                        //closeMenu();
                    }, 100);
                },
            },
            reloadButton: {
                element: document.createElement('button'),
                behavior: function () {
                    this.style.background = '#6eb9f7cc';
                    setTimeout(() => {
                        this.style.background = 'transparent';
                        browser.runtime.sendMessage({ action: 'reload' });
                        //closeMenu();
                    }, 100);
                },
            },
            // Add more buttons.
        };
        
        // function closeMenu() {
        //     if (!menuDivHidden) {
        //         menuDiv.style.display = 'none';
        //         menuDivHidden = true;
        //         toolbarIframe.style.height = toolbarHeight + 'px';
        //     }
        // };
        
        // Customize the buttons
        Object.keys(buttonElements).forEach(buttonId => {
            const button = buttonElements[buttonId].element;
            //button.setAttribute("id", buttonId);
            button.style = defaultButtonStyle;
            const img = document.createElement('img');
            switch (buttonId) {
                case 'duplicateTabButton':
                img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg');
                button.style.display = 'flex';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.href = currentUrl;
                break;
                // Add other cases for different buttons if needed
                case 'moveToolbarButton':
                if (defaultPosition === 'bottom') {
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg');
                } else {
                    img.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg');                        
                }
                break;
                default:
                // Default styling for other buttons
                img.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonId + '.svg');
                break;
            }
            img.style = defaultImgStyle;
            button.appendChild(img);
            button.addEventListener('click', buttonElements[buttonId].behavior);
        });
        
        //let buttonsAppended = 0;
        
        // buttonOrder.forEach(buttonId => {
        //     if (buttonsAppended < buttonsInToolbarDiv && buttonElements[buttonId] && checkboxStates[buttonId]) {
        //         const button = buttonElements[buttonId].element;
        //         toolbarDiv.appendChild(button);
        //         buttonsAppended++;
        //     } else if (buttonElements[buttonId] && checkboxStates[buttonId]) {
        //         // If the limit is reached, append to a second div
        //         const button = buttonElements[buttonId].element;
        //         menuDiv.appendChild(button);
        //     }
        // });
        
        buttonOrder.forEach(buttonId => {
            if (buttonElements[buttonId]) {
                const button = buttonElements[buttonId].element;
                // Check if the buttonId is in checkboxStates and is checked
                if (checkboxStates[buttonId]) {
                    toolbarDiv.appendChild(button);
                }
            }
        });
        
        
        // Hide the iframe when scrolling. By default ignores changes in the scrolling smaller than 5.
        let isThrottled;
        if (hideMethod === 'scroll') {
            isThrottled = false;
            let prevScrollPos = window.scrollY;       
            window.addEventListener('scroll', function() {
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
            });
        } else if (hideMethod === 'touch') {
            isThrottled = false;
            let prevTouchY;                       
            window.addEventListener('touchstart', function(event) {
                prevTouchY = event.touches[0].clientY;
            });                        
            window.addEventListener('touchmove', function(event) {
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
            });
        };
    } else {
        return;
    };
});