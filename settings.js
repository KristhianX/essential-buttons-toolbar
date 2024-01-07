//
// Variables
//
const homepageURLInput = document.getElementById('homepageURL');
const newTabURLInput = document.getElementById('newTabURL');
const toolbarHeightRangeInput = document.getElementById('toolbarHeight');
const toolbarTransparencyRangeInput =document.getElementById('toolbarTransparency')
const defaultPositionSelect = document.getElementById('defaultPosition');
const iconThemeSelect = document.getElementById('iconTheme');
const hideMethodSelect = document.getElementById('hideMethod');
const customUrlInput = document.getElementById('customUrl');
const excludedUrlsList = document.getElementById('excludedUrls');
const version = browser.runtime.getManifest().version
let currentlyDisplayedDescription
const addonInfoCloseButton = document.getElementById('addonInfoCloseButton')
const checkbox = document.getElementById('disableUpdatesMsg');

//
// Setup conditions
//
browser.storage.local.get([ 'senderURL', 'installedOrUpdated', 'disableUpdatesMsg' ]).then((result) => {
	if (result.senderURL) {
		customUrlInput.value = result.senderURL;
		browser.storage.local.remove('senderURL');
	} else {
		customUrlInput.value = window.location.href;
	}
	if (result.installedOrUpdated === true) {
		addonInfo.style.display = 'block'
		headerInfo.style.display = 'none'
		browser.storage.local.set({ installedOrUpdated: false })
	}
	if (result.disableUpdatesMsg) {
		const isChecked = result.disableUpdatesMsg
		checkbox.checked = isChecked;
	}
})

//
// Load the values from storage
//
function loadValues() {
	// Remove existing .drag-able and li elements
	const dragableElements = document.querySelectorAll('.drag-able');
	dragableElements.forEach(element => {
		element.remove();
	});
	const liElements = excludedUrlsList.querySelectorAll('li');
	liElements.forEach(li => {
		li.remove();
	});
	browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'buttonOrder', 'checkboxStates', 'toolbarTransparency', 'buttonsInToolbarDiv']).then((result) => {
		homepageURLInput.value = result.homepageURL;
		newTabURLInput.value = result.newTabURL;
		currentValueHeight.textContent = result.toolbarHeight;
		toolbarHeightRangeInput.value = result.toolbarHeight;
		toolbarContainer.style.height = result.toolbarHeight + 'px'
		menuContainer.style.height = result.toolbarHeight + 'px'
		currentValueTransparency.textContent = result.toolbarTransparency
		toolbarTransparencyRangeInput.value = result.toolbarTransparency
		defaultPositionSelect.value = result.defaultPosition;
		iconThemeSelect.value = result.iconTheme;
		hideMethodSelect.value = result.hideMethod;
		// Create and append the button elements based on the order
		if (result.buttonOrder && result.checkboxStates) {
			let buttonsAppended = 0;
			result.buttonOrder.forEach(buttonId => {
				const buttonData = buttonsData.find(button => button.id === buttonId);
				if (buttonData) {
					const buttonElement = createButtonElement(buttonData, result.iconTheme, result.defaultPosition);
					// Append buttons based on the buttonsInToolbarDiv value
					if (result.checkboxStates[buttonId] && buttonsAppended < result.buttonsInToolbarDiv) {
						toolbarContainer.appendChild(buttonElement);
						buttonsAppended++;
					} else if (result.checkboxStates[buttonId]) {
						menuContainer.appendChild(buttonElement);
					} else {
						availableContainer.appendChild(buttonElement);
					}
				}
			});
		}
		if (result.excludedUrls) {
			const excludedUrls = result.excludedUrls || [];
			excludedUrls.forEach((url) => {
				const li = createLiElement(url);
				excludedUrlsList.appendChild(li);
			});
		};
	});
}

//
// Header info
//
versionHeader.textContent = version;
function handleCheckboxChange() {
	const isChecked = checkbox.checked;
	browser.storage.local.set({ 'disableUpdatesMsg': isChecked });
}

checkbox.addEventListener('change', handleCheckboxChange);

browser.storage.local.get('disableUpdatesMsg', function(result) {
	const isChecked = result.disableUpdatesFlag || false;
	checkbox.checked = isChecked;
});

