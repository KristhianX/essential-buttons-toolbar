# A real home button.
*An extension that adds homepage, new tab, and close tab buttons to Android Firefox.*

**Note:**
This initially began as a user script, which I later developed into an extension to access additional features.  
You can still find the original user script here, but I'm unlikely to make further updates to it:  
https://github.com/KristhianX/a-real-home-button

## Some screenshots.
<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231025-173119.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231025-173231.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-203438.png?raw=true" width="200px"/>

## Why?  
I want to clarify from the beginning that this add-on is not meant as negative criticism of Firefox's developers. I genuinely appreciate Firefox and its core values.  
The purpose of this add-on is to assist users like me who find it challenging to adapt to the behavior of the home button in Android Firefox.  
Many people choose Firefox for various reasons, such as its open-source nature, security features, and its commitment to keeping the web user-centric rather than controlled by large corporations.  
Unfortunately, some users become discouraged by issues like this and switch back to other browsers.  
To illustrate the problem with the home button, it's as if, in a text editor, the 'Save' button automatically acts as the 'Save As' button, resulting in a clutter of unnecessary files.  
The home button should not behave as the new tab button. This behavior isn't intuitive and differs from the standard behavior found in most other browsers, including the desktop version of Firefox, which follows the universal approach to the home button.  
You can check other user opinions here:  
https://connect.mozilla.org/t5/ideas/on-firefox-mobile-make-home-page-links-open-in-current-tab/idi-p/15672

**Ok, but what about the other buttons?**  
Though opening a new tab and closing tabs is not difficult, why not make them even more accessible?

## Features.  
**Buttons in the toolbar:**  
- **Home button:** Opens the default homepage URL. Can be changed in options.  
- **Hide button:** Hides the toolbar. Refresh the page to display it again.  
- **Move button:** Moves the toolbar to the top of the page or to the bottom if it is at the top.  
- **Close button:** Closes the current tab. If the current tab is the only open tab, it opens the homepage URL instead.  
- **New tab button:** Opens the default new tab page URL. Can be changed in options.

**Other features:**  
- **The toolbar automatically hides when scrolling.**  
- **Toolbar height:** The number of pixels. The default value is set to 46 for ease of use.  
- **Exclude URLs:** Specify which web addresses to exclude.

## Installation instructions for Firefox Beta, Fennec F-Droid and Mull.
*You will need a version of firefox that support Custom Add-on collections. Such as Firefox Beta, Fennec F-Droid or Mull.*

You'll need to add a Custom Add-on collection. You can either add the add-on to your own collection or use my collection if you don't have a Mozilla account or don't want to create a collection.

<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-202606.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-202706.png?raw=true" width="200px"/>

Follow these steps: Open the **Menu** -> Tap on **Settings** ->
If the Custom Add-on collection is not available, tap on **About Firefox** -> Tap the Firefox logo several times to activate debug options.
Now, go back and tap **Custom Add-on collection.**
Fill the prompt with these values to use my collection. Don't worry; you can go back to the default collection after installing the add-on by removing these values and tapping **OK.**

Collection owner (User ID): `12488393`  
Collection name: `Kris-selection`

The browser will restart to apply the changes.
Now, you can go to **Menu** -> **Settings** -> **Add-ons.** Scroll the list until you find **A real home button** add-on.

## Installation instructions for Firefox Nightly.
It's very easy. Just go to the add-on link and tap **Add to Firefox.**  
https://addons.mozilla.org/en-US/android/addon/a-real-home-button/

## Tips and tricks.
There is no way to set the Firefox homepage to the one opened by this add-on.  
While some users use the Firefox home button as a new tab button, I suggest that you ignore that button and disable all the settings by going to **Menu** -> **Settings** -> **Homepage**, and under Opening screen, select **Last tab.**

<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-202422.png?raw=true" width="200px"/>

It is also very useful to change the settings in **Delete browsing data on quit.** You can uncheck all the options except for **Cached images and files.** Enabling this option will display a **Quit** option at the bottom of the Firefox menu. Closing the browser in this way is ideal, as the next time you open the browser, it will load the pages you had opened.

<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-202443.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-212100.png?raw=true" width="200px"/>

## Default homepage.
The default homepage URL used in this add-on is the beautiful and awesome Tabliss.  
https://tabliss.io/  
Their Firefox add-on has the recommended tag.  
https://addons.mozilla.org/es/firefox/addon/tabliss/  
However, it does not work for Android Firefox due to the current restrictions in the functionality of mobile add-ons.  
Nevertheless, we can use its web version.  
https://web.tabliss.io/  

Here is a list of the pros and cons of this web homepage:  

**Pros:**  
- Beautiful and customizable.
- Option for persistent storage, making it available offline.
- Responsive design that adapts very well to phone screens.

<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231021-210418.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231021-210327.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231021-210343.png?raw=true" width="200px"/>  

**Cons:**  
- Last updated two years ago.
- The inspirational quotes widget does not work.
- Adding links to the Quick Links widget is time-consuming.

Remember, you can choose any website, even 'about:blank' if you wish. Another good option could be booky.io:  
https://booky.io/

## Known issues:
Some websites are not well optimized for mobile. Some will have a little zoom that will make the toolbar be displayed outside of the viewport or display only a part of it. You can find the toolbar by zooming out, as shown in the following screenshots:

<img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-202946.png?raw=true" width="200px"/> <img src="https://github.com/KristhianX/extension-a-real-home-button/blob/main/images/Screenshot_20231027-203000.png?raw=true" width="200px"/>


