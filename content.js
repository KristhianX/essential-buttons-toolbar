// Retrieve the settings from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls']).then((result) => {
    const homepageURL = result.homepageURL || 'https://web.tabliss.io';
    const newTabURL = result.newTabURL || 'https://web.tabliss.io';
    const toolbarHeight = result.toolbarHeight || '42';
    const defaultPosition = result.defaultPosition || 'bottom';
    const iconTheme = result.iconTheme || 'featherIcons';
    const hideMethod = result.hideMethod || 'scroll';
    const excludedUrls = result.excludedUrls || [];
    const currentUrl = window.location.href;
    let iframeHidden = false;
    let iframeVisible = true;
    let menuDivHidden = true;
    
    
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
        
        
        // Creating the toolbar.
        const toolbarDiv = document.createElement('div');
        toolbarDiv.style = 'height: ' + toolbarHeight + 'px; padding: 0 4%; box-sizing: border-box; display: flex; justify-content: space-between; width: 100%; position: absolute; background-color: #2b2a33cc; border-style: solid; border-color: #38373f';


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
            toolbarIframe.contentWindow.document.body.appendChild(menuDiv);
            toolbarIframe.contentWindow.document.body.appendChild(toolbarDiv);
            toolbarIframe.contentWindow.document.body.style = 'margin: 0; height: 100%';
        });


        // Creating the buttons. All of them will have a simple background change as pressed feedback and then the action will be executed. Default delay 200ms.
        const homeButton = document.createElement('button');
        const homeButtonImg = document.createElement('img');
        homeButton.appendChild(homeButtonImg);
        homeButton.style = defaultButtonStyle;
        homeButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/home.svg');
        homeButtonImg.style = defaultImgStyle;
        homeButton.addEventListener('click', function() {
            homeButton.style.background = '#6eb9f7cc';
            browser.runtime.sendMessage({ action: 'updateTab', url: homepageURL });
            setTimeout(function() {
                homeButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const moveButton = document.createElement('button');
        const moveButtonImg = document.createElement('img');
        moveButton.appendChild(moveButtonImg);
        moveButton.style = defaultButtonStyle;
        if (defaultPosition === 'bottom') {
            moveButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/up.svg');
        } else {
            moveButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/down.svg');
        };
        moveButtonImg.style = defaultImgStyle;
        moveButton.addEventListener('click', function() {
            moveButton.style.background = '#6eb9f7cc';            
            setTimeout(function() {
                if (toolbarIframe.style.bottom === '0px') {
                    toolbarIframe.style.bottom = 'unset';
                    toolbarIframe.style.top = '0px';
                    toolbarDiv.style.bottom = 'unset';
                    toolbarDiv.style.top = '0';
                    menuDiv.style.top = 'unset';
                    menuDiv.style.bottom = '0';
                    toolbarDiv.style.borderWidth = '0 0 2px';
                    menuDiv.style.borderWidth = '0 0 2px';
                    moveButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/down.svg');
                } else {
                    toolbarIframe.style.top = 'unset';
                    toolbarIframe.style.bottom = '0px';
                    toolbarDiv.style.bottom = '0';
                    toolbarDiv.style.top = 'unset';
                    menuDiv.style.top = '0';
                    menuDiv.style.bottom = 'unset';
                    toolbarDiv.style.borderWidth = '2px 0 0';
                    menuDiv.style.borderWidth = '2px 0 0';
                    moveButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/up.svg');
                };
                menuButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/menu.svg');
                menuDiv.style.display = 'none';
                menuDivHidden = true;
                toolbarIframe.style.height = toolbarHeight + 'px';
                moveButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const hideToolbarButton = document.createElement('button');
        const hideToolbarButtonImg = document.createElement('img');
        hideToolbarButton.appendChild(hideToolbarButtonImg);
        hideToolbarButton.style = defaultButtonStyle;
        hideToolbarButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/eyeOff.svg');
        hideToolbarButtonImg.style = defaultImgStyle;
        hideToolbarButton.addEventListener('click', function() {
            hideToolbarButton.style.background = '#6eb9f7cc';
            setTimeout(function() {
                hideToolbarButton.style.background = 'transparent';
                toolbarIframe.style.display = 'none';
                iframeHidden = true;
            }, 100);
        });
        
        
        const closeTabButton = document.createElement('button');
        const closeTabButtonImg = document.createElement('img');
        closeTabButton.appendChild(closeTabButtonImg);
        closeTabButton.style = defaultButtonStyle;
        closeTabButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/close.svg');
        closeTabButtonImg.style = defaultImgStyle;
        closeTabButton.addEventListener('click', function() {
            closeTabButton.style.background = '#6eb9f7cc';
            browser.runtime.sendMessage({ action: 'closeTab', url: homepageURL });
            setTimeout(function() {
                closeTabButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const newTabButton = document.createElement('button');
        const newTabButtonImg = document.createElement('img');
        newTabButton.appendChild(newTabButtonImg);
        newTabButton.style = defaultButtonStyle;
        newTabButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/plus.svg');
        newTabButtonImg.style = defaultImgStyle;
        newTabButton.addEventListener('click', function() {
            newTabButton.style.background = '#6eb9f7cc';
            browser.runtime.sendMessage({ action: 'createTab', url: newTabURL });
            setTimeout(function() {
                newTabButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const menuButton = document.createElement('button');
        const menuButtonImg = document.createElement('img');
        menuButton.appendChild(menuButtonImg);
        menuButton.style = defaultButtonStyle;
        menuButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/menu.svg');
        menuButtonImg.style = defaultImgStyle;
        menuButton.addEventListener('click', function() {
            menuButton.style.background = '#6eb9f7cc';
            if (menuDivHidden) {
                menuButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/x.svg');
                menuDiv.style.display = 'flex';
                menuDivHidden = false;
                toolbarIframe.style.height = toolbarHeight * 2 + 'px';
            } else {
                menuButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/menu.svg');
                menuDiv.style.display = 'none';
                menuDivHidden = true;
                toolbarIframe.style.height = toolbarHeight + 'px';
            }
            setTimeout(function() {
                menuButton.style.background = 'transparent';
            }, 100);
        });


        const duplicateTabButton = document.createElement('a');
        const duplicateTabButtonImg = document.createElement('img');
        duplicateTabButton.href = currentUrl;
        duplicateTabButton.appendChild(duplicateTabButtonImg);
        duplicateTabButton.style = defaultButtonStyle;
        duplicateTabButton.style.display = 'flex';
        duplicateTabButton.style.justifyContent = 'center';
        duplicateTabButton.style.alignItems = 'center';
        duplicateTabButtonImg.src = browser.runtime.getURL('icons/' + iconTheme + '/external-link.svg');
        duplicateTabButtonImg.style = defaultImgStyle;
        duplicateTabButton.addEventListener('click', function(e) {
            e.preventDefault();
            duplicateTabButton.style.background = '#6eb9f7cc';
            browser.runtime.sendMessage({ action: 'duplicateTab', url: currentUrl });
            setTimeout(function() {
                duplicateTabButton.style.background = 'transparent';
            }, 100);
        });


        // Appending the buttons.
        toolbarDiv.appendChild(homeButton);
        toolbarDiv.appendChild(duplicateTabButton);
        toolbarDiv.appendChild(menuButton);
        toolbarDiv.appendChild(closeTabButton);
        toolbarDiv.appendChild(newTabButton);
        
        
        menuDiv.appendChild(hideToolbarButton);
        menuDiv.appendChild(moveButton);


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