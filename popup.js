// Initialize the input fields with default values or values from storage.
const homepageURLInput = document.getElementById('homepageURL');
const newTabURLInput = document.getElementById('newTabURL');
const toolbarHeightRangeInput = document.getElementById('toolbarHeight');
const currentValueDisplay = document.getElementById('currentValue');
const defaultPositionSelect = document.getElementById('defaultPosition');
const iconThemeSelect = document.getElementById('iconTheme');
const hideMethodSelect = document.getElementById('hideMethod');
const saveButton = document.getElementById('saveButton');
const customUrlInput = document.getElementById('customUrl');
const addUrlButton = document.getElementById('addUrlButton');
const excludedUrlsList = document.getElementById('excludedUrls');
const statusMessage = document.getElementById('statusMessage');
const homepageURLQuestionMark = document.getElementById('homepageURLQuestionMark');
const homepageURLInfo = document.getElementById('homepageURLInfo');
const homepageURLCloseButton = document.getElementById('homepageURLCloseButton');
const hideMethodQuestionMark = document.getElementById('hideMethodQuestionMark');
const hideMethodInfo = document.getElementById('hideMethodInfo');
const hideMethodCloseButton = document.getElementById('hideMethodCloseButton');
const customUrlQuestionMark = document.getElementById('customUrlQuestionMark');
const customUrlInfo = document.getElementById('customUrlInfo');
const customUrlCloseButton = document.getElementById('customUrlCloseButton');


homepageURLQuestionMark.addEventListener('click', (e) => {
    e.preventDefault();
    homepageURLInfo.style.display = 'block';
    homepageURLQuestionMark.style.display = 'none';
});
homepageURLCloseButton.addEventListener('click', () => {
    homepageURLInfo.style.display = 'none';
    homepageURLQuestionMark.style.display = 'inline-block';
});
hideMethodQuestionMark.addEventListener('click', (e) => {
    e.preventDefault();
    hideMethodInfo.style.display = 'block';
    hideMethodQuestionMark.style.display = 'none';
});
hideMethodCloseButton.addEventListener('click', () => {
    hideMethodInfo.style.display = 'none';
    hideMethodQuestionMark.style.display = 'inline-block';
})
customUrlQuestionMark.addEventListener('click', (e) => {
    e.preventDefault();
    customUrlInfo.style.display = 'block';
    customUrlQuestionMark.style.display = 'none';
});
customUrlCloseButton.addEventListener('click', () => {
    customUrlInfo.style.display = 'none';
    customUrlQuestionMark.style.display = 'inline-block';
});


// Get the current page's URL and set it as the initial value for 'customUrl' input.
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
        customUrlInput.value = tabs[0].url;
    };
});


// Load the values from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls']).then((result) => {
    homepageURLInput.value = result.homepageURL;
    newTabURLInput.value = result.newTabURL;
    toolbarHeightRangeInput.value = result.toolbarHeight;
    currentValueDisplay.textContent = result.toolbarHeight;
    defaultPositionSelect.value = result.defaultPosition;
    iconThemeSelect.value = result.iconTheme;
    hideMethodSelect.value = result.hideMethod;
    if (result.excludedUrls) {
        result.excludedUrls.forEach((url) => {
            const li = document.createElement('li');
            const liSpan = document.createElement('span');
            li.appendChild(liSpan);
            liSpan.textContent = url;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                // Remove the URL from the list.
                const updatedUrls = result.excludedUrls.filter((u) => u !== url);
                browser.storage.sync.set({ 'excludedUrls': updatedUrls }).then(() => {
                    li.remove();
                });
            });
            li.appendChild(removeButton);
            excludedUrlsList.appendChild(li);
        });
    };
});


// Add an event listener to the range input
toolbarHeightRangeInput.addEventListener('input', function() {
    const currentValue = toolbarHeightRangeInput.value;
    currentValueDisplay.textContent = currentValue;
});  


// Add a URL to the excluded URLs list.
addUrlButton.addEventListener('click', () => {
    const urlToAdd = customUrlInput.value;
    if (urlToAdd) {
        // Add the URL to the list.
        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || [];
            excludedUrls.push(urlToAdd);
            browser.storage.sync.set({ 'excludedUrls': excludedUrls }).then(() => {
                // Add the URL to the displayed list.
                const li = document.createElement('li');
                const liSpan = document.createElement('span');
                li.appendChild(liSpan);
                liSpan.textContent = urlToAdd;
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => {
                    // Remove the URL from the list.
                    const updatedUrls = excludedUrls.filter((u) => u !== urlToAdd);
                    browser.storage.sync.set({ 'excludedUrls': updatedUrls }).then(() => {
                        li.remove();
                    });
                });
                li.appendChild(removeButton);
                excludedUrlsList.appendChild(li);
                customUrlInput.value = ''; // Clear the input field.
            });
        });
    };
});


// Save the values to storage when the Save button is clicked.
saveButton.addEventListener('click', () => {
    const homepageURL = homepageURLInput.value;
    const newTabURL = newTabURLInput.value;
    const toolbarHeight = toolbarHeightRangeInput.value;
    const defaultPosition = defaultPositionSelect.value;
    const iconTheme = iconThemeSelect.value;
    const hideMethod = hideMethodSelect.value;
    // Save the values to storage.
    browser.storage.sync.set({ 'homepageURL': homepageURL, 'newTabURL': newTabURL, 'toolbarHeight': toolbarHeight, 'defaultPosition': defaultPosition, 'iconTheme': iconTheme, 'hideMethod': hideMethod }).then(() => {
        statusMessage.textContent = 'Settings saved!';
        statusMessage.style.color = '#007acc';
        setTimeout(function() {
            statusMessage.style.color = '#fff';
        }, 1000);
    });
});

