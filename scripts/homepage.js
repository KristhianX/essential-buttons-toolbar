const overlay = document.querySelector('#main-overlay')
const topSitesGrid = document.querySelector('.top-sites-grid')
const addTopSiteButton = document.querySelector('#add-top-site-button')
const removeTopSitesButton = document.querySelector('#remove-top-sites-button')
const moveTopSitesButton = document.querySelector('#move-top-sites-button')
let topSitesList = []
let addTopSitePrompt
let lastGroup
let removeTopSitesMode
let moveTopSitesMode
let draggableItem
let pointerStartX
let pointerStartY
let pointerDeltaX
let pointerDeltaY

function getTopSites() {
    return browser.storage.local
        .get('topSites')
        .then((result) => {
            topSitesList = result.topSites || []
        })
        .catch((error) => {
            console.error('Error getting top sites:', error)
        })
}

async function createTopSitesButtons() {
    topSitesList.forEach(async (topSite) => {
        await createTopSitesGroup(topSite.group)
        const groupDiv = document.querySelector(`#group-${topSite.group}`)
        const topSiteElement = await createTopSiteElement(topSite)
        groupDiv.appendChild(topSiteElement)
    })
}

async function createTopSitesGroup(groupNumber) {
    const groupNumberDiv = document.querySelector(`#group-${groupNumber}`)
    if (!groupNumberDiv) {
        const group = document.createElement('div')
        const groupOverlay = document.createElement('div')
        const topSiteRemoveDiv = document.createElement('div')
        group.classList.add('top-site-group')
        group.setAttribute('id', `group-${groupNumber}`)
        groupOverlay.classList.add('top-site-group-overlay')
        topSiteRemoveDiv.classList.add('top-site-remove-div')
        group.appendChild(groupOverlay)
        group.appendChild(topSiteRemoveDiv)
        topSitesGrid.appendChild(group)
    }
}

async function retrieveFavicon(faviconUrl) {
    try {
        const response = await fetch(faviconUrl)
        if (response.ok) {
            const blob = await response.blob()
            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = function () {
                    resolve(reader.result)
                }
                reader.readAsDataURL(blob)
            })
            return dataUrl
        } else {
            console.error('Error downloading favicon:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error downloading favicon:', error)
        return null
    }
}

function generatePlaceholder() {
    const faviconUrlInput = document.getElementById('top-site-favicon-url')
    const nameInput = document.getElementById('top-site-name').value
    const previewImage = document.getElementById('top-site-preview-image')
    faviconUrlInput.value = ''
    previewImage.style.content = 'none'
    previewImage.style.background = '#555'
    previewImage.style.borderRadius = '50%'
    previewImage.textContent = nameInput
        ? nameInput.trim()[0].toUpperCase()
        : 'N'
}

function fetchFaviconFromUrl() {
    const faviconUrlInput = document.getElementById('top-site-favicon-url')
    const previewImage = document.getElementById('top-site-preview-image')
    const customFaviconUrl = faviconUrlInput.value
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = 'url(' + customFaviconUrl + ')'
}

