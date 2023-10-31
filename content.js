// Retrieve the settings from storage.
browser.storage.sync.get(['variable1', 'variable2', 'variable3', 'excludedUrls']).then((result) => {
    const homepageURL = result.variable1 || "https://web.tabliss.io";
    const newTabURL = result.variable2 || "https://web.tabliss.io";
    const toolbarHeight = result.variable3 || "46";
    const excludedUrls = result.excludedUrls || [];
    const currentUrl = window.location.href;
    
    
    // Check if the current page's URL should be excluded.
    const isCurrentPageExcluded = excludedUrls.some((excludedUrl) => {
        const pattern = new RegExp("^" + excludedUrl.replace(/\*/g, ".*") + "$");
        return pattern.test(currentUrl);
    });
    
    
    if (!isCurrentPageExcluded) {
        // Inline svg icons and default css style for the buttons.
        // All icons from https://github.com/feathericons/feather
        const defaultButtonStyle = 'height: 100%; aspect-ratio: 1; cursor: pointer; border: none; border-radius: 20%; background: transparent';
        const defaultImgStyle = 'height: 60%; aspect-ratio: 1';
        
        // Define the event handler function
        function closeTabHandler() {
            browser.runtime.sendMessage({ action: "closeTab", url: homepageURL });
        };
        
        
        // Creating the iframe with the maximum z-index value to ensure it is allways on top.
        // Placing it outside the body to make it be on top of other elements with max z-index in the body.
        const iframeToolbar = document.createElement('iframe');
        iframeToolbar.style = 'height: ' + toolbarHeight + 'px; bottom: 0px; left: 0px; width: 100vw; position: fixed; z-index: 2147483647; margin: 0; padding: 0; border: 0; background: transparent; color-scheme: light';
        document.body.insertAdjacentElement('afterend', iframeToolbar);
        
        
        // Creating the toolbar.
        const customToolbar = document.createElement('div');
        customToolbar.style = 'height: 100%; padding: 0 4%; box-sizing: border-box; display: flex; justify-content: space-between; width: 100%; background-color: #2b2a33cc; border-top: 2px solid #38373f';
        iframeToolbar.addEventListener('load', function() {
            iframeToolbar.contentWindow.document.body.appendChild(customToolbar);
            iframeToolbar.contentWindow.document.body.style = 'margin: 0; height: 100%';
        });
        
        
        // Creating the buttons. All of them will have a simple background change as pressed feedback and then the action will be executed. Default delay 200ms.
        const homeButton = document.createElement('button');
        const homeButtonImg = document.createElement('img');
        homeButton.appendChild(homeButtonImg);
        homeButton.style = defaultButtonStyle;
        homeButtonImg.src = browser.extension.getURL('icons/featherIcons/home.svg');
        homeButtonImg.style = defaultImgStyle;
        homeButton.addEventListener('click', function() {
            homeButton.style.background = '#6eb9f7cc';
            setTimeout(function() {
                homeButton.style.background = 'transparent';
                window.open(homepageURL, '_self');
            }, 100);
        });
        
        
        const moveButton = document.createElement('button');
        const moveButtonImg = document.createElement('img');
        moveButton.appendChild(moveButtonImg);
        moveButton.style = defaultButtonStyle;
        moveButtonImg.src = browser.extension.getURL('icons/featherIcons/up.svg');
        moveButtonImg.style = defaultImgStyle;
        moveButton.addEventListener('click', function() {
            moveButton.style.background = '#6eb9f7cc';
            setTimeout(function() {
                if (iframeToolbar.style.bottom === '0px') {
                    iframeToolbar.style.bottom = 'unset';
                    iframeToolbar.style.top = '0px';
                    customToolbar.style.borderTop = 'unset';
                    customToolbar.style.borderBottom = '2px solid #38373f';
                    moveButtonImg.src = browser.extension.getURL('icons/featherIcons/down.svg');
                } else {
                    iframeToolbar.style.top = 'unset';
                    iframeToolbar.style.bottom = '0px';
                    customToolbar.style.borderBottom = 'unset';
                    customToolbar.style.borderTop = '2px solid #38373f';
                    moveButtonImg.src = browser.extension.getURL('icons/featherIcons/up.svg');
                };
                moveButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const hideToolbarButton = document.createElement('button');
        const hideToolbarButtonImg = document.createElement('img');
        hideToolbarButton.appendChild(hideToolbarButtonImg);
        hideToolbarButton.style = defaultButtonStyle;
        hideToolbarButtonImg.src = browser.extension.getURL('icons/featherIcons/eyeOff.svg');
        hideToolbarButtonImg.style = defaultImgStyle;
        hideToolbarButton.addEventListener('click', function() {
            hideToolbarButton.style.background = '#6eb9f7cc';
            setTimeout(function() {
                hideToolbarButton.style.background = 'transparent';
                iframeToolbar.style = 'display: none';
            }, 100);
        });
        
        
        const closeTabButton = document.createElement('button');
        const closeTabButtonImg = document.createElement('img');
        closeTabButton.appendChild(closeTabButtonImg);
        closeTabButton.style = defaultButtonStyle;
        closeTabButtonImg.src = browser.extension.getURL('icons/featherIcons/close.svg');
        closeTabButtonImg.style = defaultImgStyle;
        closeTabButton.addEventListener('click', function() {
            closeTabButton.style.background = '#6eb9f7cc';
            closeTabHandler();
            setTimeout(function() {
                closeTabButton.style.background = 'transparent';
            }, 100);
        });
        
        
        const newTabButton = document.createElement('button');
        const newTabButtonImg = document.createElement('img');
        newTabButton.appendChild(newTabButtonImg);
        newTabButton.style = defaultButtonStyle;
        newTabButtonImg.src = browser.extension.getURL('icons/featherIcons/plus.svg');
        newTabButtonImg.style = defaultImgStyle;
        newTabButton.addEventListener('click', function() {
            newTabButton.style.background = '#6eb9f7cc';
            setTimeout(function() {
                newTabButton.style.background = 'transparent';
                window.open(newTabURL, '_blank');
            }, 100);
        });
        
        
        // Appending the buttons.
        customToolbar.appendChild(homeButton);
        customToolbar.appendChild(hideToolbarButton);
        customToolbar.appendChild(moveButton);
        customToolbar.appendChild(closeTabButton);
        customToolbar.appendChild(newTabButton);
        
        
        // Hide the iframe when scrolling. By default ignores changes in the scrolling smaller than 10.
        let prevScrollPos = window.scrollY;
        window.addEventListener('scroll', function() {
            let currentScrollPos = window.scrollY;
            if (Math.abs(prevScrollPos - currentScrollPos) <= 10) {
                return;
            }
            if (prevScrollPos > currentScrollPos) {
                iframeToolbar.style.display = 'block';
            } else {
                iframeToolbar.style.display = 'none';
            };
            prevScrollPos = currentScrollPos;
        });   
    } else {
        return;
    };
});
