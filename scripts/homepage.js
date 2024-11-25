const backgroundContainer = document.querySelector('#background-container')
const overlay = document.querySelector('#main-overlay')
const topSitesGrid = document.querySelector('.top-sites-grid')
const addTopSiteButton = document.querySelector('#add-top-site-button')
const editTopSitesButton = document.querySelector('#edit-top-sites-button')
const removeTopSitesButton = document.querySelector('#remove-top-sites-button')
const moveTopSitesButton = document.querySelector('#move-top-sites-button')
const homepagePreferencesButton = document.querySelector(
    '#homepage-preferences-button'
)
let creditContainer
let topSitesList = []
let addTopSitePrompt
let preferencesPrompt
let lastGroup
let editTopSitesMode
let removeTopSitesMode
let moveTopSitesMode
let draggableItem
let pointerStartX
let pointerStartY
let pointerDeltaX
let pointerDeltaY
let essHomepage = window.location.href
const homepageSettings = {}

function overrideTheme(theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark')
    document.documentElement.classList.toggle('light-theme', theme === 'light')
}

function getSettings() {
    const keys = [
        'theme',
        'iconTheme',
        'defaultPosition',
        'toolbarHeight',
        'topBottomMargin',
        'excludedUrls',
        'homepageBg',
        'unsplashQuery',
        'customBgURL',
    ]
    return browser.storage.sync.get(keys).then((result) => {
        keys.forEach((key) => {
            homepageSettings[key] = result[key]
        })
    })
}

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
        const topSiteEditDiv = document.createElement('div')
        group.classList.add('top-site-group')
        group.setAttribute('id', `group-${groupNumber}`)
        groupOverlay.classList.add('top-site-group-overlay')
        topSiteRemoveDiv.classList.add('top-site-remove-div')
        topSiteEditDiv.classList.add('top-site-edit-div')
        group.appendChild(groupOverlay)
        group.appendChild(topSiteRemoveDiv)
        group.appendChild(topSiteEditDiv)
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
    previewImage.style.background = 'var(--background-color)'
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
    //addTopSiteButton.style.backgroundColor = 'var(--primary-color)'
    //setTimeout(() => {
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
        <input type="text" placeholder="Name" id="top-site-name" required />
        <input type="text" placeholder="URL (https://www.example.com)" id="top-site-url" required />
        <input type="text" placeholder="Favicon URL (optional)" id="top-site-favicon-url" />
        <div class="prompt-footer">
            <button id="top-site-cancel" type="button">Cancel</button>
            <button id="top-site-submit" type="button">Save</button>
        </div>
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
            //addTopSiteButton.style.background = 'none'
        })
    generatePlaceholder()
    //}, 100)
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
    //addTopSiteButton.style.background = 'none'
}

function editTopSitesElements() {
    const groupsOverlays = document.querySelectorAll('.top-site-group-overlay')
    const topSiteEditDivs = document.querySelectorAll('.top-site-edit-div')
    if (editTopSitesMode) {
        editTopSitesMode = false
        editTopSitesButton.style.background = 'none'
        addTopSiteButton.style.display = 'inline-flex'
        removeTopSitesButton.style.display = 'inline-flex'
        moveTopSitesButton.style.display = 'inline-flex'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.remove('show')
        }
        for (const topSiteEditDiv of topSiteEditDivs) {
            topSiteEditDiv.classList.remove('show')
        }
        document.body.removeEventListener('click', editTopSite)
    } else {
        editTopSitesMode = true
        editTopSitesButton.style.backgroundColor = 'var(--primary-color)'
        addTopSiteButton.style.display = 'none'
        removeTopSitesButton.style.display = 'none'
        moveTopSitesButton.style.display = 'none'
        if (groupsOverlays.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.add('show')
        }
        for (const topSiteEditDiv of topSiteEditDivs) {
            topSiteEditDiv.classList.add('show')
        }
        document.body.addEventListener('click', editTopSite)
    }
}