//
// Help messages
//
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
buttonsSettingsQuestionMark.addEventListener('click', (e) => {
	e.preventDefault();
	buttonsSettingsInfo.style.display = 'block';
	buttonsSettingsQuestionMark.style.display = 'none';
});
buttonsSettingsCloseButton.addEventListener('click', () => {
	buttonsSettingsInfo.style.display = 'none';
	buttonsSettingsQuestionMark.style.display = 'inline-block';
})
infoCardCloseButton.addEventListener('click', closeButtonInfo)
addonInfoCloseButton.addEventListener('click', () => {
	addonInfo.style.display = 'none'
	headerInfo.style.display = 'inline-flex'
})
headerInfo.addEventListener('click', () => {
	headerInfo.style.display = 'none'
	addonInfo.style.display = 'block'
})

//
// Handle tabs
//
function createTab(tabId, tabText) {
	const tab = document.createElement('div');
	tab.id = tabId;
	tab.textContent = tabText;
	tab.addEventListener('click', function () {
		showTab(tabId);
	});
	document.getElementById('settingsTabs').appendChild(tab);
}

function showTab(tabId) {
	statusMessage.style.display = 'none';
	generalSettings.style.display = tabId === 'generalTab' ? 'block' : 'none';
	buttonsSettings.style.display = tabId === 'buttonsTab' ? 'block' : 'none';
	excludeSettings.style.display = tabId === 'excludeTab' ? 'block' : 'none'; 
	generalTab.style.background = tabId === 'generalTab' ? '#007acc' : 'none';
	buttonsTab.style.background = tabId === 'buttonsTab' ? '#007acc' : 'none';
	excludeTab.style.background = tabId === 'excludeTab' ? '#007acc' : 'none';
}

createTab('generalTab', 'General');
createTab('buttonsTab', 'Buttons');
createTab('excludeTab', 'Exclude');

//
// General settings
//
toolbarHeightRangeInput.addEventListener('input', function() {
	const currentValue = toolbarHeightRangeInput.value;
	currentValueHeight.textContent = currentValue;
});

toolbarTransparencyRangeInput.addEventListener('input', function() {
	const currentValue = toolbarTransparencyRangeInput.value;
	currentValueTransparency.textContent = currentValue;
});

//
// Buttons settings
//
const buttonsData = [
	{ id: 'homeButton', label: 'Home' },
	{ id: 'duplicateTabButton', label: 'Duplicate tab' },
	{ id: 'menuButton', label: 'Menu' },
	{ id: 'closeTabButton', label: 'Close tab' },
	{ id: 'undoCloseTabButton', label: 'Undo close tab(s)' },
	{ id: 'newTabButton', label: 'New tab' },
	{ id: 'hideButton', label: 'Hide toolbar' },
	{ id: 'moveToolbarButton', label: 'Move toolbar' },
	//{ id: 'devToolsButton', label: 'Dev tools (Eruda)' },
	{ id: 'goBackButton', label: 'Go back' },
	{ id: 'goForwardButton', label: 'Go forward' },
	{ id: 'reloadButton', label: 'Reload page' },
	{ id: 'settingsButton', label: 'Open add-on settings' },
	{ id: 'scrollTopButton', label: 'Scroll page to the top' },
	{ id: 'scrollBottomButton', label: 'Scroll page to the bottom' },
	{ id: 'closeAllTabsButton', label: 'Close all tabs' },
	{ id: 'closeOtherTabsButton', label: 'Close other tabs' },
];

function createButtonElement(buttonData, iconTheme, defaultPosition) {
	const div = document.createElement('div');
	div.classList.add('is-idle');
	div.classList.add('drag-able');
	div.setAttribute("id", buttonData.id);
	const divIcon = document.createElement('img');
	if (buttonData.id === 'moveToolbarButton') {
		if (defaultPosition === 'bottom') {
			divIcon.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronUp.svg');
		} else {
			divIcon.src = browser.runtime.getURL('icons/' + iconTheme + '/chevronDown.svg');                        
		}
	} else {
		divIcon.src = browser.runtime.getURL('icons/' + iconTheme + '/' + buttonData.id + '.svg');
	}
	div.appendChild(divIcon);
	return div;
}

function updateButtonOrder() {
	const buttons = Array.from(toolbarContainer.querySelectorAll('.drag-able'))
	.concat(Array.from(menuContainer.querySelectorAll('.drag-able')))
	.concat(Array.from(availableContainer.querySelectorAll('.drag-able')));
	const buttonOrder = buttons.map(button => button.id);
	return buttonOrder;
}

function getCheckboxStates() {
	const buttons = Array.from(toolbarContainer.querySelectorAll('.drag-able'))
	.concat(Array.from(menuContainer.querySelectorAll('.drag-able')))
	.concat(Array.from(availableContainer.querySelectorAll('.drag-able')));
	const checkboxStates = {};
	buttons.forEach(button => {
		checkboxStates[button.id] = toolbarContainer.contains(button) || menuContainer.contains(button);
	});
	return checkboxStates;
}