function fetchFaviconFromDuckDuckGo() {
    const urlInput = document.getElementById('top-site-url').value
    if (!urlInput) return
    const previewImage = document.getElementById('top-site-preview-image')
    let domain = urlInput.replace(/^https?:\/\//, '')
    domain = domain.split('/')[0]
    const duckDuckGoFaviconUrl =
        'https://icons.duckduckgo.com/ip3/' + domain + '.ico'
    document.getElementById('top-site-favicon-url').value = duckDuckGoFaviconUrl
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = 'url(' + duckDuckGoFaviconUrl + ')'
}

function fetchFaviconFromGoogle() {
    const urlInput = document.getElementById('top-site-url').value
    if (!urlInput) return
    const previewImage = document.getElementById('top-site-preview-image')
    const googleFaviconUrl =
        'https://www.google.com/s2/favicons?domain=' + urlInput + '&sz=64'
    document.getElementById('top-site-favicon-url').value = googleFaviconUrl
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = `url(${googleFaviconUrl})`
}

async function createTopSiteElement(topSite) {
    const a = document.createElement('a')
    const span = document.createElement('span')
    span.textContent = topSite.name
    a.href = topSite.url
    if (topSite.faviconUrl) {
        const img = document.createElement('img')
        img.src = topSite.faviconUrl
        a.appendChild(img)
    } else {
        const placeholderImage = document.createElement('div')
        placeholderImage.className = 'placeholder-image'
        placeholderImage.textContent = topSite.name.trim()[0].toUpperCase()
        a.appendChild(placeholderImage)
    }
    a.appendChild(span)
    return a
}

function createPrompt() {
    addTopSiteButton.style.backgroundColor = 'var(--primary-color)'
    setTimeout(() => {
        addTopSitePrompt = document.createElement('div')
        overlay.style.display = 'block'
        addTopSitePrompt.classList.add('top-site-prompt')
        addTopSitePrompt.innerHTML = `
        <h2>Add a new top site</h2>
        <h3>Preview</h3>
        <div id="top-site-preview">
        <div id="top-site-preview-image"></div>
        <span id="top-site-preview-name"></span>
        </div>
        <div class="favicon-options">
        <label class="radio-container">
            <input type="radio" name="favicon-option" value="custom" checked>
            Custom favicon
        </label>
        <label class="radio-container">
            <input type="radio" name="favicon-option" value="duckduckgo">
            Get favicon from DuckDuckGo
        </label>
        <label class="radio-container">
            <input type="radio" name="favicon-option" value="google">
            Get favicon from Google
        </label>
        </div>
        <input type="text" placeholder="Name" id="top-site-name" required>
        <input type="text" placeholder="URL (https://www.example.com)" id="top-site-url" required>
        <input type="text" placeholder="Favicon URL (optional)" id="top-site-favicon-url">
        <button id="top-site-submit" type="button">Add</button>
        <button id="top-site-cancel" type="button">Cancel</button>
    `
        document.body.appendChild(addTopSitePrompt)
        document
            .getElementById('top-site-name')
            .addEventListener('input', updatePreview)
        document
            .getElementById('top-site-url')
            .addEventListener('input', updatePreview)
        document
            .getElementById('top-site-favicon-url')
            .addEventListener('input', updatePreview)
        document
            .querySelector('input[name="favicon-option"][value="duckduckgo"]')
            .addEventListener('change', updatePreview)
        document
            .querySelector('input[name="favicon-option"][value="google"]')
            .addEventListener('change', updatePreview)
        document
            .querySelector('input[name="favicon-option"][value="custom"]')
            .addEventListener('change', updatePreview)
        addTopSitePrompt
            .querySelector('#top-site-submit')
            .addEventListener('click', addTopSite)
        addTopSitePrompt
            .querySelector('#top-site-cancel')
            .addEventListener('click', () => {
                addTopSitePrompt.remove()
                overlay.style.display = 'none'
                addTopSiteButton.style.background = 'none'
            })
        generatePlaceholder()
    }, 100)
}

function updatePreview() {
    const nameInput = document.getElementById('top-site-name')
    const previewName = document.getElementById('top-site-preview-name')
    const faviconUrlInput = document.getElementById('top-site-favicon-url')
    const faviconUrlInputValue = faviconUrlInput.value
    const selectedFaviconOption = document.querySelector(
        'input[name="favicon-option"]:checked'
    ).value
    previewName.textContent = nameInput.value
    switch (selectedFaviconOption) {
        case 'custom':
            if (
                !faviconUrlInputValue ||
                faviconUrlInputValue.startsWith(
                    'https://icons.duckduckgo.com/ip3/'
                ) ||
                faviconUrlInputValue.startsWith(
                    'https://www.google.com/s2/favicons?domain='
                )
            ) {
                generatePlaceholder()
            } else {
                fetchFaviconFromUrl()
            }
            break
        case 'duckduckgo':
            fetchFaviconFromDuckDuckGo()
            break
        case 'google':
            fetchFaviconFromGoogle()
            break
    }
}

async function addTopSite() {
    const nameInput = addTopSitePrompt.querySelector('#top-site-name')
    const urlInput = addTopSitePrompt.querySelector('#top-site-url')
    const faviconUrlInput = addTopSitePrompt.querySelector(
        '#top-site-favicon-url'
    )
    const name = nameInput.value
    const url = urlInput.value
    const faviconUrl = faviconUrlInput.value
    if (!name || !url) {
        alert('Name and URL are mandatory.')
        return
    }
    lastGroup =
        topSitesList.reduce((maxGroup, topSite) => {
            return Math.max(maxGroup, topSite.group)
        }, 0) + 1
    let dataUrl
    try {
        if (faviconUrl) {
            dataUrl = await retrieveFavicon(faviconUrl)
        }
    } catch (error) {
        console.error('Error retrieving favicon data URL:', error)
    }
    const newTopSite = {
        name: name,
        url: url,
        faviconUrl: dataUrl || '',
        group: lastGroup,
    }
    topSitesList.push(newTopSite)
    browser.storage.local.set({ topSites: topSitesList })
    addTopSitePrompt.remove()
    createTopSitesGroup(lastGroup)
    const groupNumber = document.querySelector(`#group-${lastGroup}`)
    const topSiteElement = await createTopSiteElement(
        topSitesList[topSitesList.length - 1]
    )
    groupNumber.appendChild(topSiteElement)
    overlay.style.display = 'none'
    addTopSiteButton.style.background = 'none'
}

function removeTopSiteElements() {
    const groupsOverlays = document.querySelectorAll('.top-site-group-overlay')
    const topSiteRemoveDivs = document.querySelectorAll('.top-site-remove-div')
    if (removeTopSitesMode) {
        removeTopSitesMode = false
        removeTopSitesButton.style.background = 'none'
        addTopSiteButton.style.display = 'inline-flex'
        moveTopSitesButton.style.display = 'inline-flex'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.remove('show')
        }
        for (const topSiteRemoveDiv of topSiteRemoveDivs) {
            topSiteRemoveDiv.classList.remove('show')
        }
    } else {
        removeTopSitesMode = true
        removeTopSitesButton.style.backgroundColor = 'var(--secondary-color)'
        addTopSiteButton.style.display = 'none'
        moveTopSitesButton.style.display = 'none'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.add('show')
        }
        for (const topSiteRemoveDiv of topSiteRemoveDivs) {
            topSiteRemoveDiv.classList.add('show')
        }
        document.body.addEventListener('click', removeTopSite)
    }
}

