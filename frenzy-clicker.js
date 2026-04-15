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

      window.FrenzyClicker = this;
    }

    settingsMenu() {
      if (Game.onMenu != "prefs") return;

      // Title
      var div = document.createElement("div");
      div.className = "title ";
      div.textContent = "Frenzy Clicker";

      var el = document.createDocumentFragment();

      // Header
      el.appendChild(div);

      // Toggle
      let toggle = document.createElement("div");
      toggle.className = "listing";
      let onOff = document.createElement("a");
      onOff.className = "option";
      onOff.id = "frenzyClickerToggle";
      onOff.textContent = "Auto-clicking " + self.Enabled ? "ON" : "OFF";
      onOff.onclick = self.toggleMod;
      toggle.appendChild(onOff);
      el.appendChild(toggle);

      // Speed
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
      label.textContent =
        "(clicks per second during auto-clicking the big cookie)";
      speed.appendChild(label);

      el.appendChild(speed);

      let settings = l("menu").getElementsByClassName("listing");

      settings[0].parentNode.insertBefore(
        el,
        settings[settings.length - 1].nextSibling,
      );
    }

    settingsChanged() {
      localStorage.setItem("FCSettings", JSON.stringify(self.settings));
      Game.UpdateMenu();
    }

    toggleMod() {
      self.Enabled = !self.Enabled;
      let button = document.getElementById("frenzyClickerToggle");
      if (button) {
        button.textContent = "Auto-clicking " + (self.Enabled ? "ON" : "OFF");
      }

      if (!self.Enabled && self.isRunning()) {
        clearInterval(self.mainTicker);
        self.mainTicker = 0;
        self.debug("Frenzy Clicker paused.");
      } else if (self.Enabled && !self.isRunning()) {
        self.resume();
        self.debug("Frenzy Clicker resumed.");
      }

      self.settingsChanged();
    }

    speedMod() {
      let current = Math.round(1000 / self.Speed);
      let next = 0;
      // Increase/decrease
      if (this.id != "FrenzyClicker_Speed") {
        next = Math.min(
          100,
          Math.max(10, current + (this.innerText == "+" ? 10 : -10)),
        );
      }
      // Toggle jumps
      else {
        if (current < 10 || current >= 100) {
          next = 10;
        } else if (current < 25) {
          next = 25;
        } else if (current < 50) {
          next = 50;
        } else if (current < 75) {
          next = 75;
        } else {
          next = 100;
        }
      }
      self.Speed = 1000 / next;
      self.debug(
        "Frenzy Clicker click frequency:",
        self.Speed.toFixed(2),
        "ms",
      );

      self.settingsChanged();
    }

    tick() {
      if (!self.hasAnyClickBuffs()) {
        if (self.hadBuffs) {
          self.hadBuffs = false;
          self.debug("Buff(s) off.");
          if (self.hadCookieStorm) {
            self.hadCookieStorm = false;
            self.debug("Ensuring Cookie Storm leftovers are cleaned up.");
            while (Game.shimmers.length > 0)
              Game.shimmers.forEach((shimmer) => shimmer.pop());
          }
        }
        return;
      }

      if (!self.hadBuffs) {
        self.debug("Buff(s) on.");
      }

      if (Game.hasBuff("Cookie storm")) {
        if (!self.hadCookieStorm) {
          self.hadCookieStorm = true;
        }
        Game.shimmers.forEach((shimmer) => shimmer.pop());
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
      this.mainTicker = setInterval(this.tick, this.Speed);
    }

    run() {
      if (!this.isRunning()) {
        // Check for version match
        let load = true;
        if (Game.version != this.ccVersion) {
          load = confirm(
            "Frency Clicker " +
              this.version +
              " is meant for Cookie Clicker version " +
              this.ccVersion +
              ", you are playing version " +
              Game.version +
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

        let title = "Frenzy Clicker " + this.version + " loaded";
        let text =
          "Click speed: once every " +
          this.Speed +
          " milliseconds, or " +
          (1000 / this.Speed).toFixed(2) +
          " times per second.";

        Game.Notify(title, text, "", 5, 1);
        console.info(title + ". " + text);
      }

      return this;
    }

    isRunning() {
      return this.mainTicker > 0;
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