async function editTopSite(event) {
    if (event.target.classList.contains('top-site-edit-div')) {
        const groupNumber = event.target.parentElement.id.replace('group-', '')
        const topSiteIndex = topSitesList.findIndex(
            (site) => site.group == groupNumber
        )

        if (topSiteIndex !== -1) {
            const topSite = topSitesList[topSiteIndex]

            // Use `createPrompt` to show the edit dialog
            createPrompt()

            // Wait for the prompt to be created
            setTimeout(() => {
                const nameInput = document.getElementById('top-site-name')
                const urlInput = document.getElementById('top-site-url')
                const faviconUrlInput = document.getElementById(
                    'top-site-favicon-url'
                )

                if (!nameInput || !urlInput || !faviconUrlInput) {
                    console.error('Prompt inputs are missing.')
                    return
                }

                // Pre-fill values in the dialog
                nameInput.value = topSite.name
                urlInput.value = topSite.url
                faviconUrlInput.value = topSite.faviconUrl || ''

                updatePreview()

                // Update the Save button to edit instead of adding
                const saveButton = document.getElementById('top-site-submit')
                saveButton.removeEventListener('click', addTopSite)
                //saveButton.textContent = 'Save Changes'
                saveButton.onclick = async () => {
                    const updatedName = nameInput.value
                    const updatedUrl = urlInput.value
                    const updatedFaviconUrl = faviconUrlInput.value

                    if (!updatedName || !updatedUrl) {
                        alert('Name and URL are mandatory.')
                        return
                    }

                    try {
                        let dataUrl = topSite.faviconUrl
                        if (updatedFaviconUrl) {
                            dataUrl = await retrieveFavicon(updatedFaviconUrl)
                        } else {
                            dataUrl = ''
                        }

                        // Update the top site object
                        topSitesList[topSiteIndex] = {
                            ...topSite,
                            name: updatedName,
                            url: updatedUrl,
                            faviconUrl: dataUrl || '',
                        }

                        // Save updated list to storage
                        await browser.storage.local.set({
                            topSites: topSitesList,
                        })

                        // Update the existing DOM elements directly
                        const groupElement = document.getElementById(
                            `group-${groupNumber}`
                        )
                        const anchor = groupElement.querySelector('a')
                        const img = groupElement.querySelector('img')
                        const span = groupElement.querySelector('span')

                        anchor.href = updatedUrl
                        span.textContent = updatedName
                        if (img && dataUrl) {
                            img.src = dataUrl
                            img.style.display = 'block'
                        } else if (!img && dataUrl) {
                            const placeholderDiv =
                                groupElement.querySelector('.placeholder-image')
                            placeholderDiv.remove()
                            const newImg = document.createElement('img')
                            newImg.src = dataUrl
                            anchor.appendChild(newImg)
                        } else {
                            img.remove()
                            const placeholderImage =
                                document.createElement('div')
                            placeholderImage.className = 'placeholder-image'
                            placeholderImage.textContent = updatedName
                                .trim()[0]
                                .toUpperCase()
                            anchor.appendChild(placeholderImage)
                        }

                        // Close the prompt
                        addTopSitePrompt.remove()
                        overlay.style.display = 'none'
                    } catch (error) {
                        console.error('Error updating top site:', error)
                    }
                }
            }, 100) // Match the delay in `createPrompt`
        }
    }
}