function removeTopSite(event) {
    if (event.target.classList.contains('top-site-remove-div')) {
        const groupNumber = event.target.parentElement.id.replace('group-', '')
        const topSiteIndex = topSitesList.findIndex(
            (site) => site.group == groupNumber
        )
        if (topSiteIndex !== -1) {
            topSitesList.splice(topSiteIndex, 1)
            browser.storage.local
                .set({ topSites: topSitesList })
                .catch((error) => {
                    console.error('Error updating local storage:', error)
                })
        }
        event.target.parentElement.remove()
    }
}

function moveTopSitesElements() {
    const groupsOverlays = document.querySelectorAll('.top-site-group-overlay')
    if (moveTopSitesMode) {
        moveTopSitesMode = false
        moveTopSitesButton.style.background = 'none'
        addTopSiteButton.style.display = 'inline-flex'
        removeTopSitesButton.style.display = 'inline-flex'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.remove('show')
        }
        disableDragging()
        saveNewOrder()
    } else {
        moveTopSitesMode = true
        moveTopSitesButton.style.backgroundColor = 'var(--primary-color)'
        addTopSiteButton.style.display = 'none'
        removeTopSitesButton.style.display = 'none'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.add('show')
            groupOverlay.parentElement.classList.add('is-idle')
        }
        enableDragging()
    }
}

function enableDragging() {
    topSitesGrid.addEventListener('mousedown', dragStart)
    topSitesGrid.addEventListener('touchstart', dragStart)
    document.addEventListener('mouseup', dragEnd)
    document.addEventListener('touchend', dragEnd)
}

