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
// const buttonsInToolbarDivQuestionMark = document.getElementById('buttonsInToolbarDivQuestionMark');
// const buttonsInToolbarDivInfo = document.getElementById('buttonsInToolbarDivInfo');
// const buttonsInToolbarDivCloseButton = document.getElementById('buttonsInToolbarDivCloseButton');
// const buttonsInToolbarDivSelect = document.getElementById('buttonsInToolbarDiv');
const buttonList = document.getElementById('button-list');
const customUrlQuestionMark = document.getElementById('customUrlQuestionMark');
const customUrlInfo = document.getElementById('customUrlInfo');
const customUrlCloseButton = document.getElementById('customUrlCloseButton');
const generalResetButton = document.getElementById('generalResetButton');
const versionHeader = document.getElementById('versionHeader');
const version = browser.runtime.getManifest().version

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
	{ id: 'homeButton', label: ' Home', defaultChecked: true },
	{ id: 'duplicateTabButton', label: ' Duplicate tab', defaultChecked: true },
	//{ id: 'menuButton', label: ' Menu', defaultChecked: true },
	{ id: 'closeTabButton', label: ' Close tab', defaultChecked: true },
	{ id: 'newTabButton', label: ' New tab', defaultChecked: true },
	{ id: 'hideButton', label: ' Hide toolbar', defaultChecked: true },
	{ id: 'moveToolbarButton', label: ' Move toolbar', defaultChecked: true },
	//{ id: 'devToolsButton', label: ' Dev tools (Eruda)', defaultChecked: true },
	{ id: 'goBackButton', label: ' Go back', defaultChecked: false },
	{ id: 'goForwardButton', label: ' Go forward', defaultChecked: false },
	{ id: 'reloadButton', label: ' Reload page', defaultChecked: false },
	{ id: 'settingsButton', label: ' Open add-on settings', defaultChecked: false },
];

// Code to remove.
// for (let i = 1; i <= buttonsData.length; i++) {
//     const option = document.createElement('option');
//     option.value = i;
//     option.textContent = i;
//     buttonsInToolbarDivSelect.appendChild(option);
// }

function createButtonElement(buttonData, isChecked, iconTheme, defaultPosition) {
	const div = document.createElement('div');
	div.classList.add('list__item');
	div.classList.add('is-idle');
	div.classList.add('js-item');
	const dragHandle = document.createElement('div');
	dragHandle.classList.add('drag-handle');
	dragHandle.classList.add('js-drag-handle');
	div.appendChild(dragHandle);
	const divIcon = document.createElement('img');
	divIcon.classList.add('list__item__icon');
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
	const checkboxLabel = document.createElement('label');
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.id = buttonData.id;
	checkbox.checked = isChecked;
	checkboxLabel.appendChild(checkbox);
	checkboxLabel.appendChild(document.createTextNode(` ${buttonData.label}`));
	div.appendChild(checkboxLabel);
	return div;
}

// Update the checkbox order based on the visual order.
function updateButtonOrder() {
	const buttonList = document.getElementById('button-list');
	const checkboxes = buttonList.querySelectorAll('label input[type="checkbox"]');
	const buttonOrder = Array.from(checkboxes).map(checkbox => checkbox.id);
	browser.storage.sync.set({
		buttonOrder: buttonOrder,
	});
}

// Function to get the states of the checkboxes
function getCheckboxStates() {
	const checkboxes = document.querySelectorAll('label input[type="checkbox"]');
	const checkboxStates = {};
	checkboxes.forEach(checkbox => {
		checkboxStates[checkbox.id] = checkbox.checked;
	});
	return checkboxStates;
}

