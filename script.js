(function () {
  "use strict";

  var STORAGE_KEY = "romanticDateChoice";
  var pages = {
    page1: document.getElementById("page1"),
    page2: document.getElementById("page2"),
    page3: document.getElementById("page3"),
    pageFinal: document.getElementById("pageFinal"),
  };

  function showPage(id) {
    Object.keys(pages).forEach(function (k) {
      pages[k].classList.remove("active");
      pages[k].classList.remove("leaving");
    });
    requestAnimationFrame(function () {
      pages[id].classList.add("active");
    });
  }

  function transitionTo(id) {
    var current = document.querySelector(".page.active");
    if (!current || current === pages[id]) {
      showPage(id);
      return;
    }
    current.classList.add("leaving");
    current.classList.remove("active");
    setTimeout(function () {
      current.classList.remove("leaving");
      showPage(id);
    }, 650);
  }

  /* ---- Page 1 -> 2 ---- */
  document.getElementById("goToPage2").addEventListener("click", function () {
    transitionTo("page2");
  });

  /* ---- Page 2: escaping NO button ---- */
  var noBtn = document.getElementById("noBtn");
  var yesBtn = document.getElementById("yesBtn");

  function escapeNo(e) {
    if (e.type === "click" && e.target === noBtn) {
      e.preventDefault();
    }
    var btnRect = noBtn.getBoundingClientRect();
    var btnCx = btnRect.left + btnRect.width / 2;
    var btnCy = btnRect.top + btnRect.height / 2;

    var px, py;
    if (e.touches && e.touches.length) {
      px = e.touches[0].clientX;
      py = e.touches[0].clientY;
    } else {
      px = e.clientX;
      py = e.clientY;
    }

    var dx = px - btnCx;
    var dy = py - btnCy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var threshold = 140;

    if (dist < threshold || (e.type === "click" && e.target === noBtn)) {
      var maxX = window.innerWidth - btnRect.width - 24;
      var maxY = window.innerHeight - btnRect.height - 24;
      var newX = Math.max(24, Math.min(maxX, Math.random() * maxX));
      var newY = Math.max(24, Math.min(maxY, Math.random() * maxY));
      noBtn.style.position = "fixed";
      noBtn.style.left = newX + "px";
      noBtn.style.top = newY + "px";
      noBtn.style.margin = "0";
    }
  }

  noBtn.addEventListener("mouseover", escapeNo);
  noBtn.addEventListener("mousemove", escapeNo);
  noBtn.addEventListener("click", escapeNo);
  noBtn.addEventListener("touchstart", escapeNo, { passive: true });
  noBtn.addEventListener("touchmove", escapeNo, { passive: true });
  noBtn.addEventListener("pointerover", escapeNo);
  noBtn.addEventListener("pointermove", escapeNo);

  yesBtn.addEventListener("click", function () {
    transitionTo("page3");
  });

  /* ---- Page 3: cards ---- */
  var cards = document.querySelectorAll(".card");
  var customWrap = document.getElementById("customWrap");
  var customPlace = document.getElementById("customPlace");
  var confirmCustom = document.getElementById("confirmCustom");
  var selectedChoice = null;

  function selectChoice(choice, isCustom) {
    selectedChoice = choice;
    cards.forEach(function (c) {
      c.classList.toggle("selected", c.dataset.choice === choice && !isCustom);
    });
    if (choice === "Another place") {
      customWrap.classList.remove("hidden");
      customPlace.focus();
    } else {
      customWrap.classList.add("hidden");
      finalizeChoice(choice);
    }
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectChoice(card.dataset.choice, false);
    });
  });

  confirmCustom.addEventListener("click", function () {
    var val = customPlace.value.trim();
    if (!val) {
      customPlace.focus();
      return;
    }
    finalizeChoice(val);
  });

  /* ---- Finalize + persist ---- */
  function finalizeChoice(choice) {
    var record = { choice: choice, date: new Date().toLocaleString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (err) {
      /* storage may be unavailable; keep going in-memory */
    }
    document.getElementById("finalChoice").textContent =
      "Your choice: " + choice + "  •  " + record.date;
    transitionTo("pageFinal");
  }

  /* ---- Send on WhatsApp ---- */
  var WHATSAPP_NUMBER = "212608376018"; /* 0608376018 in international format, no + or leading 0 */
  var datePick = document.getElementById("datePick");

  document.getElementById("sendWhatsappBtn").addEventListener("click", function () {
    var record = loadRecord();
    var place = record ? record.choice : "(no choice yet)";
    var pickedDate = datePick.value; /* yyyy-mm-dd */

    var text = "Hey! ❤️ I chose: " + place;
    if (pickedDate) {
      text += "\nDate: " + pickedDate;
    }

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  });

  /* ---- Reset ---- */
  document.getElementById("resetBtn").addEventListener("click", function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    customPlace.value = "";
    customWrap.classList.add("hidden");
    cards.forEach(function (c) { c.classList.remove("selected"); });
    selectedChoice = null;
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.margin = "";
    transitionTo("page1");
  });

  /* ---- Load saved state ---- */
  function loadRecord() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (err) {
      return null;
    }
  }

  function init() {
    var saved = loadRecord();
    if (saved && saved.choice) {
      document.getElementById("finalChoice").textContent =
        "Your choice: " + saved.choice + "  •  " + saved.date;
      showPage("pageFinal");
    } else {
      showPage("page1");
    }
  }

  init();
})();
