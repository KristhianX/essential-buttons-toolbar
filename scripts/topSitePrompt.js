let essOverlay
let addTopSitePrompt
let promptIframeDoc

export function createPrompt() {
    // Ensure there's an essOverlay element
    if (!essOverlay) {
        essOverlay = document.createElement('div')
        essOverlay.style.position = 'fixed'
        essOverlay.style.top = 0
        essOverlay.style.left = 0
        essOverlay.style.width = '100%'
        essOverlay.style.height = '100%'
        essOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
        essOverlay.style.display = 'none'
        essOverlay.style.zIndex = '2147483647'
        document.body.appendChild(essOverlay)
    }
    addTopSitePrompt = document.createElement('iframe')
    addTopSitePrompt.style = `
        display: block !important;
        max-height: 70%;
        position: fixed;
        z-index: 2147483647;
        margin: auto;
        padding: 10px;
        min-height: unset;
        max-height: 70%;
        width: 80%;
        min-width: unset;
        max-width: 500px;
        border: 0px;
        background: transparent;
        color-scheme: light;
        border-radius: 8px;
        overflow: scroll;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `
    addTopSitePrompt.src = browser.runtime.getURL('pages/topSitePrompt.html')
    document.body.insertAdjacentElement('afterend', addTopSitePrompt)
    addTopSitePrompt.addEventListener('load', () => {
        promptIframeDoc = addTopSitePrompt.contentDocument
        addListeners()
    })
    essOverlay.style.display = 'block'
}

function addListeners() {
    // Extract current page's URL and title
    const currentUrl = window.location.href
    const currentTitle =
        document.title.length > 50
            ? `${document.title.substring(0, 47)}...`
            : document.title
    
    // Add event listeners
    promptIframeDoc
        .querySelector('#top-site-name')
        .addEventListener('input', updatePreview)
    promptIframeDoc
        .querySelector('#top-site-url')
        .addEventListener('input', updatePreview)
    promptIframeDoc
        .querySelector('#top-site-favicon-url')
        .addEventListener('input', updatePreview)
    promptIframeDoc
        .querySelector('input[name="favicon-option"][value="duckduckgo"]')
        .addEventListener('change', updatePreview)
    promptIframeDoc
        .querySelector('input[name="favicon-option"][value="google"]')
        .addEventListener('change', updatePreview)
    promptIframeDoc
        .querySelector('input[name="favicon-option"][value="custom"]')
        .addEventListener('change', updatePreview)
    promptIframeDoc
        .querySelector('#top-site-submit')
        .addEventListener('click', addTopSite)
    promptIframeDoc
        .querySelector('#top-site-cancel')
        .addEventListener('click', () => {
            addTopSitePrompt.remove()
            essOverlay.style.display = 'none'
        })

    generatePlaceholder()
}

function updatePreview() {
    const nameInput = promptIframeDoc.getElementById('top-site-name')
    const previewName = promptIframeDoc.getElementById('top-site-preview-name')
    const faviconUrlInput = promptIframeDoc.getElementById('top-site-favicon-url')
    const faviconUrlInputValue = faviconUrlInput.value
    const selectedFaviconOption = promptIframeDoc.querySelector(
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
    const nameInput = promptIframeDoc.querySelector('#top-site-name')
    const urlInput = promptIframeDoc.querySelector('#top-site-url')
    const faviconUrlInput = promptIframeDoc.querySelector(
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
    essOverlay.style.display = 'none'
    topSitesContainer.classList.remove('top-sites-container-empty')
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
    const faviconUrlInput = promptIframeDoc.getElementById('top-site-favicon-url')
    const nameInput = promptIframeDoc.getElementById('top-site-name').value
    const previewImage = promptIframeDoc.getElementById('top-site-preview-image')
    faviconUrlInput.value = ''
    previewImage.style.content = 'none'
    previewImage.style.background = 'rgb(var(--box-background))'
    previewImage.style.borderRadius = '50%'
    previewImage.textContent = nameInput
        ? nameInput.trim()[0].toUpperCase()
        : 'N'
}

function fetchFaviconFromUrl() {
    const faviconUrlInput = promptIframeDoc.getElementById('top-site-favicon-url')
    const previewImage = promptIframeDoc.getElementById('top-site-preview-image')
    const customFaviconUrl = faviconUrlInput.value
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = 'url(' + customFaviconUrl + ')'
}

function fetchFaviconFromDuckDuckGo() {
    const urlInput = promptIframeDoc.getElementById('top-site-url').value
    if (!urlInput) return
    const previewImage = promptIframeDoc.getElementById('top-site-preview-image')
    let domain = urlInput.replace(/^https?:\/\//, '')
    domain = domain.split('/')[0]
    const duckDuckGoFaviconUrl =
        'https://icons.duckduckgo.com/ip3/' + domain + '.ico'
    promptIframeDoc.getElementById('top-site-favicon-url').value = duckDuckGoFaviconUrl
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = 'url(' + duckDuckGoFaviconUrl + ')'
}

function fetchFaviconFromGoogle() {
    const urlInput = promptIframeDoc.getElementById('top-site-url').value
    if (!urlInput) return
    const previewImage = promptIframeDoc.getElementById('top-site-preview-image')
    const googleFaviconUrl =
        'https://www.google.com/s2/favicons?domain=' + urlInput + '&sz=64'
    promptIframeDoc.getElementById('top-site-favicon-url').value = googleFaviconUrl
    previewImage.style.background = 'none'
    previewImage.textContent = ''
    previewImage.style.borderRadius = '0'
    previewImage.style.content = `url(${googleFaviconUrl})`
}