// Load the values from storage.
browser.storage.sync.get(['homepageURL', 'newTabURL', 'toolbarHeight', 'defaultPosition', 'iconTheme', 'hideMethod', 'excludedUrls', 'buttonOrder', 'checkboxStates', 'toolbarTransparency']).then((result) => {
	homepageURLInput.value = result.homepageURL;
	newTabURLInput.value = result.newTabURL;
	toolbarHeightRangeInput.value = result.toolbarHeight;
	toolbarTransparencyRangeInput.value = result.toolbarTransparency
	currentValueHeight.textContent = result.toolbarHeight;
	currentValueTransparency.textContent = result.toolbarTransparency
	defaultPositionSelect.value = result.defaultPosition;
	iconThemeSelect.value = result.iconTheme;
	hideMethodSelect.value = result.hideMethod;
	//buttonsInToolbarDivSelect.value = result.buttonsInToolbarDiv;
	if (result.buttonOrder && result.checkboxStates) {
		// Create and append the button elements based on the order
		result.buttonOrder.forEach(buttonId => {
			const buttonData = buttonsData.find(button => button.id === buttonId);
			if (buttonData) {
				const buttonElement = createButtonElement(buttonData, result.checkboxStates[buttonId], result.iconTheme, result.defaultPosition);
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
	//const buttonsInToolbarDiv = buttonsInToolbarDivSelect.value;
	const checkboxes = document.querySelectorAll('label input[type="checkbox"]');
	const buttonOrder = Array.from(checkboxes).map(checkbox => checkbox.id);
	browser.storage.sync.set({
		//'buttonsInToolbarDiv': buttonsInToolbarDiv,
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

// Handle drag and drop. Tutorial: https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example
let listContainer
let draggableItem
let pointerStartX
let pointerStartY
let itemsGap = 0
let items = []

function getAllItems() {
	if (!items?.length) {
		items = Array.from(listContainer.querySelectorAll('.js-item'))
	}
	return items
}

function getIdleItems() {
	return getAllItems().filter((item) => item.classList.contains('is-idle'))
}

function isItemAbove(item) {
	return item.hasAttribute('data-is-above')
}

function isItemToggled(item) {
	return item.hasAttribute('data-is-toggled')
}

function setup() {
	listContainer = document.querySelector('.js-list')
	if (!listContainer) return
	listContainer.addEventListener('mousedown', dragStart)
	listContainer.addEventListener('touchstart', dragStart)
	document.addEventListener('mouseup', dragEnd)
	document.addEventListener('touchend', dragEnd)
}

function dragStart(e) {
	if (e.target.classList.contains('js-drag-handle')) {
		draggableItem = e.target.closest('.js-item')
	}
	if (!draggableItem) return
	pointerStartX = e.clientX || e.touches[0].clientX
	pointerStartY = e.clientY || e.touches[0].clientY
	setItemsGap()
	disablePageScroll()
	initDraggableItem()
	initItemsState()
	document.addEventListener('mousemove', drag)
	document.addEventListener('touchmove', drag, { passive: false })
}

function setItemsGap() {
	if (getIdleItems().length <= 1) {
		itemsGap = 0
		return
	}	
	const item1 = getIdleItems()[0]
	const item2 = getIdleItems()[1]
	const item1Rect = item1.getBoundingClientRect()
	const item2Rect = item2.getBoundingClientRect()
	itemsGap = Math.abs(item1Rect.bottom - item2Rect.top)
}

function disablePageScroll() {
	document.body.style.overflow = 'hidden'
	document.body.style.touchAction = 'none'
	document.body.style.userSelect = 'none'
}

function initItemsState() {
	getIdleItems().forEach((item, i) => {
		if (getAllItems().indexOf(draggableItem) > i) {
			item.dataset.isAbove = ''
		}
	})
}

function initDraggableItem() {
	draggableItem.classList.remove('is-idle')
	draggableItem.classList.add('is-draggable')
}

function drag(e) {
	if (!draggableItem) return
	e.preventDefault()
	const clientX = e.clientX || e.touches[0].clientX
	const clientY = e.clientY || e.touches[0].clientY
	const pointerOffsetX = clientX - pointerStartX
	const pointerOffsetY = clientY - pointerStartY
	draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`
	updateIdleItemsStateAndPosition()
}

function updateIdleItemsStateAndPosition() {
	const draggableItemRect = draggableItem.getBoundingClientRect()
	const draggableItemY = draggableItemRect.top + draggableItemRect.height / 2
	// Update state
	getIdleItems().forEach((item) => {
		const itemRect = item.getBoundingClientRect()
		const itemY = itemRect.top + itemRect.height / 2
		if (isItemAbove(item)) {
			if (draggableItemY <= itemY) {
				item.dataset.isToggled = ''
			} else {
				delete item.dataset.isToggled
			}
		} else {
			if (draggableItemY >= itemY) {
				item.dataset.isToggled = ''
			} else {
				delete item.dataset.isToggled
			}
		}
	})
	// Update position
	getIdleItems().forEach((item) => {
		if (isItemToggled(item)) {
			const direction = isItemAbove(item) ? 1 : -1
			item.style.transform = `translateY(${
				direction * (draggableItemRect.height + itemsGap)
			}px)`
		} else {
			item.style.transform = ''
		}
	})
}

function dragEnd() {
	if (!draggableItem) return
	applyNewItemsOrder()
	cleanup()
}

function applyNewItemsOrder() {
	const reorderedItems = []
	getAllItems().forEach((item, index) => {
		if (item === draggableItem) {
			return
		}
		if (!isItemToggled(item)) {
			reorderedItems[index] = item
			return
		}
		const newIndex = isItemAbove(item) ? index + 1 : index - 1
		reorderedItems[newIndex] = item
	})
	for (let index = 0; index < getAllItems().length; index++) {
		const item = reorderedItems[index]
		if (typeof item === 'undefined') {
			reorderedItems[index] = draggableItem
		}
	}
	reorderedItems.forEach((item) => {
		listContainer.appendChild(item)
	})
}

function cleanup() {
	itemsGap = 0
	items = []
	unsetDraggableItem()
	unsetItemState()
	enablePageScroll()
	document.removeEventListener('mousemove', drag)
	document.removeEventListener('touchmove', drag)
}

function unsetDraggableItem() {
	draggableItem.style = null
	draggableItem.classList.remove('is-draggable')
	draggableItem.classList.add('is-idle')
	draggableItem = null
}

function unsetItemState() {
	getIdleItems().forEach((item, i) => {
		delete item.dataset.isAbove
		delete item.dataset.isToggled
		item.style.transform = ''
	})
}

function enablePageScroll() {
	document.body.style.overflow = ''
	document.body.style.touchAction = ''
	document.body.style.userSelect = ''
}

setup()
