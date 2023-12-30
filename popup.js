// Variables.
const homepageURLInput = document.getElementById('homepageURL');
const newTabURLInput = document.getElementById('newTabURL');
const toolbarHeightRangeInput = document.getElementById('toolbarHeight');
const toolbarTransparencyRangeInput =document.getElementById('toolbarTransparency')
const currentValueHeight = document.getElementById('currentValueHeight');
const currentValueTransparency = document.getElementById('currentValueTransparency');
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
const customUrlQuestionMark = document.getElementById('customUrlQuestionMark');
const customUrlInfo = document.getElementById('customUrlInfo');
const customUrlCloseButton = document.getElementById('customUrlCloseButton');
const generalResetButton = document.getElementById('generalResetButton');
const versionHeader = document.getElementById('versionHeader');
const version = browser.runtime.getManifest().version
const toolbarContainer = document.getElementById('toolbarContainer');
const menuContainer = document.getElementById('menuContainer');
const availableContainer = document.getElementById('availableContainer');

// Get version number.
versionHeader.textContent = version;

// Information messages.
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
// buttonsInToolbarDivQuestionMark.addEventListener('click', (e) => {
//     e.preventDefault();
//     buttonsInToolbarDivInfo.style.display = 'block';
//     buttonsInToolbarDivQuestionMark.style.display = 'none';
// });
// buttonsInToolbarDivCloseButton.addEventListener('click', () => {
//     buttonsInToolbarDivInfo.style.display = 'none';
//     buttonsInToolbarDivQuestionMark.style.display = 'inline-block';
// })

// Handle settings tabs.
function showTab(tabId) {
	statusMessage.style.display = 'none';
	// Display selected tab.
	document.getElementById('generalSettings').style.display = tabId === 'generalTab' ? 'block' : 'none';
	document.getElementById('buttonsSettings').style.display = tabId === 'buttonsTab' ? 'block' : 'none';
	document.getElementById('excludeSettings').style.display = tabId === 'excludeTab' ? 'block' : 'none'; 
	// Change background color of the tabs buttons.
	document.getElementById('generalTab').style.background = tabId === 'generalTab' ? '#007acc' : 'none';
	document.getElementById('buttonsTab').style.background = tabId === 'buttonsTab' ? '#007acc' : 'none';
	document.getElementById('excludeTab').style.background = tabId === 'excludeTab' ? '#007acc' : 'none';
}

// Function to create tabs buttons dynamically.
function createTab(tabId, tabText) {
	const tab = document.createElement('div');
	tab.id = tabId;
	tab.textContent = tabText;
	tab.addEventListener('click', function () {
		showTab(tabId);
	});
	document.getElementById('settingsTabs').appendChild(tab);
}

// Create tabs buttons.
createTab('generalTab', 'General');
createTab('buttonsTab', 'Buttons');
createTab('excludeTab', 'Exclude');

// Get the current page's URL and set it as the initial value for 'customUrl' input.
browser.storage.local.get('senderURL').then((result) => {
	if (result.senderURL) {
		customUrlInput.value = result.senderURL;
		browser.storage.local.remove('senderURL');
	} else {
		customUrlInput.value = window.location.href;
	}
})

// Add an event listener to the toolbar height range input.
toolbarHeightRangeInput.addEventListener('input', function() {
	const currentValue = toolbarHeightRangeInput.value;
	currentValueHeight.textContent = currentValue;
});

toolbarTransparencyRangeInput.addEventListener('input', function() {
	const currentValue = toolbarTransparencyRangeInput.value;
	currentValueTransparency.textContent = currentValue;
});

// Buttons list creation.
const buttonsData = [
	{ id: 'homeButton', label: ' Home' },
	{ id: 'duplicateTabButton', label: ' Duplicate tab' },
	{ id: 'menuButton', label: ' Menu' },
	{ id: 'closeTabButton', label: ' Close tab' },
	{ id: 'undoCloseTabButton', label: ' Undo close tab' },
	{ id: 'newTabButton', label: ' New tab' },
	{ id: 'hideButton', label: ' Hide toolbar' },
	{ id: 'moveToolbarButton', label: ' Move toolbar' },
	//{ id: 'devToolsButton', label: ' Dev tools (Eruda)' },
	{ id: 'goBackButton', label: ' Go back' },
	{ id: 'goForwardButton', label: ' Go forward' },
	{ id: 'reloadButton', label: ' Reload page' },
	{ id: 'settingsButton', label: ' Open add-on settings' },
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

// Update the checkbox order based on the visual order.
function updateButtonOrder() {
	const buttons = Array.from(toolbarContainer.querySelectorAll('.drag-able'))
	.concat(Array.from(menuContainer.querySelectorAll('.drag-able')))
	.concat(Array.from(availableContainer.querySelectorAll('.drag-able')));
	const buttonOrder = buttons.map(button => button.id);
	return buttonOrder;
}

// Function to get the states of the buttons
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

// Load the values from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'buttonOrder', 'checkboxStates', 'toolbarTransparency', 'buttonsInToolbarDiv']).then((result) => {
	homepageURLInput.value = result.homepageURL;
	newTabURLInput.value = result.newTabURL;
	toolbarHeightRangeInput.value = result.toolbarHeight;
	toolbarTransparencyRangeInput.value = result.toolbarTransparency
	currentValueHeight.textContent = result.toolbarHeight;
	currentValueTransparency.textContent = result.toolbarTransparency
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
		setTimeout(function () {
			statusMessage.style.color = '#fff';
		}, 1000);
	});
});

generalResetButton.addEventListener('click', () => {
	const confirmed = window.confirm("Are you sure you want to reset settings to default? This will reload the page.");
	if (confirmed) {
		browser.runtime.sendMessage({ action: 'resetSettings' });
		window.location.reload();
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
		setTimeout(function () {
			statusMessage.style.color = '#fff';
		}, 1000);
	});
});

// Tutorial: https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example
let containers
let draggableItem
let pointerStartX
let pointerStartY
let items = []
let prevRect = {}
let clientX
let clientY

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
		draggableItem = e.target.closest('.drag-able')
	}
	if (!draggableItem) return
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
	clientX = e.clientX || e.touches[0].clientX
	clientY = e.clientY || e.touches[0].clientY
	const pointerOffsetX = clientX - pointerStartX
	const pointerOffsetY = clientY - pointerStartY
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
	const dropTarget = getDropTargetContainer();
	if (dropTarget) {
		const draggedRect = draggableItem.getBoundingClientRect();
		const targetItems = dropTarget.querySelectorAll('.is-idle');
		let insertBeforeItem = null;
		for (const targetItem of targetItems) {
			const targetRect = targetItem.getBoundingClientRect();
			if (dropTarget.id === 'availableContainer') {
				if (draggedRect.top <= targetRect.bottom && draggedRect.left <= targetRect.left) {
					insertBeforeItem = targetItem;
					break;
				}
			} else {
				if (draggedRect.left <= targetRect.left) {
					insertBeforeItem = targetItem;
					break;
				}
			}
		}
		dropTarget.insertBefore(draggableItem, insertBeforeItem);
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
