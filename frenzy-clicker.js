"use strict";

(function () {
  class FrenzyClicker {
    constructor() {
      this._ticker = 0;
      this.settings = {
        enabled: false,
        frequency: 100, // ms between clicks
        debug: false,
      };

      this.ccVersion = 2.058;
      this.version = "2.058";
      this.clickBuffs = [
        "Elder frenzy",
        "Click frenzy",
        "Cursed finger",
        "Dragonflight",
      ];

      this.hadBuffs = false;
      this._toggleButton = null;

      // expose for debugging if desired
      window.FrenzyClicker = this;
    }

    // Utility debug printer
    debug(...args) {
      if (this.Debug) {
        console.debug.apply(console, args);
      }
    }

    get Speed() {
      return this.settings.frequency;
    }
    set Speed(val) {
      this.settings.frequency = val;
    }
    get Enabled() {
      return this.settings.enabled;
    }
    set Enabled(val) {
      this.settings.enabled = val;
    }
    get Debug() {
      return this.settings.debug;
    }
    set Debug(val) {
      this.settings.debug = val;
    }

    // Add the settings UI
    settingsMenu() {
      if (typeof Game === "undefined" || Game.onMenu !== "prefs") return;

      const frag = document.createDocumentFragment();

      // Title
      const title = document.createElement("div");
      title.className = "title";
      title.textContent = "Frenzy Clicker";
      frag.appendChild(title);

      // Toggle entry
      const toggleListing = document.createElement("div");
      toggleListing.className = "listing";

      const toggleLink = document.createElement("a");
      toggleLink.className = "option";
      toggleLink.id = "FrenzyClicker_Toggle";
      toggleLink.textContent = "Auto-clicking " + (this.Enabled ? "ON" : "OFF");

      this._toggleButton = toggleLink;

      toggleLink.onclick = () => {
        this.toggleMod();
      };

      toggleListing.appendChild(toggleLink);

      const toggleLabel = document.createElement("label");
      toggleLabel.textContent = " (Enable or disable all auto-clicking logic)";
      toggleListing.appendChild(toggleLabel);

      frag.appendChild(toggleListing);

      // Speed entry
      const speedListing = document.createElement("div");
      speedListing.className = "listing";

      const minus = document.createElement("a");
      minus.className = "option";
      minus.textContent = "-";
      minus.onclick = () => this._changeSpeed(-5);
      speedListing.appendChild(minus);

      const speedText = document.createElement("a");
      speedText.className = "option";
      speedText.id = "FrenzyClicker_Speed";
      speedText.textContent = (1000 / this.Speed).toFixed(2) + " / s";
      speedListing.appendChild(speedText);

      const plus = document.createElement("a");
      plus.className = "option";
      plus.textContent = "+";
      plus.onclick = () => this._changeSpeed(+5);
      speedListing.appendChild(plus);

      const speedLabel = document.createElement("label");
      speedLabel.textContent = " (clicks per second during auto-clicking)";
      speedListing.appendChild(speedLabel);

      frag.appendChild(speedListing);

      const menu = l("menu");
      if (menu) {
        const listings = menu.getElementsByClassName("listing");
        if (listings.length > 0) {
          listings[listings.length - 1].parentNode.insertBefore(
            frag,
            listings[listings.length - 1].nextSibling,
          );
        }
      }
    }

    _changeSpeed(delta) {
      const current = Math.round(1000 / this.Speed);
      const next = Math.min(100, Math.max(10, current + delta));
      this.Speed = 1000 / next;
      this.settingsChanged();
    }

    _cycleSpeed() {
      const current = Math.round(1000 / this.Speed);
      let next = 10;
      if (current < 10 || current >= 100) next = 10;
      else if (current < 25) next = 25;
      else if (current < 50) next = 50;
      else if (current < 75) next = 75;
      else next = 100;
      this.Speed = 1000 / next;
      this.settingsChanged();
    }

    settingsChanged() {
      try {
        localStorage.setItem("FCSettings", JSON.stringify(this.settings));
      } catch (e) {}
      // trigger menu redraw so text updates are visible
      if (
        typeof Game !== "undefined" &&
        typeof Game.UpdateMenu === "function"
      ) {
        Game.UpdateMenu();
      }
    }

    // Toggle enable/disable
    toggleMod() {
      this.Enabled = !this.Enabled;

      // Update UI if available
      const button =
        this._toggleButton || document.getElementById("FrenzyClicker_Toggle");
      if (button) {
        button.textContent = "Auto-clicking " + (this.Enabled ? "ON" : "OFF");
        button.className = this.Enabled ? "option enabled" : "option";
      }

      if (!this.Enabled) {
        if (this._ticker) {
          clearInterval(this._ticker);
          this._ticker = 0;
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

    // Main tick invoked on interval when enabled
    tick() {
      if (!this.hasAnyClickBuffs()) {
        if (this.hadBuffs) {
          this.hadBuffs = false;
        }
        return;
      }

      if (
        Game.hasBuff("Click frenzy") ||
        Game.hasBuff("Dragonflight") ||
        Game.hasBuff("Elder frenzy") ||
        Game.hasBuff("Cursed finger")
      ) {
        this._clickBigCookie();
      }

      this.hadBuffs = true;
    }

    _clickBigCookie() {
      if (
        typeof Game !== "undefined" &&
        typeof Game.ClickCookie === "function"
      ) {
        Game.ClickCookie();
      }
    }

    hasAnyClickBuffs() {
      if (typeof Game === "undefined" || typeof Game.hasBuff !== "function")
        return false;
      return this.clickBuffs.some((buff) => Game.hasBuff(buff));
    }

    // Start the ticking interval
    resume() {
      if (this.Enabled && !this._ticker) {
        this._ticker = setInterval(() => this.tick(), this.Speed);
      }
    }

    isRunning() {
      return this._ticker !== 0;
    }

    run() {
      if (this.isRunning()) return this;

      // load settings if present
      try {
        const stored = localStorage.getItem("FCSettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            this.settings = Object.assign(this.settings, parsed);
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      // Hook into the game's menu update so our settings appear in prefs
      if (
        typeof Game !== "undefined" &&
        typeof Game.UpdateMenu === "function"
      ) {
        const realUpdate = Game.UpdateMenu;
        Game.UpdateMenu = () => {
          realUpdate();
          try {
            this.settingsMenu();
          } catch (e) {
            // swallow errors to avoid breaking the game menu
            this.debug("settingsMenu error:", e);
          }
        };
        // render once
        Game.UpdateMenu();
      }

      // start if the setting says enabled
      this.resume();

      // Notify user
      if (typeof Game !== "undefined" && typeof Game.Notify === "function") {
        Game.Notify(
          "Frenzy Clicker " + this.version + " loaded",
          "Ready to click!",
          "",
          5,
          1,
        );
      } else {
        this.debug("Frenzy Clicker " + this.version + " loaded.");
      }

      return this;
    }
  }

  return new FrenzyClicker().run();
})();
