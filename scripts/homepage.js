const overlay = document.querySelector('#main-overlay')
const topSitesGrid = document.querySelector('.top-sites-grid')
const addTopSiteButton = document.querySelector('#add-top-site-button')
const removeTopSitesButton = document.querySelector('#remove-top-sites-button')
let topSitesList = []
let addTopSitePrompt
let lastGroup
let removeTopSitesMode

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
        })
    generatePlaceholder()
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
        topSitesList.length > 0
            ? topSitesList[topSitesList.length - 1].group + 1
            : 1
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
}

function removeTopSiteElements() {
    if (removeTopSitesMode) {
        removeTopSitesMode = false
        const groupsOverlays = document.querySelectorAll(
            '.top-site-group-overlay'
        )
        const topSiteRemoveDivs = document.querySelectorAll(
            '.top-site-remove-div'
        )
        removeTopSitesButton.style.background = 'none'
        if (topSiteRemoveDivs.length === 0) return
        for (const groupOverlay of groupsOverlays) {
            groupOverlay.classList.remove('show')
        }
        for (const topSiteRemoveDiv of topSiteRemoveDivs) {
            topSiteRemoveDiv.classList.remove('show')
        }
    } else {
        removeTopSitesMode = true
        const groupsOverlays = document.querySelectorAll(
            '.top-site-group-overlay'
        )
        const topSiteRemoveDivs = document.querySelectorAll(
            '.top-site-remove-div'
        )
        removeTopSitesButton.style.backgroundColor = 'var(--secondary-color)'
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

const root = document.documentElement
root.style.setProperty('--primary-color', 'cornflowerblue')
root.style.setProperty('--secondary-color', 'tomato')

addTopSiteButton.addEventListener('click', createPrompt)
removeTopSitesButton.addEventListener('click', removeTopSiteElements)

getTopSites().then(() => {
    if (topSitesList.length === 0) return
    createTopSitesButtons()
})
