let essOverlay

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
        essOverlay.style.zIndex = '1000'
        document.body.appendChild(essOverlay)
    }
    const addTopSitePrompt = document.createElement('div')
    essOverlay.style.display = 'block'
    addTopSitePrompt.classList.add('top-site-prompt')

    // Extract current page's URL and title
    const currentUrl = window.location.href
    const currentTitle =
        document.title.length > 50
            ? `${document.title.substring(0, 47)}...`
            : document.title

    addTopSitePrompt.innerHTML = `
        <h2 id="topSitePromptTitle">Add a new top site</h2>
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
        <input type="text" placeholder="Name" id="top-site-name" value="${currentTitle}" required />
        <input type="text" placeholder="URL (https://www.example.com)" id="top-site-url" value="${currentUrl}" required />
        <input type="text" placeholder="Favicon URL (optional)" id="top-site-favicon-url" />
        <div class="prompt-footer">
            <button id="top-site-cancel" type="button">Cancel</button>
            <button id="top-site-submit" type="button">Save</button>
        </div>
    `

    const style = document.createElement('style');
    style.textContent = `
        .top-site-prompt {
            width: 80%;
            max-width: 500px;
            max-height: 70%;
            overflow: scroll;
            margin: auto;
            position: fixed;
            border: 1px solid rgb(var(--background-color));
            border-radius: 8px;
            padding: 10px;
            display: block;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgb(var(--box-background));
            z-index: 3;
        }
        .top-site-prompt .prompt-footer {
            display: flex;
        }
        #top-site-preview {
            background: rgb(var(--background-color));
            width: var(--item-size, 60px);
            height: var(--item-size, 60px);
            margin: 5px auto 10px;
            display: block;
            position: relative;
            border-radius: 8px;
        }
        #top-site-preview-image {
            height: 50%;
            aspect-ratio: 1;
            position: absolute;
            top: 0;
            margin-top: 10%;
            left: 50%;
            transform: translate(-50%);
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--text-color);
            font-size: var(--font-size, 11px);
            border-radius: 50%;
        }
        #top-site-preview-name {
            display: flex;
            position: absolute;
            left: 50%;
            transform: translate(-50%);
            bottom: 5%;
            height: 30%;
            max-width: 90%;
            white-space: nowrap;
            align-items: center;
            overflow: hidden;
            font-size: var(--font-size, 11px);
            color: var(--text-color);
        }
        .favicon-options {
            color: var(--text-color);
            margin-bottom: 8px;
        }
        .favicon-options input[type='radio'] {
            width: 12px;
            height: 12px;
            background-color: rgb(var(--background-color));
            border: 1px solid var(--primary-color);
            border-radius: 50%;
            transition: background-color 0.3s, border-color 0.3s;
            appearance: none;
            margin: 0 5px 0 0;
        }
        .favicon-options input[type='radio']:checked {
            background-color: var(--primary-color);
        }
        .favicon-options label {
            position: relative;
            margin: 5px;
            cursor: pointer;
            display: block;
            line-height: 1.4;
            user-select: none;
        }
        button {
            display: block;
            margin: 10px auto;
            padding: 6px 16px;
            color: var(--text-color);
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            background: none;
        }
        .top-site-prompt button {
            display: inline-flex;
            margin: 8px auto;
        }
        .close-button {
            display: flex;
            align-items: center;
            justify-content: center;
            float: right;
            cursor: pointer;
            background: rgb(var(--background-color));
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
        }
        .close-button svg {
            height: 60%;
            aspect-ratio: 1;
            pointer-events: none;
        }
        #top-site-cancel {
            border-color: var(--secondary-color);
        }
        input[type='text'] {
            width: -moz-available;
            min-width: 250px;
            padding: 8px;
            font-size: 14px;
            margin-bottom: 10px;
            background: rgb(var(--background-color));
            border: none;
            border-radius: 4px;
            color: var(--text-color);
            outline: none;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(addTopSitePrompt)

    // Add event listeners
    addTopSitePrompt
        .querySelector('#top-site-name')
        .addEventListener('input', updatePreview)
    addTopSitePrompt
        .querySelector('#top-site-url')
        .addEventListener('input', updatePreview)
    addTopSitePrompt
        .querySelector('#top-site-favicon-url')
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
            essOverlay.style.display = 'none'
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
    const faviconUrlInput = document.getElementById('top-site-favicon-url')
    const nameInput = document.getElementById('top-site-name').value
    const previewImage = document.getElementById('top-site-preview-image')
    faviconUrlInput.value = ''
    previewImage.style.content = 'none'
    previewImage.style.background = 'rgb(var(--box-background))'
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