function displayButtonInfo(e) {	
	if (e.target.classList.contains('drag-able')) {
		setTimeout(function () {
			if (!isDragging) {
				closeButtonInfo()
				clickedItem = e.target;
				const buttonData = buttonsData.find(button => button.id === clickedItem.id);
				if (buttonData) {
					infoCard.style.display = 'block'
					infoCardTitle.textContent = buttonData.label;
					const descriptionDiv = document.getElementById('infoCardDescription');
					const descriptionDivId = `${clickedItem.id}Description`;
					currentlyDisplayedDescription = descriptionDiv.querySelector(`#${descriptionDivId}`);		
					if (currentlyDisplayedDescription) {
						currentlyDisplayedDescription.style.display = 'block';
					}
				}
			}
		}, 300);
	}
}

function closeButtonInfo() {
	if (currentlyDisplayedDescription) {
		currentlyDisplayedDescription.style.display = 'none';
		infoCard.style.display = 'none';
	}
}

//
// Exclude settings
//
function createLiElement(url) {
    const li = document.createElement('li');
    const liSpan = document.createElement('span');
    li.appendChild(liSpan);
    liSpan.textContent = url;
    const removeButton = document.createElement('button');
	removeButton.classList.add('remove-url');
    removeButton.textContent = 'Remove';

    li.appendChild(removeButton);
    return li;
}

function addToExcludedUrls() {
    const urlToAdd = customUrlInput.value;
    if (urlToAdd) {
        // Add the URL to the list.
        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || [];
            if (excludedUrls.includes(urlToAdd)) return;
            excludedUrls.push(urlToAdd);
            browser.storage.sync.set({ 'excludedUrls': excludedUrls }).then(() => {
                sendMessageToTabs();
                initializeToolbar();
                const li = createLiElement(urlToAdd);
                excludedUrlsList.appendChild(li);
                customUrlInput.value = ''; // Clear the input field.
            });
        });
    }
}

function removeFromExcludedUrls(e) {
    if (e.target.classList.contains('remove-url')) {
        const urlToRemove = e.target.previousElementSibling.textContent;
        const liElement = e.target.parentNode;

        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || [];
            const updatedUrls = excludedUrls.filter((u) => u !== urlToRemove);
            browser.storage.sync.set({ 'excludedUrls': updatedUrls }).then(() => {
                liElement.remove();
                sendMessageToTabs();
                initializeToolbar();
            });
        });
    }
}

excludedUrlsList.addEventListener('click', removeFromExcludedUrls);

addUrlButton.addEventListener('click', addToExcludedUrls)

excludedUrlsList.addEventListener('click', removeFromExcludedUrls)

//
// Save the values to storage and reload
//
generalSaveButton.addEventListener('click', () => {
	const homepageURL = homepageURLInput.value;
	const newTabURL = newTabURLInput.value;
	const toolbarHeight = toolbarHeightRangeInput.value;
	const toolbarTransparency = toolbarTransparencyRangeInput.value
	const defaultPosition = defaultPositionSelect.value;
	const iconTheme = iconThemeSelect.value;
	const hideMethod = hideMethodSelect.value;
	browser.storage.sync.set({
		'homepageURL': homepageURL,
		'newTabURL': newTabURL,
		'toolbarHeight': toolbarHeight,
		'toolbarTransparency': toolbarTransparency,
		'defaultPosition': defaultPosition,
		'iconTheme': iconTheme,
		'hideMethod': hideMethod,
	}).then(() => {
		statusMessage.style.display = 'block';
		statusMessage.style.color = '#007acc';
		sendMessageToTabs()
		initializeToolbar()
		setTimeout(function () {
			statusMessage.style.color = '#fff';
		}, 1000);
	});
});

generalResetButton.addEventListener('click', () => {
	const confirmed = window.confirm("Are you sure you want to reset settings to default?");
	if (confirmed) {
		browser.runtime.sendMessage({ action: 'resetSettings' }, response => {
			if (response.success) {
				loadValues();
				sendMessageToTabs()
				initializeToolbar()
			}
		});
	}
});

