/* Trionex Technology Limited — site interactions.
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById("navbar");

  function onScroll() {
    if (window.scrollY > 24) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
    toggleToTop();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navLinks = document.querySelectorAll("#nav-links a");

  function setMenu(open) {
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = siteNav.querySelector("a");
      if (first) first.focus();
    } else {
      navToggle.focus();
    }
  }

  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  document.addEventListener("click", function (e) {
    if (
      siteNav.classList.contains("is-open") &&
      !siteNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setMenu(false);
    }
  });

  /* Close menu after picking a link */
  Array.prototype.forEach.call(navLinks, function (link) {
    link.addEventListener("click", function () {
      if (siteNav.classList.contains("is-open")) setMenu(false);
    });
  });

  /* ---------- Scrollspy (active nav link) ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var spyLinks = document.querySelectorAll(".nav-link");

  function setActive(id) {
    Array.prototype.forEach.call(spyLinks, function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var reveals = document.querySelectorAll(".reveal");
    /* Stagger siblings slightly */
    reveals.forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i % 4) * 0.08 + "s");
    });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    /* No JS animation path: everything already visible (no .is-revealed needed) */
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("to-top");

  function toggleToTop() {
    toTop.classList.toggle("is-visible", window.scrollY > 480);
  }

  toTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });

  /* ---------- Contact form: validate + mailto compose ---------- */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");

  function setError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    if (message) {
      input.closest(".form-field").classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
    } else {
      input.closest(".form-field").classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    }
  }

  function showStatus(message) {
    statusEl.textContent = message;
    statusEl.classList.add("is-visible");
  }

  if (form) {
    /* Clear error while typing */
    ["cf-name", "cf-email", "cf-message"].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", function () {
        setError(id, id + "-error", "");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var phone = document.getElementById("cf-phone").value.trim();
      var company = document.getElementById("cf-company").value.trim();
      var service = document.getElementById("cf-service").value;
      var message = document.getElementById("cf-message").value.trim();

      var valid = true;

      if (!name) {
        setError("cf-name", "cf-name-error", "Please enter your name.");
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("cf-email", "cf-email-error", "Please enter a valid email address.");
        valid = false;
      }
      if (!message) {
        setError("cf-message", "cf-message-error", "Please tell us a little about your project.");
        valid = false;
      }

      if (!valid) {
        showStatus("Please fix the highlighted fields and try again.");
        return;
      }

      /* Compose mailto — recipient supplied when company email confirmed. */
      var subject = "Project enquiry from " + name + (company ? " (" + company + ")" : "");
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        (phone ? "Phone: " + phone + "\n" : "") +
        (company ? "Company: " + company + "\n" : "") +
        (service ? "Service: " + service + "\n" : "") +
        "\nMessage:\n" + message + "\n";

      var mailto =
        "mailto:?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      showStatus(
        "Thank you, " + name + ". Your email app should now open with your message pre-filled — " +
        "add the recipient address and send. We look forward to hearing from you."
      );
      form.reset();
    });
  }

  /* Initial paint */
  onScroll();
})();