function removeTopSitesElements() {
    const groupsOverlays = document.querySelectorAll('.top-site-group-overlay')
    const topSiteRemoveDivs = document.querySelectorAll('.top-site-remove-div')
    if (removeTopSitesMode) {
        removeTopSitesMode = false
        removeTopSitesButton.style.background = 'none'
        addTopSiteButton.style.display = 'inline-flex'
        editTopSitesButton.style.display = 'inline-flex'
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
        editTopSitesButton.style.display = 'none'
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
        editTopSitesButton.style.display = 'inline-flex'
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
        editTopSitesButton.style.display = 'none'
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
    topSitesGrid.style.overflow = 'hidden'
    topSitesGrid.style.touchAction = 'none'
    topSitesGrid.style.userSelect = 'none'
}

function enablePageScroll() {
    topSitesGrid.style.overflow = ''
    topSitesGrid.style.touchAction = ''
    topSitesGrid.style.userSelect = ''
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

function exportTopSites() {
    getTopSites().then(() => {
        const jsonContent = JSON.stringify(topSitesList, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'essential_homepage-top_sites.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    })
}

function importTopSites(fileInput) {
    const confirmOverwrite = confirm(
        'Warning: Importing data will overwrite your existing top sites. Do you want to proceed?'
    )
    // If the user cancels, abort the import process
    if (!confirmOverwrite) {
        fileInput.value = ''
        return
    }
    const file = fileInput.files[0]
    if (file && file.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const importedData = JSON.parse(reader.result)
                if (Array.isArray(importedData)) {
                    // Optional: Add validation logic for each object in the array
                    browser.storage.local
                        .set({ topSites: importedData })
                        .then(() => {
                            // Confirm success and reload the page
                            alert(
                                'Data imported successfully. The page will now reload.'
                            )
                            location.reload()
                        })
                } else {
                    console.error('Invalid file format.')
                }
            } catch (e) {
                console.error('Error parsing JSON:', e)
            }
        }
        reader.readAsText(file)
    } else {
        console.error('Please upload a valid JSON file.')
    }
}

//
// Wallpaper changer
//
function saveWallpaperToLocal(wallpaperBlob) {
    const reader = new FileReader()
    reader.onloadend = () => {
        browser.storage.local
            .set({ wallpaperData: reader.result })
            .catch((error) => {
                console.error(
                    'Error saving wallpaper data to local storage:',
                    error
                )
            })
    }
    reader.onerror = (error) => {
        console.error('Error reading wallpaper blob as Base64:', error)
    }
    reader.readAsDataURL(wallpaperBlob)
}

function setWallpaperFromLocal(custom) {
    browser.storage.local
        .get(['wallpaperData', 'wallpaperSetDate'])
        .then((result) => {
            if (custom) {
                backgroundContainer.style.backgroundImage = `url('${result.wallpaperData}')`
            } else if (
                result.wallpaperData &&
                result.wallpaperSetDate === getCurrentDate()
            ) {
                backgroundContainer.style.backgroundImage = `url('${result.wallpaperData}')`
                if (!localStorage.getItem('creditInfo')) {
                    getWallpaper(homepageSettings.unsplashQuery)
                } else {
                    generateCreditsContainer()
                }
            } else {
                getWallpaper(homepageSettings.unsplashQuery)
            }
        })
        .catch((error) => console.error('Error retrieving wallpaper:', error))
}

function getCurrentDate() {
    const now = new Date()
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

async function getWallpaperFromURL(imageUrl) {
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
        throw new Error(`Image fetch failed: ${imageResponse.statusText}`)
    }
    const wallpaperBlob = await imageResponse.blob()
    saveWallpaperToLocal(wallpaperBlob)
    const objectUrl = URL.createObjectURL(wallpaperBlob)
    backgroundContainer.style.backgroundImage = `url('${objectUrl}')`
}

function fileToBlob(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(new Blob([reader.result], { type: file.type }))
        }
        reader.onerror = () => {
            reject(new Error('Failed to read the file as a Blob'))
        }
        reader.readAsArrayBuffer(file)
    })
}

async function getWallpaper(query) {
    const apiUrl = `https://essential-homepage-background.kristhianx.workers.dev/?query=${encodeURIComponent(
        query
    )}`
    try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error(
                `Network response was not ok: ${response.statusText}`
            )
        }
        const data = await response.json()
        if (!data || !data.imageUrl) {
            return
        }
        const { imageUrl, photoUrl, authorUrl, authorName } = data
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
            throw new Error(`Image fetch failed: ${imageResponse.statusText}`)
        }
        const wallpaperBlob = await imageResponse.blob()
        saveWallpaperToLocal(wallpaperBlob)
        const objectUrl = URL.createObjectURL(wallpaperBlob)
        backgroundContainer.style.backgroundImage = `url('${objectUrl}')`
        const creditInfo = { authorUrl, authorName, photoUrl }
        localStorage.setItem('creditInfo', JSON.stringify(creditInfo))
        generateCreditsContainer()
        browser.storage.local
            .set({
                wallpaperSetDate: getCurrentDate(),
            })
            .catch((error) => {
                console.error(
                    'Error saving wallpaperSetDate to local storage:',
                    error
                )
            })
    } catch (error) {
        console.error('Error fetching wallpaper:', error)
    }
}

