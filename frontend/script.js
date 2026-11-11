/* ==========================================
   MANAS PORTFOLIO 2026 · site script
========================================== */

(function () {
    "use strict";

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Theme ---------- */
    const themeBtn = document.getElementById("theme-toggle");

    function currentTheme() {
        const set = root.getAttribute("data-theme");
        if (set) return set;
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "light" ? "#f6f5f1" : "#0a0d12");
        if (themeBtn) themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }

    applyTheme(currentTheme());

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const next = currentTheme() === "light" ? "dark" : "light";
            applyTheme(next);
            try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
        });
    }

    /* ---------- Mobile menu ---------- */
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.getElementById("nav-links");

    function setMenu(open) {
        if (!menuBtn || !navLinks) return;
        navLinks.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        const icon = menuBtn.querySelector("i");
        if (icon) icon.className = open ? "fas fa-xmark" : "fas fa-bars";
    }

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
        navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
        document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
        window.addEventListener("resize", () => { if (window.innerWidth > 900) setMenu(false); });
    }

    /* ---------- Header border + back-to-top ---------- */
    const header = document.querySelector(".site-header");
    const topBtn = document.querySelector(".top-btn");

    function onScroll() {
        const y = window.scrollY;
        if (header) header.classList.toggle("scrolled", y > 8);
        if (topBtn) topBtn.classList.toggle("show", y > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
        topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    }

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if (!reduceMotion && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add("in"));
    }

    /* ---------- Hero terminal: play the log line by line ---------- */
    const terminal = document.getElementById("terminal");
    if (terminal && !reduceMotion) {
        const lines = Array.from(terminal.querySelectorAll(".ln"));
        lines.forEach(l => { l.style.visibility = "hidden"; });
        let i = 0;
        const step = () => {
            if (i < lines.length) {
                lines[i].style.visibility = "visible";
                i += 1;
                setTimeout(step, i === 1 ? 700 : 520);
            } else {
                setTimeout(() => {
                    lines.forEach(l => { l.style.visibility = "hidden"; });
                    i = 0;
                    step();
                }, 6000);
            }
        };
        setTimeout(step, 400);
    }

    /* ---------- Project filter ---------- */
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projects = document.querySelectorAll("#project-grid .project-item");

    if (filterBtns.length && projects.length) {
        const matches = (el, f) => f === "all" || (el.dataset.cats || "").split(" ").includes(f);

        filterBtns.forEach(btn => {
            const count = btn.querySelector(".count");
            if (count) count.textContent = Array.from(projects).filter(p => matches(p, btn.dataset.filter)).length;

            btn.addEventListener("click", () => {
                const f = btn.dataset.filter;
                filterBtns.forEach(b => {
                    b.classList.toggle("active", b === btn);
                    b.setAttribute("aria-pressed", String(b === btn));
                });
                projects.forEach(p => {
                    const show = matches(p, f);
                    p.classList.toggle("is-hidden", !show);
                    if (show) p.classList.add("in");
                });
            });
        });
    }

    /* ---------- Certificate lightbox ---------- */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeLightbox = lightbox ? lightbox.querySelector(".close-lightbox") : null;
    let lastFocus = null;

    function close() {
        if (!lightbox) return;
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
        if (lastFocus) lastFocus.focus();
    }

    window.openLightbox = function (src) {
        if (!lightbox || !lightboxImg) return;
        lastFocus = document.activeElement;
        lightboxImg.src = src;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
        if (closeLightbox) closeLightbox.focus();
    };

    if (lightbox) {
        lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
        if (closeLightbox) {
            closeLightbox.addEventListener("click", close);
            closeLightbox.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close(); }
            });
        }
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) close();
        });
    }

    /* ---------- Contact form (Spring Boot API) ---------- */
    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        const formMessage = document.getElementById("form-message");
        const submitBtn = document.getElementById("contact-submit-btn");
        const apiBaseUrl = window.PORTFOLIO_API_URL || "http://localhost:8080";
        let slowTimer;

        // The free Render backend sleeps when idle and can take up to a minute to wake.
        // Ping it as soon as the page opens so it's ready when the visitor hits send.
        fetch(apiBaseUrl + "/api/health", { cache: "no-store" }).catch(() => {});

        const showMessage = (text, type) => {
            if (!formMessage) return;
            formMessage.textContent = text;
            formMessage.className = "form-message" + (type ? " " + type : "");
        };

        const setSubmitting = busy => {
            if (!submitBtn) return;
            submitBtn.disabled = busy;
            const label = submitBtn.querySelector("span");
            if (label) label.textContent = busy ? "Sending..." : "Send message";
        };

        contactForm.addEventListener("submit", async e => {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const payload = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                subject: contactForm.subject.value.trim(),
                message: contactForm.message.value.trim(),
                website: contactForm.website ? contactForm.website.value.trim() : ""
            };

            setSubmitting(true);
            showMessage("", "");
            slowTimer = setTimeout(() => {
                showMessage("Waking up the server, this can take up to a minute on the first message...", "info");
            }, 4000);

            try {
                const response = await fetch(apiBaseUrl + "/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    showMessage(data.message || "Thank you! Your message has been sent.", "success");
                    contactForm.reset();
                } else if (response.status === 429) {
                    showMessage(data.message || "Too many messages sent recently. Please try again later.", "error");
                } else {
                    showMessage(data.message || "Could not send message. Please try again.", "error");
                }
            } catch (err) {
                showMessage("Unable to reach the server right now. Please try again in a moment, or email me directly.", "error");
            } finally {
                clearTimeout(slowTimer);
                setSubmitting(false);
            }
        });
    }
})();

