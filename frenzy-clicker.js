"use strict";

javascript: (function () {
  var self;

  class FrenzyClicker {
    constructor() {
      self = this;

      this.mainTicker = 0;
      this.settings = {
        enabled: false,
        frequency: 100,
        debug: true,
      };
      ((this.ccVersion = 2.058),
        (this.version = "2.058"),
        (this.clickBuffs = [
          "Elder frenzy",
          "Click frenzy",
          "Cursed finger",
          "Cookie storm",
          "Dragonflight",
        ]));
      this.hadBuffs = false;
      this.hadCookieStorm = false;
      this._toggleButton = null;

      window.FrenzyClicker = this;
    }

    settingsMenu() {
      if (Game.onMenu != "prefs") return;

      var el = document.createDocumentFragment();

      // Title
      var div = document.createElement("div");
      div.className = "title";
      div.textContent = "Frenzy Clicker";
      el.appendChild(div);

      // --- Toggle & Description ---
      let toggleContainer = document.createElement("div");
      toggleContainer.className = "listing";

      let onOff = document.createElement("a");
      onOff.className = "option";
      onOff.id = "FrenzyClicker_Toggle"; // Added ID for reliable updating
      onOff.textContent = "Auto-clicking " + (self.Enabled ? "ON" : "OFF");

      // Keep a direct reference to the toggle button on the instance so updates don't rely solely on querying the DOM.
      this._toggleButton = onOff;
      // Use an arrow callback so `this` inside the handler refers to the class instance.
      onOff.onclick = () => {
        this.toggleMod();
      };

      toggleContainer.appendChild(onOff);

      let toggleLabel = document.createElement("label");
      toggleLabel.textContent = " (Enable or disable all auto-clicking logic)";
      toggleContainer.appendChild(toggleLabel);

      el.appendChild(toggleContainer);

      // --- Speed Setting ---
      let speed = document.createElement("div");
      speed.className = "listing";

      let minus = document.createElement("a");
      minus.className = "option";
      minus.onclick = self.speedMod;
      minus.textContent = "-";
      speed.appendChild(minus);

      let text = document.createElement("a");
      text.className = "option";
      text.id = "FrenzyClicker_Speed";
      text.textContent = (1000 / this.Speed).toFixed(2) + " / s";
      text.onclick = self.speedMod;
      speed.appendChild(text);

      let plus = document.createElement("a");
      plus.className = "option";
      plus.onclick = self.speedMod;
      plus.textContent = "+";
      speed.appendChild(plus);

      let label = document.createElement("label");
      label.textContent = " (clicks per second during auto-clicking)";
      speed.appendChild(label);

      el.appendChild(speed);

      // --- Injection Logic ---
      // We look for the menu and find the very last 'listing' to append after
      let menu = l("menu");
      if (menu) {
        let settings = menu.getElementsByClassName("listing");
        if (settings.length > 0) {
          settings[settings.length - 1].parentNode.insertBefore(
            el,
            settings[settings.length - 1].nextSibling,
          );
        }
      }
    }

    settingsChanged() {
      localStorage.setItem("FCSettings", JSON.stringify(self.settings));
      Game.UpdateMenu();
    }

    toggleMod() {
      // toggle the enabled flag on the instance
      this.Enabled = !this.Enabled;

      // Prefer the stored DOM reference; fall back to a DOM query if necessary
      let button =
        this._toggleButton || document.getElementById("FrenzyClicker_Toggle");
      if (button) {
        button.textContent = "Auto-clicking " + (this.Enabled ? "ON" : "OFF");
        // Visual polish: toggle the 'enabled' class to change button color like vanilla game
        button.className = this.Enabled ? "option enabled" : "option";
      }

      if (!this.Enabled) {
        if (this.mainTicker) {
          clearInterval(this.mainTicker);
          this.mainTicker = 0;
        }
        this.debug("Frenzy Clicker paused.");
      } else {
        if (!this.isRunning()) {
          this.resume();
        }
        this.debug("Frenzy Clicker resumed.");
      }

      this.settingsChanged();
    }

    speedMod() {
      let current = Math.round(1000 / self.Speed);
      let next = 0;
      if (this.id != "FrenzyClicker_Speed") {
        next = Math.min(
          100,
          Math.max(10, current + (this.innerText == "+" ? 10 : -10)),
        );
      } else {
        if (current < 10 || current >= 100) next = 10;
        else if (current < 25) next = 25;
        else if (current < 50) next = 50;
        else if (current < 75) next = 75;
        else next = 100;
      }
      self.Speed = 1000 / next;
      self.settingsChanged();
    }

    tick() {
      if (!self.hasAnyClickBuffs()) {
        if (self.hadBuffs) {
          self.hadBuffs = false;
          if (self.hadCookieStorm) {
            self.hadCookieStorm = false;
            while (Game.shimmers.length > 0)
              Game.shimmers.forEach((s) => s.pop());
          }
        }
        return;
      }

      if (Game.hasBuff("Cookie storm")) {
        self.hadCookieStorm = true;
        Game.shimmers.forEach((s) => s.pop());
      }
      if (
        Game.hasBuff("Click frenzy") ||
        Game.hasBuff("Dragonflight") ||
        Game.hasBuff("Elder frenzy") ||
        Game.hasBuff("Cursed finger")
      ) {
        Game.ClickCookie();
      }
      self.hadBuffs = true;
    }

    hasAnyClickBuffs() {
      return this.clickBuffs.some((buff) => Game.hasBuff(buff));
    }

    resume() {
      if (this.Enabled) {
        this.mainTicker = setInterval(this.tick, this.Speed);
      }
    }

    run() {
      if (!this.isRunning()) {
        let load = true;
        if (Game.version != this.ccVersion) {
          load = confirm(
            "Frenzy Clicker " +
              this.version +
              " is meant for " +
              this.ccVersion +
              ". Start anyway?",
          );
        }
        if (!load) return false;

        if (localStorage.getItem("FCSettings") != null) {
          self.settings = JSON.parse(localStorage.getItem("FCSettings"));
        }

        let realLoop = Game.UpdateMenu;
        Game.UpdateMenu = () => {
          realLoop();
          this.settingsMenu();
        };
        Game.UpdateMenu();

        this.resume();
        Game.Notify(
          "Frenzy Clicker " + this.version + " loaded",
          "Ready to click!",
          "",
          5,
          1,
        );
      }
      return this;
    }

    isRunning() {
      return this.mainTicker !== 0;
    }

    debug(...params) {
      if (this.Debug) console.debug.apply(console, params);
    }

    get Speed() {
      return this.settings.frequency;
    }
    set Speed(val) {
      return (this.settings.frequency = val);
    }
    get Enabled() {
      return this.settings.enabled;
    }
    set Enabled(val) {
      return (this.settings.enabled = val);
    }
    get Debug() {
      return this.settings.debug;
    }
    set Debug(val) {
      return (this.settings.debug = val);
    }
  }

  return new FrenzyClicker().run();
})();
