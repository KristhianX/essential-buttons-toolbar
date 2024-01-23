const overlay = document.querySelector('.overlay')
const topSitesGrid = document.querySelector('.top-sites-grid')
const addTopSiteButton = document.querySelector('.add-top-site')
let lastGroup = 0
let topSites = []

function getTopSites() {
    return new Promise((resolve, reject) => {
        browser.storage.local
            .get('topSites')
            .then((result) => {
                topSites = result.topSites || []
                resolve()
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function createTopSitesButtons() {
    const topSitesGrid = document.querySelector('.top-sites-grid')
    let lastObject = topSites.length - 1
    lastGroup = topSites[lastObject].group || 0
    for (let i = 1; i <= lastGroup; i++) {
        const group = document.createElement('div')
        group.classList.add('top-site-group')
        group.setAttribute('id', `group-${i}`)
        topSitesGrid.appendChild(group)
    }
    async function getFavicon(url) {
        try {
            const response = await fetch(`${url}/favicon.ico`)
            if (response.ok) {
                return response.url
            } else {
                console.error('Error fetching favicon:', response.statusText)
                return ''
            }
        } catch (error) {
            console.error('Error fetching favicon:', error)
            return ''
        }
    }
    async function createTopSiteElement(topSite) {
        const a = document.createElement('a')
        //const faviconUrl = await getFavicon(topSite.url)
        const faviconUrl = browser.runtime.getURL(
            '../icons/featherIcons/info.svg'
        )
        if (faviconUrl) {
            const img = document.createElement('img')
            img.src = faviconUrl
            img.alt = 'Favicon'
            a.appendChild(img)
        }
        const span = document.createElement('span')
        span.textContent = topSite.name
        a.href = topSite.url
        a.appendChild(span)
        return a
    }
    topSites.forEach(async (topSite) => {
        const groupNumber = document.querySelector(`#group-${topSite.group}`)
        const topSiteElement = await createTopSiteElement(topSite)
        groupNumber.appendChild(topSiteElement)
    })
}

function createPrompt() {
    const prompt = document.createElement('div')
    addTopSiteButton.style.display = 'none'
    overlay.style.display = 'block'
    prompt.classList.add('top-site-prompt')
    prompt.innerHTML = `
        <h2>Add a new top site</h2>
        <input type="text" placeholder="Name" id="top-site-name">
        <input type="text" placeholder="URL" id="top-site-url">
        <button id="top-site-submit" type="button">Add</button>
        <button id="top-site-cancel" type="button">Cancel</button>
    `
    document.body.appendChild(prompt)
    prompt.querySelector('#top-site-submit').addEventListener('click', () => {
        const name = prompt.querySelector('#top-site-name').value
        const url = prompt.querySelector('#top-site-url').value
        lastGroup++
        topSites.push({
            name: name,
            url: url,
            group: lastGroup,
        })
        browser.storage.local.set({ topSites: topSites })
        prompt.remove()
        addTopSiteButton.style.display = 'block'
        overlay.style.display = 'none'
    })
    prompt.querySelector('#top-site-cancel').addEventListener('click', () => {
        prompt.remove()
        addTopSiteButton.style.display = 'block'
        overlay.style.display = 'none'
    })
}

addTopSiteButton.addEventListener('click', () => {
    createPrompt()
})

getTopSites().then(() => {
    if (topSites[0]) createTopSitesButtons()
})
