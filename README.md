# Essential Buttons Toolbar and Homepage.
Adds a toolbar with essential buttons to customise the Android Firefox browser: Homepage, Duplicate Tab, New Tab, Close Tab, and more.

## Installation instructions.
The add-on is available on AMO (Mozilla Add-ons):

<a href="https://addons.mozilla.org/en-US/android/addon/essential-buttons-toolbar/">
  <img src="https://raw.githubusercontent.com/KristhianX/essential-buttons-toolbar/main/images/get-the-addon-fx-apr-2020.svg" width="180" alt="store">
</a>

## Why?
This add-on aims to fill basic missing functionality in Android Firefox. The main reason is to provide a normal home button.

The home button should not behave as the new tab button. This behavior is not intuitive and differs from the standard behavior found in most browsers, including the desktop version of Firefox, which follows the universal approach to the home button.

You can check other user opinions here:
https://connect.mozilla.org/t5/ideas/on-firefox-mobile-make-home-page-links-open-in-current-tab/idi-p/15672
Other buttons are being added to offer easier access or missing functionality.

## Features.
**Available buttons are:**
- Homepage
- Duplicate tab
- Copy link
- Close tab
- Close other tabs
- Close all tabs
- Undo close tab(s)
- New tab
- Go back
- Go forward
- Reload
- Scroll to the top
- Scroll to the bottom
- Toggle desktop site
- Open with
- Move toolbar
- Hide toolbar
- Menu
- Settings

**Other options include:**
- Toolbar height
- Toolbar width
- Toolbar transparency
- Toolbar position
- Gap from the edge
- Icon theme
- Add-on theme
- Hide on scroll method
- Toolbar buttons
- Exclude URLs
- Live reload of settings changes
- Integrated blank.html
- Integrated homepage.html

## Default homepage.
The default homepage URL used in this add-on is the integrated **Essential Homepage.**

Remember, you can choose any website, even 'about:blank' if you wish. Other good options are:
- Tabliss:
https://web.tabliss.io/
- booky.io:
https://booky.io/

**Essential Homepage** is a minimalistic, productivity-focused replacement for the Firefox homepage. Features include:

- Adding, editing, moving, and removing 'Top Sites' (shortcuts).
- Automatically retrieving the icon for a Top Site from DuckDuckGo or Google based on the site’s URL. You can also specify a custom URL for the icon.
- No limit on the number of Top Sites you can create.
- Setting the page background from a URL, a local file, or retrieving a daily background from Unsplash based on a custom query.
- Importing and exporting Top Sites and preferences.

## More info.

This extension does not access, log, or share your data. It is also ad-free and will always remain so. For more details, including how it handles optional features and external services, please review the Privacy Policy:
https://addons.mozilla.org/en-US/android/addon/essential-buttons-toolbar/privacy/

The icons used in this extension are from the elegant Feather Icons collection:
https://github.com/feathericons/feather
The beautiful Heroicons theme is also available:
https://github.com/tailwindlabs/heroicons

## Permissions

- Access browser tabs:
This permission is required to allow the add-on to manage tabs and to open the homepage URL if no tab becomes active.
- Access your data for all websites:
This permission is required to insert the toolbar into websites.
- Input data to the clipboard:
This permission is required to enable the 'Copy link' button to write the current URL to the clipboard.

## Version history.
You can see the changelog here:
https://addons.mozilla.org/en-US/android/addon/essential-buttons-toolbar/versions/

## Support me.
Love this add-on? Help me keep it awesome! Consider donating to support future updates:

<a href="https://www.buymeacoffee.com/kristhianx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

<!-- [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V7QI34Z)   -->

Thanks for your support! 🚀

## Tips and tricks.
There is no way to set the Firefox homepage to the one opened by this add-on.
While some users use the Firefox home button as a new tab button, I suggest that you ignore that button and disable all the settings by going to **Menu** -> **Settings** -> **Homepage**, and under Opening screen, select **Last tab.**

<img src="https://github.com/KristhianX/essential-buttons-toolbar/blob/main/images/Screenshot_20231027-202422.png?raw=true" width="200px"/>

It is also very useful to change the settings in **Delete browsing data on quit.** You can uncheck all the options except for **Downloads.** Enabling this option will display a **Quit** option at the bottom of the Firefox menu. Closing the browser in this way is ideal, as the next time you open the browser, it will load the pages you had opened.

<img src="https://github.com/KristhianX/essential-buttons-toolbar/blob/main/images/Screenshot_20231027-212100.png?raw=true" width="200px"/>

## Known issues:
Some websites are not well optimized for mobile. Some will have a little zoom that will make the toolbar be displayed outside of the viewport or display only a part of it. You can find the toolbar by zooming out.

## Note:
This initially began as a userscript, which I later developed into an extension to access additional features.
You can still find the original user script here, but I'm unlikely to make further updates to it:
https://github.com/KristhianX/a-real-home-button



zip -r essential-buttons-toolbar.xpi . -x '*.git*' '*README.md*' '*LICENSE*' 'images/*' '.DS_Store'
