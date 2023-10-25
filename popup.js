// Initialize the input fields with default values or values from storage.
const variable1Input = document.getElementById("variable1");
const variable2Input = document.getElementById("variable2");
const variable3Input = document.getElementById("variable3");
const saveButton = document.getElementById("saveButton");
const customUrlInput = document.getElementById("customUrl");
const addUrlButton = document.getElementById("addUrlButton");
const excludedUrlsList = document.getElementById("excludedUrls");
const statusMessage = document.getElementById("statusMessage");


// Get the current page's URL and set it as the initial value for "customUrl" input.
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
        customUrlInput.value = tabs[0].url;
    }
});


// Load the values from storage.
browser.storage.sync.get(['variable1', 'variable2', 'variable3', 'excludedUrls']).then((result) => {
    variable1Input.value = result.variable1;
    variable2Input.value = result.variable2;
    variable3Input.value = result.variable3;
    if (result.excludedUrls) {
        result.excludedUrls.forEach((url) => {
            const li = document.createElement("li");
            li.textContent = url;
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                // Remove the URL from the list.
                const updatedUrls = result.excludedUrls.filter((u) => u !== url);
                browser.storage.sync.set({ 'excludedUrls': updatedUrls }).then(() => {
                    li.remove();
                });
            });
            li.appendChild(removeButton);
            excludedUrlsList.appendChild(li);
        });
    }
});


// Add a URL to the excluded URLs list.
addUrlButton.addEventListener("click", () => {
    const urlToAdd = customUrlInput.value;
    if (urlToAdd) {
        // Add the URL to the list.
        browser.storage.sync.get('excludedUrls').then((result) => {
            const excludedUrls = result.excludedUrls || [];
            excludedUrls.push(urlToAdd);
            browser.storage.sync.set({ 'excludedUrls': excludedUrls }).then(() => {
                // Add the URL to the displayed list.
                const li = document.createElement("li");
                li.textContent = urlToAdd;
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", () => {
                    // Remove the URL from the list.
                    const updatedUrls = excludedUrls.filter((u) => u !== urlToAdd);
                    browser.storage.sync.set({ 'excludedUrls': updatedUrls }).then(() => {
                        li.remove();
                    });
                });
                li.appendChild(removeButton);
                excludedUrlsList.appendChild(li);
                customUrlInput.value = ""; // Clear the input field.
            });
        });
    }
});


// Save the values to storage when the Save button is clicked.
saveButton.addEventListener("click", () => {
    const variable1 = variable1Input.value;
    const variable2 = variable2Input.value;
    const variable3 = variable3Input.value;
    // Save the values to storage.
    browser.storage.sync.set({ 'variable1': variable1, 'variable2': variable2, 'variable3': variable3 }).then(() => {
        statusMessage.textContent = "Settings saved!";
    });
});