/* ---------- Pitch page: personalise with ?for=Company&role=Role ---------- */
(function () {
    "use strict";
    const form = document.getElementById("pitch-form");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const clean = v => (v || "").replace(/[<>]/g, "").trim().slice(0, 60);
    const company = clean(params.get("for"));
    const role = clean(params.get("role"));

    const dateEl = document.getElementById("pitch-date");
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    if (company) {
        document.getElementById("pitch-prepared").textContent = "Prepared for " + company + (role ? " · " + role : "");
        document.querySelectorAll(".pitch-company-name").forEach(el => { el.textContent = company; });
        document.title = "Proposal for " + company + " · Manas Suryavanshi";
        const mail = document.getElementById("pitch-mail");
        if (mail) mail.href = mail.href.split("?")[0] + "?subject=" + encodeURIComponent((role || "Opportunity") + " at " + company);
    } else if (role) {
        document.getElementById("pitch-prepared").textContent = "Proposal · " + role;
    }
    form.elements.for.value = company;
    form.elements.role.value = role;

    const buildUrl = () => {
        const u = new URL(window.location.href.split("?")[0]);
        const c = clean(form.elements.for.value), r = clean(form.elements.role.value);
        if (c) u.searchParams.set("for", c);
        if (r) u.searchParams.set("role", r);
        return u.toString();
    };

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const url = buildUrl();
        const label = form.querySelector('button[type="submit"] span');
        try {
            await navigator.clipboard.writeText(url);
            if (label) label.textContent = "Link copied";
        } catch (err) {
            window.prompt("Copy this link:", url);
        }
        if (url !== window.location.href) window.history.replaceState(null, "", url);
        const fresh = new URLSearchParams(new URL(url).search);
        const c = fresh.get("for") || "", r = fresh.get("role") || "";
        document.getElementById("pitch-prepared").textContent = c ? "Prepared for " + c + (r ? " · " + r : "") : (r ? "Proposal · " + r : "Proposal");
        document.querySelectorAll(".pitch-company-name").forEach(el => { el.textContent = c || "your team"; });
        setTimeout(() => { if (label) label.textContent = "Copy link"; }, 2500);
    });

    const printBtn = document.getElementById("pitch-print");
    if (printBtn) printBtn.addEventListener("click", () => window.print());
})();
