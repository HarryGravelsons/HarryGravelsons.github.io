// This file adds two small enhancements to the page:
// 1. Sections gently fade in as you scroll to them.
// 2. A button that lets you force light or dark mode and remembers your choice.
// If this script fails to load, the page still works exactly as before —
// nothing here is required for the content to show up.

(function () {
  "use strict";

  var root = document.documentElement; // the <html> element, where the theme is recorded
  var STORAGE_KEY = "theme"; // the localStorage key we save the chosen theme under

  // Reads any theme the visitor picked on a previous visit.
  // localStorage can throw (private browsing, storage disabled), so we
  // wrap it and just treat failures as "nothing saved".
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  // Saves the visitor's choice so it's remembered next time.
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // If saving fails, the toggle still works for this visit —
      // it just won't be remembered on the next one.
    }
  }

  // Works out which theme should currently be showing: a saved choice if
  // there is one, otherwise whatever the device/browser prefers.
  function getCurrentTheme() {
    var saved = getSavedTheme();
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemPrefersDark ? "dark" : "light";
  }

  var toggleButton = document.getElementById("theme-toggle");

  // Updates the page and the button to match a given theme.
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggleButton.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    // The visible label always describes what clicking the button will do next.
    toggleButton.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }

  if (toggleButton) {
    applyTheme(getCurrentTheme());
    toggleButton.hidden = false; // only reveal the button once JS can actually run it

    toggleButton.addEventListener("click", function () {
      var next = getCurrentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  // --- Fade sections in as they're scrolled into view ---

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Only animate if the browser supports IntersectionObserver and the
  // visitor hasn't asked for reduced motion. Otherwise sections just stay
  // visible with no animation, same as if this script never ran.
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    // CSS only hides sections when this class is on <body>, so the fade
    // effect only exists once we know JS is actually running.
    document.body.classList.add("js-fade");

    var sections = document.querySelectorAll("main section");

    // rootMargin pulls the trigger line in a bit from the bottom edge of the
    // screen. Without this, a section can flicker in/out right as a sliver
    // of it crosses the literal edge; this gives it a small buffer so the
    // fade starts just before that, instead of exactly on the hairline.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Keep toggling the class both ways, every time: add it when the
        // section comes into view, remove it when it leaves. That's what
        // makes the fade replay instead of only ever happening once.
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