function generateCreditsContainer() {
    const creditInfo = JSON.parse(localStorage.getItem('creditInfo'))
    if (creditInfo) {
        creditContainer = document.createElement('div')
        const authorLink = document.createElement('a')
        authorLink.href = creditInfo.authorUrl
        authorLink.target = '_blank'
        authorLink.textContent = creditInfo.authorName
        const photoLink = document.createElement('a')
        photoLink.href = creditInfo.photoUrl
        photoLink.target = '_blank'
        photoLink.textContent = 'Unsplash'
        creditContainer.appendChild(document.createTextNode('Photo by '))
        creditContainer.appendChild(authorLink)
        creditContainer.appendChild(document.createTextNode(' on '))
        creditContainer.appendChild(photoLink)
        creditContainer.id = 'credit-container'
        creditContainer.style.display = 'block'
        document.body.appendChild(creditContainer)
        adjustCreditsContainer()
    } else {
        console.error('No credit information found in local storage')
    }
}

function adjustCreditsContainer() {
    const isExcluded = testExclude()
    if (!isExcluded) {
        if (homepageSettings.defaultPosition === 'bottom') {
            const calculatedBottom = Math.floor(
                (Number(homepageSettings.toolbarHeight) + Number(homepageSettings.topBottomMargin) + 6) / window.visualViewport.scale
            )
            creditContainer.style.bottom = `${calculatedBottom}px`
        } else if (homepageSettings.defaultPosition === 'left') {
            const calculatedLeft = Math.floor(
                (Number(homepageSettings.toolbarHeight) + Number(homepageSettings.topBottomMargin) + 6) / window.visualViewport.scale
            )
            creditContainer.style.paddingLeft = `${calculatedLeft}px`
        }
    }
}

function removeWallpaperFromLocal() {
    if (creditContainer) creditContainer.remove()
    browser.storage.local.remove(['wallpaperData', 'wallpaperSetDate'])
}

//
// Preferences
//
function createPreferencesPrompt() {
    if (preferencesPrompt) {
        preferencesPrompt.style.display = 'block'
        overlay.style.display = 'block'
        return
    }
    setTimeout(() => {
        preferencesPrompt = document.createElement('div')
        overlay.style.display = 'block'
        preferencesPrompt.classList.add('preferences-prompt')
        preferencesPrompt.innerHTML = `
        <h2>Preferences</h2>
        <label for="selectBg">Background:</label>
        <select id="selectBg">
            <option value="unsplash">Unsplash</option>
            <option value="custom">Custom URL</option>
            <option value="file">Local file</option>
            <option value="none">None</option>
        </select>
        <div id="unsplash-settings">
            <label for="unsplash-query">Search query:</label>
            <input type="text" id="unsplash-query" />
        </div>
        <div id="custom-bg-settings">
            <label for="custom-bg-url">URL:</label>
            <input type="text" id="custom-bg-url" />
        </div>
        <div id="file-bg-settings">
            <label for="imageFileInput">Choose file:</label>
            <input type="file" id="imageFileInput" accept="image/*">
        </div>
        <h2>Top Sites</h2>
        <div id="importExportDiv">
            <label for="exportTopSites">Export:</label>
            <button id="exportTopSites">Download</button>
            <label for="importTopSites">Import:</label>
            <input type="file" id="importTopSites" accept="application/json" />
        </div>
        <div class="prompt-footer">
            <button id="preferences-close" type="button">Close</button>
            <button id="preferences-save" type="button">Save</button>
        </div>
        `
        document.body.appendChild(preferencesPrompt)
        const selectBg = document.getElementById('selectBg')
        const unsplashSettings = document.getElementById('unsplash-settings')
        const customBgSettings = document.getElementById('custom-bg-settings')
        const fileBgSettings = document.getElementById('file-bg-settings')
        const unsplashQuery = document.getElementById('unsplash-query')
        const customBgURL = document.getElementById('custom-bg-url')
        selectBg.value = homepageSettings.homepageBg
        unsplashSettings.style.display =
            selectBg.value === 'unsplash' ? 'block' : 'none'
        customBgSettings.style.display =
            selectBg.value === 'custom' ? 'block' : 'none'
        fileBgSettings.style.display =
            selectBg.value === 'file' ? 'block' : 'none'
        unsplashQuery.value = homepageSettings.unsplashQuery
        customBgURL.value = homepageSettings.customBgURL
        selectBg.addEventListener('input', () => {
            unsplashSettings.style.display =
                selectBg.value === 'unsplash' ? 'block' : 'none'
            customBgSettings.style.display =
                selectBg.value === 'custom' ? 'block' : 'none'
            fileBgSettings.style.display =
                selectBg.value === 'file' ? 'block' : 'none'
        })
        preferencesPrompt
            .querySelector('#exportTopSites')
            .addEventListener('click', exportTopSites)
        preferencesPrompt
            .querySelector('#importTopSites')
            .addEventListener('change', (event) => importTopSites(event.target))
        preferencesPrompt
            .querySelector('#preferences-save')
            .addEventListener('click', savePreferences)
        preferencesPrompt
            .querySelector('#preferences-close')
            .addEventListener('click', () => {
                preferencesPrompt.style.display = 'none'
                overlay.style.display = 'none'
            })
    }, 100)
}

