# Frenzy Clicker
A simple add-on for [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/) that auto-clicks during Click Frenzy, Cookie Storm, Dragonflight, Elder Frenzy and Cursed Finger.

## How to use
### Tampermonkey
1. Create a new Script
2. Paste in the following content:
```javascript
// ==UserScript==
// @name         Frenzy Clicker
// @namespace    Cookie
// @version      2026-04-15
// @description  try to take over the world!
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @icon         https://cdn.jsdelivr.net/gh/JakobKrug/frenzy-clicker@main/GoldCookie.webp
// @grant        none
// ==/UserScript==

(function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://cdn.jsdelivr.net/gh/JakobKrug/frenzy-clicker@main/frenzy-clicker.js');
            clearInterval(checkReady);
        }
    }, 1000);
})();
```
### Bookmark
Create a bookmark with this line in the address bar:
```javascript
javascript:( function () { Game.LoadMod('https://cdn.jsdelivr.net/gh/JakobKrug/frenzy-clicker@main/frenzy-clicker.js'); }() );
```
With Cookie Clicker open, click the bookmark.

## Configuration
All FC's settings can be managed in Cookie Clicker's "Settings" menu.

## Other mods
Frenzy Clicker should not conflict with any other mods (using other auto-clickers at the same time might slow down the game, though). To easily load FC and other mods with one click, just add them to the bookmark.

### Example: Load FC and Cookie Monster with one bookmark
```javascript
    javascript:( function () {
      Game.LoadMod('https://aktanusa.github.io/CookieMonster/CookieMonster.js');
      Game.LoadMod('https://cdn.jsdelivr.net/gh/JakobKrug/frenzy-clicker@main/frenzy-clicker.js');
    }() );
```
