# Frenzy Clicker

A simple add-on for [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/) that auto-clicks during Click Frenzy, Cookie Storm, Dragonflight, Elder Frenzy and Cursed Finger.

## How to use

Create a bookmark with this line in the address bar:

    javascript:( function () { Game.LoadMod('https://github.com/JakobKrug/frenzy-clicker/blob/master/frenzy-clicker.js'); }() );

With Cookie Clicker open, click the bookmark.

## Configuration
All FC's settings can be managed in Cookie Clicker's "Settings" menu.

## Other mods
Frenzy Clicker should not conflict with any other mods (using other auto-clickers at the same time might slow down the game, though). To easily load FC and other mods with one click, just add them to the bookmark.

### Example: Load FC and Cookie Monster with one bookmark

    javascript:( function () {
      Game.LoadMod('https://aktanusa.github.io/CookieMonster/CookieMonster.js');
      Game.LoadMod('https://github.com/JakobKrug/frenzy-clicker/blob/master/frenzy-clicker.js');
    }() );