async function savePreferences() {
    const selectBg = document.getElementById('selectBg')
    const unsplashQuery = document.getElementById('unsplash-query')
    const customBgURL = document.getElementById('custom-bg-url')
    const imageFileInput = document.getElementById('imageFileInput')
    const newValues = {
        homepageBg: selectBg.value,
        unsplashQuery: unsplashQuery.value,
        customBgURL: customBgURL.value,
        selectedFileName: imageFileInput.files[0]?.name || null,
    }
    const currentValues = await browser.storage.sync.get(Object.keys(newValues)) // Await the result
    let hasChanged = false
    for (const key in newValues) {
        if (key === 'selectedFileName' && !imageFileInput.files.length) {
            continue
        }
        if (currentValues[key] !== newValues[key]) {
            hasChanged = true
            break
        }
    }
    if (hasChanged) {
        await browser.storage.sync.set(newValues) // Await optional if no further chaining required
        if (selectBg.value === 'unsplash') {
            removeWallpaperFromLocal()
            getWallpaper(unsplashQuery.value)
        } else if (selectBg.value === 'custom') {
            removeWallpaperFromLocal()
            getWallpaperFromURL(customBgURL.value)
        } else if (selectBg.value === 'file') {
            removeWallpaperFromLocal()
            if (imageFileInput.files.length > 0) {
                const file = imageFileInput.files[0]
                const wallpaperBlob = await fileToBlob(file)
                saveWallpaperToLocal(wallpaperBlob)
                const objectUrl = URL.createObjectURL(wallpaperBlob)
                backgroundContainer.style.backgroundImage = `url('${objectUrl}')`
            }
        } else {
            backgroundContainer.style.backgroundImage = 'none'
            if (creditContainer) creditContainer.remove()
        }
    }
    preferencesPrompt.style.display = 'none'
    overlay.style.display = 'none'
}

function adjustPreferencesButton() {
    const isExcluded = testExclude()
    if (!isExcluded) {
        if (homepageSettings.defaultPosition === 'top') {
            const calculatedTop = Math.floor(
                (Number(homepageSettings.toolbarHeight) + Number(homepageSettings.topBottomMargin) + 6) / window.visualViewport.scale
            )
            homepagePreferencesButton.style.top = `${calculatedTop}px`
        } else if (homepageSettings.defaultPosition === 'right') {
            const calculatedRight = Math.floor(
                (Number(homepageSettings.toolbarHeight) + Number(homepageSettings.topBottomMargin) + 6) / window.visualViewport.scale
            )
            homepagePreferencesButton.style.right = `${calculatedRight}px`
        }
    }
}

function testExclude() {
    return (isExcluded = [...(homepageSettings.excludedUrls || [])].some(
        (excludedUrl) => {
            const pattern = new RegExp(
                '^' + excludedUrl.replace(/\*/g, '.*') + '$'
            )
            return pattern.test(essHomepage)
        }
    ))
}

//
// Init and event listeners
//
addTopSiteButton.addEventListener('click', createPrompt)
editTopSitesButton.addEventListener('click', editTopSitesElements)
removeTopSitesButton.addEventListener('click', removeTopSitesElements)
moveTopSitesButton.addEventListener('click', moveTopSitesElements)
homepagePreferencesButton.addEventListener('click', createPreferencesPrompt)

function initHomepage() {
    getSettings().then(() => {
        overrideTheme(homepageSettings.theme)
        if (homepageSettings.homepageBg === 'unsplash') {
            setWallpaperFromLocal()
        } else if (
            homepageSettings.homepageBg === 'custom' ||
            homepageSettings.homepageBg === 'file'
        ) {
            setWallpaperFromLocal(true)
        }
        adjustPreferencesButton()
    })
    getTopSites().then(() => {
        if (topSitesList.length === 0) return
        createTopSitesButtons()
    })
}

initHomepage()