buttonsSaveButton.addEventListener('click', () => {
	const buttonsInToolbarDiv = toolbarContainer.querySelectorAll('.drag-able').length;
	browser.storage.sync.set({
		'buttonsInToolbarDiv': buttonsInToolbarDiv,
		'buttonOrder': updateButtonOrder(),
		'checkboxStates': getCheckboxStates(),
	}).then(() => {
		statusMessage.style.display = 'block';
		statusMessage.style.color = '#007acc';
		sendMessageToTabs()
		initializeToolbar()
		setTimeout(function () {
			statusMessage.style.color = '#fff';
		}, 1000);
	});
});

function sendMessageToTabs() {
	browser.tabs.query({ url: '*://*/*' }, function(tabs) {
	for (const tab of tabs) {
		browser.tabs.sendMessage(tab.id, { action: 'reloadToolbar' });
	}
});
}

loadValues()

//
// Tutorial: https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example
//
let containers
let draggableItem
let pointerStartX
let pointerStartY
let items = []
let prevRect = {}
let clientX
let clientY
let isDragging = false
let pointerOffsetX
let pointerOffsetY

function getAllItems() {
	if (!items?.length) {
		items = Array.from(containers.querySelectorAll('.drag-able'))
	}
	return items
}

function getIdleItems() {
	return getAllItems().filter((item) => item.classList.contains('is-idle'))
}

function setup() {
	containers = document.querySelector('.containers')
	if (!containers) return
	containers.addEventListener('mousedown', dragStart)
	containers.addEventListener('touchstart', dragStart)
	document.addEventListener('mouseup', dragEnd)
	document.addEventListener('touchend', dragEnd)
}

function dragStart(e) {
	if (e.target.classList.contains('drag-able')) {
		draggableItem = e.target
	}
	if (!draggableItem) return
	displayButtonInfo(e)
	pointerStartX = e.clientX || e.touches[0].clientX
	pointerStartY = e.clientY || e.touches[0].clientY
	disablePageScroll()
	initDraggableItem()
	prevRect = draggableItem.getBoundingClientRect()
	document.addEventListener('mousemove', drag)
	document.addEventListener('touchmove', drag, { passive: false })
}

function disablePageScroll() {
	document.body.style.overflow = 'hidden'
	document.body.style.touchAction = 'none'
	document.body.style.userSelect = 'none'
}

function initDraggableItem() {
	draggableItem.classList.remove('is-idle')
	draggableItem.classList.add('is-draggable')
}

function drag(e) {
	if (!draggableItem) return
	e.preventDefault()
	isDragging = true
	clientX = e.clientX || e.touches[0].clientX
	clientY = e.clientY || e.touches[0].clientY
	pointerOffsetX = clientX - pointerStartX
	pointerOffsetY = clientY - pointerStartY
	draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`
}

function dragEnd(e) {
	if (!draggableItem) return
	highlightDragged(draggableItem)
	applyNewItemsOrder()
	cleanup()
}

function highlightDragged(item) {
	item.style.background = '#6eb9f7';
	setTimeout(() => {
		item.style.background = '#444';
	}, 1000);
}

function applyNewItemsOrder() {
	if (Math.abs(pointerOffsetX) >= 5 || Math.abs(pointerOffsetY) >= 5) {
		const dropTarget = getDropTargetContainer();
		if (dropTarget) {
			if (dropTarget.id === 'menuContainer' && draggableItem.id === 'menuButton') {
				unsetDraggableItem();
				return
			}
			const draggedRect = draggableItem.getBoundingClientRect();
			const targetItems = dropTarget.querySelectorAll('.is-idle');
			let insertBeforeItem = null;
			for (const targetItem of targetItems) {
				const targetRect = targetItem.getBoundingClientRect();
				if (draggedRect.top <= targetRect.bottom && draggedRect.left <= targetRect.left) {
					insertBeforeItem = targetItem;
					break;
				}
			}
			dropTarget.insertBefore(draggableItem, insertBeforeItem);
		}
	}
	unsetDraggableItem();
}

function getDropTargetContainer() {
	const dropTargets = document.querySelectorAll('.drop-target');
	for (const target of dropTargets) {
		const rect = target.getBoundingClientRect();
		if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
			return target;
		}
	}
	return null;
}

function cleanup() {
	items = []
	isDragging = false
	enablePageScroll()
	document.removeEventListener('mousemove', drag)
	document.removeEventListener('touchmove', drag)
}

function unsetDraggableItem() {
	draggableItem.style.transform = null
	draggableItem.classList.remove('is-draggable')
	draggableItem.classList.add('is-idle')
	draggableItem = null
}

function enablePageScroll() {
	document.body.style.overflow = ''
	document.body.style.touchAction = ''
	document.body.style.userSelect = ''
}

setup()
