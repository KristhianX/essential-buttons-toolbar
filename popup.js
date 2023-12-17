// Initialize the input fields with default values or values from storage.
const homepageURLInput = document.getElementById('homepageURL');
const newTabURLInput = document.getElementById('newTabURL');
const toolbarHeightRangeInput = document.getElementById('toolbarHeight');
const currentValueDisplay = document.getElementById('currentValue');
const defaultPositionSelect = document.getElementById('defaultPosition');
const iconThemeSelect = document.getElementById('iconTheme');
const hideMethodSelect = document.getElementById('hideMethod');
const generalSaveButton = document.getElementById('generalSaveButton');
const buttonsSaveButton = document.getElementById('buttonsSaveButton');
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
const buttonList = document.getElementById('button-list');
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


function showTab(tabId) {
    statusMessage.style.display = 'none';
    // Hide all content sections
    document.getElementById('generalSettings').style.display = tabId === 'generalTab' ? 'block' : 'none';
    document.getElementById('buttonsSettings').style.display = tabId === 'buttonsTab' ? 'block' : 'none';
    document.getElementById('excludeSettings').style.display = tabId === 'excludeTab' ? 'block' : 'none';
    
    // Remove background color from all tabs
    document.getElementById('generalTab').style.background = tabId === 'generalTab' ? '#444' : 'none';
    document.getElementById('buttonsTab').style.background = tabId === 'buttonsTab' ? '#444' : 'none';
    document.getElementById('excludeTab').style.background = tabId === 'excludeTab' ? '#444' : 'none';
}

// Function to create tabs dynamically
function createTab(tabId, tabText) {
    const tab = document.createElement('div');
    tab.id = tabId;
    tab.textContent = tabText;
    tab.addEventListener('click', function () {
        showTab(tabId);
    });
    document.getElementById('settingsTabs').appendChild(tab);
}

// Create tabs
createTab('generalTab', 'General');
createTab('buttonsTab', 'Buttons');
createTab('excludeTab', 'Exclude');


// Get the current page's URL and set it as the initial value for 'customUrl' input.
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
        customUrlInput.value = tabs[0].url;
    };
});


// Add an event listener to the range input.
toolbarHeightRangeInput.addEventListener('input', function() {
    const currentValue = toolbarHeightRangeInput.value;
    currentValueDisplay.textContent = currentValue;
});  


// Disable buttons and change order.
const buttonsData = [
    { id: 'homeButton', label: ' Home', defaultChecked: true },
    { id: 'duplicateTabButton', label: ' Duplicate tab', defaultChecked: true },
    { id: 'menuButton', label: ' Menu', defaultChecked: true },
    { id: 'closeTabButton', label: ' Close tab', defaultChecked: true },
    { id: 'newTabButton', label: ' New tab', defaultChecked: true },
    { id: 'hideButton', label: ' Hide toolbar', defaultChecked: true },
    { id: 'moveToolbarButton', label: ' Move toolbar', defaultChecked: true },
];

function moveUp(item) {
    if (item.previousElementSibling) {
        item.parentNode.insertBefore(item, item.previousElementSibling);
        updateButtonOrder();
    }
}

function moveDown(item) {
    if (item.nextElementSibling) {
        item.parentNode.insertBefore(item.nextElementSibling, item);
        updateButtonOrder();
    }
}

function updateButtonOrder() {
    const buttonList = document.getElementById('button-list');
    const checkboxes = buttonList.querySelectorAll('label input[type="checkbox"]');
    const buttonOrder = Array.from(checkboxes).map(checkbox => checkbox.id);
    
    // Update the checkbox order based on the visual order
    browser.storage.sync.set({
        buttonOrder: buttonOrder,
    });
}

function createButtonElement(buttonData, isChecked) {
    const li = document.createElement('li');
    const checkboxLabel = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = buttonData.id;
    checkbox.checked = isChecked;
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(document.createTextNode(` ${buttonData.label}`));
    li.appendChild(checkboxLabel);
    const moveUpButton = document.createElement('button');
    const moveUpButtonImg = document.createElement('img');
    moveUpButtonImg.src = browser.runtime.getURL('icons/featherIcons/chevronUp.svg');
    moveUpButton.appendChild(moveUpButtonImg);
    moveUpButton.classList.add('move-up-button');
    moveUpButton.onclick = function () {
        moveUp(li);
    };
    li.appendChild(moveUpButton);
    const moveDownButton = document.createElement('button');
    const moveDownButtonImg = document.createElement('img');
    moveDownButtonImg.src = browser.runtime.getURL('icons/featherIcons/chevronDown.svg');
    moveDownButton.appendChild(moveDownButtonImg);
    moveDownButton.classList.add('move-down-button');
    moveDownButton.onclick = function () {
        moveDown(li);
    };
    li.appendChild(moveDownButton);
    return li;
}


// Load the values from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'buttonOrder', 'checkboxStates']).then((result) => {
    homepageURLInput.value = result.homepageURL;
    newTabURLInput.value = result.newTabURL;
    toolbarHeightRangeInput.value = result.toolbarHeight;
    currentValueDisplay.textContent = result.toolbarHeight;
    defaultPositionSelect.value = result.defaultPosition;
    iconThemeSelect.value = result.iconTheme;
    hideMethodSelect.value = result.hideMethod;
    if (result.buttonOrder && result.checkboxStates) {
        // Create and append the button elements based on the order
        result.buttonOrder.forEach(buttonId => {
            const buttonData = buttonsData.find(button => button.id === buttonId);
            if (buttonData) {
                const buttonElement = createButtonElement(buttonData, result.checkboxStates[buttonId]);
                buttonList.appendChild(buttonElement);
            }
        });
    }
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


// Save the values to storage
generalSaveButton.addEventListener('click', () => {
    const homepageURL = homepageURLInput.value;
    const newTabURL = newTabURLInput.value;
    const toolbarHeight = toolbarHeightRangeInput.value;
    const defaultPosition = defaultPositionSelect.value;
    const iconTheme = iconThemeSelect.value;
    const hideMethod = hideMethodSelect.value;
    browser.storage.sync.set({
        'homepageURL': homepageURL,
        'newTabURL': newTabURL,
        'toolbarHeight': toolbarHeight,
        'defaultPosition': defaultPosition,
        'iconTheme': iconTheme,
        'hideMethod': hideMethod,
    }).then(() => {
        statusMessage.style.display = 'block';
        statusMessage.style.color = '#007acc';
        setTimeout(function () {
            statusMessage.style.color = '#fff';
        }, 1000);
    });
});


// Function to get the states of the checkboxes
function getCheckboxStates() {
    const checkboxes = document.querySelectorAll('label input[type="checkbox"]');
    const checkboxStates = {};
    checkboxes.forEach(checkbox => {
        checkboxStates[checkbox.id] = checkbox.checked;
    });
    return checkboxStates;
}


buttonsSaveButton.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('label input[type="checkbox"]');
    const buttonOrder = Array.from(checkboxes).map(checkbox => checkbox.id);
    browser.storage.sync.set({
        'buttonOrder': buttonOrder,
        'checkboxStates': getCheckboxStates(),
    }).then(() => {
        statusMessage.style.display = 'block';
        statusMessage.style.color = '#007acc';
        setTimeout(function () {
            statusMessage.style.color = '#fff';
        }, 1000);
    });
});