function disableDragging() {
    topSitesGrid.removeEventListener('mousedown', dragStart)
    topSitesGrid.removeEventListener('touchstart', dragStart)
    document.removeEventListener('mouseup', dragEnd)
    document.removeEventListener('touchend', dragEnd)
}

function saveNewOrder() {
    const groupDivs = document.querySelectorAll('.top-site-group')
    const newOrder = []
    groupDivs.forEach((groupDiv) => {
        const groupNumber = parseInt(groupDiv.id.replace('group-', ''))
        const topSiteElements = groupDiv.querySelectorAll('a')
        topSiteElements.forEach((topSiteElement) => {
            const url = topSiteElement.href
            const topSite = topSitesList.find((site) => site.url === url)
            if (topSite) {
                newOrder.push({
                    name: topSite.name,
                    url: topSite.url,
                    faviconUrl: topSite.faviconUrl,
                    group: groupNumber,
                })
            }
        })
    })
    topSitesList = newOrder
    browser.storage.local.set({ topSites: topSitesList }).catch((error) => {
        console.error('Error updating local storage:', error)
    })
}

function dragStart(e) {
    if (draggableItem) return
    if (e.target.parentElement.classList.contains('top-site-group')) {
        draggableItem = e.target.parentElement
    }
    if (!draggableItem) return
    pointerStartX = e.clientX || e.touches[0].clientX
    pointerStartY = e.clientY || e.touches[0].clientY
    disablePageScroll()
    draggableItem.classList.remove('is-idle')
    draggableItem.classList.add('dragging')
    document.addEventListener('mousemove', drag)
    document.addEventListener('touchmove', drag, { passive: false })
}

function disablePageScroll() {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
}

function drag(e) {
    if (!draggableItem) return
    const pointerCurrentX = e.clientX || e.touches[0].clientX
    const pointerCurrentY = e.clientY || e.touches[0].clientY
    pointerDeltaX = pointerCurrentX - pointerStartX
    pointerDeltaY = pointerCurrentY - pointerStartY
    draggableItem.style.transform = `translate(${pointerDeltaX}px, ${pointerDeltaY}px)`
}

function dragEnd(e) {
    if (!draggableItem) return
    applyNewItemsOrder()
    draggableItem.classList.remove('dragging')
    draggableItem.classList.add('is-idle')
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('touchmove', drag, { passive: false })
    draggableItem.style.transform = null
    draggableItem = null
    pointerStartX = null
    pointerStartY = null
    enablePageScroll()
}

function applyNewItemsOrder() {
    if (Math.abs(pointerDeltaX) >= 5 || Math.abs(pointerDeltaY) >= 5) {
        const rect = topSitesGrid.getBoundingClientRect()
        if (
            pointerStartX >= rect.left &&
            pointerStartX <= rect.right &&
            pointerStartY >= rect.top &&
            pointerStartY <= rect.bottom
        ) {
            const dropTarget = topSitesGrid
            const draggedRect = draggableItem.getBoundingClientRect()
            const targetItems = dropTarget.querySelectorAll('.is-idle')
            let insertBeforeItem = null
            for (const targetItem of targetItems) {
                const targetRect = targetItem.getBoundingClientRect()
                if (
                    draggedRect.top <= targetRect.bottom &&
                    draggedRect.left <= targetRect.left
                ) {
                    insertBeforeItem = targetItem
                    break
                }
            }
            dropTarget.insertBefore(draggableItem, insertBeforeItem)
        }
    }
}

function enablePageScroll() {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
    document.body.style.userSelect = ''
}

const root = document.documentElement
root.style.setProperty('--primary-color', 'cornflowerblue')
root.style.setProperty('--secondary-color', 'tomato')

addTopSiteButton.addEventListener('click', createPrompt)
removeTopSitesButton.addEventListener('click', removeTopSiteElements)
moveTopSitesButton.addEventListener('click', moveTopSitesElements)

getTopSites().then(() => {
    if (topSitesList.length === 0) return
    createTopSitesButtons()
})
