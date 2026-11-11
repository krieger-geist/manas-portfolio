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

/* ==========================================
   MODERN LAYER · interaction, motion, command palette
========================================== */
(function () {
    "use strict";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- Scroll progress bar ---------- */
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let ticking = false;
    const updateBar = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max) : 0);
        ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateBar); } }, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();

    /* ---------- Hero headline: word-by-word reveal ---------- */
    const headline = document.querySelector(".hero h1.display");
    if (headline && !reduceMotion) {
        let n = 0;
        const wrap = node => {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                        const s = document.createElement("span");
                        s.className = "w";
                        s.style.setProperty("--i", n++);
                        s.textContent = part;
                        frag.appendChild(s);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1) {
                    wrap(child);
                }
            });
        };
        headline.setAttribute("aria-label", headline.textContent.replace(/\s+/g, " ").trim());
        wrap(headline);
        headline.classList.add("split");
    }

    /* ---------- Staggered children in revealed blocks ---------- */
    if (!reduceMotion) {
        document.querySelectorAll(".reveal .tags, .reveal .btn-row, .metrics.reveal").forEach(el => el.classList.add("stagger"));
    }

    if (!finePointer || reduceMotion) return;

    /* ---------- Spotlight + gradient border on cards ---------- */
    document.querySelectorAll(".card, .feature").forEach(el => {
        el.classList.add("fx");
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", (e.clientX - r.left) + "px");
            el.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
    });

    /* ---------- Magnetic buttons ---------- */
    document.querySelectorAll(".btn-primary, .btn-ghost").forEach(btn => {
        btn.addEventListener("pointermove", e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) / r.width;
            const y = (e.clientY - r.top - r.height / 2) / r.height;
            btn.style.setProperty("--tx", (x * 8).toFixed(1) + "px");
            btn.style.setProperty("--ty", (y * 6).toFixed(1) + "px");
        });
        btn.addEventListener("pointerleave", () => {
            btn.style.setProperty("--tx", "0px");
            btn.style.setProperty("--ty", "0px");
        });
    });

    /* ---------- Badge: 3D tilt with light sheen ---------- */
    const badge = document.querySelector(".badge-card");
    if (badge) {
        const shine = document.createElement("div");
        shine.className = "badge-shine";
        shine.setAttribute("aria-hidden", "true");
        badge.appendChild(shine);
        badge.addEventListener("pointermove", e => {
            const r = badge.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            badge.classList.add("tilting");
            badge.style.setProperty("--ry", ((px - 0.5) * 14).toFixed(2) + "deg");
            badge.style.setProperty("--rx", ((0.5 - py) * 12).toFixed(2) + "deg");
            badge.style.setProperty("--sx", (px * 100) + "%");
            badge.style.setProperty("--sy", (py * 100) + "%");
        });
        badge.addEventListener("pointerleave", () => badge.classList.remove("tilting"));
    }
})();

/* ---------- Command palette (Ctrl/Cmd + K) ---------- */
(function () {
    "use strict";
    const actions = document.querySelector(".nav-actions");
    if (!actions) return;

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "icon-btn cmdk-btn";
    trigger.setAttribute("aria-label", "Open quick menu");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML = '<i class="fas fa-magnifying-glass" aria-hidden="true"></i><kbd>' + (isMac ? "⌘K" : "Ctrl K") + "</kbd>";
    const themeBtn = document.getElementById("theme-toggle");
    actions.insertBefore(trigger, themeBtn || actions.firstChild);

    const go = url => () => { window.location.href = url; };
    const open = url => () => { window.open(url, "_blank", "noopener"); };
    const EMAIL = "manas240surya@gmail.com";
    const items = [
        { g: "Pages", icon: "fas fa-house", label: "Home", run: go("index.html") },
        { g: "Pages", icon: "fas fa-layer-group", label: "Work", hint: "projects", run: go("projects.html") },
        { g: "Pages", icon: "fas fa-diagram-project", label: "Playbook", hint: "how I work", run: go("playbook.html") },
        { g: "Pages", icon: "fas fa-user", label: "About", run: go("about.html") },
        { g: "Pages", icon: "fas fa-award", label: "Achievements", hint: "certificates", run: go("achievements.html") },
        { g: "Pages", icon: "fas fa-paper-plane", label: "Contact", run: go("contact.html") },
        { g: "Pages", icon: "fas fa-handshake", label: "Work with me", hint: "pitch", run: go("pitch.html") },
        { g: "Projects", icon: "fas fa-shield-heart", label: "RELAY AEGIS case study", hint: "self-healing", run: go("projects.html#relay-aegis") },
        { g: "Projects", icon: "fab fa-youtube", label: "Watch the RELAY AEGIS demo", hint: "YouTube", run: open("https://youtu.be/whXmm6mRuRM") },
        { g: "Projects", icon: "fab fa-github", label: "RELAY AEGIS source code", hint: "GitHub", run: open("https://github.com/krieger-geist/relay-aegis") },
        { g: "Actions", icon: "fas fa-file-arrow-down", label: "Open my resume", hint: "PDF", run: open("resume.pdf") },
        { g: "Actions", icon: "fas fa-envelope", label: "Email me", hint: EMAIL, run: go("mailto:" + EMAIL) },
        { g: "Actions", icon: "fas fa-copy", label: "Copy email address", run: () => {
            if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(() => toast("Email copied"), () => toast(EMAIL));
            else toast(EMAIL);
        } },
        { g: "Actions", icon: "fas fa-circle-half-stroke", label: "Switch light / dark theme", run: () => { if (themeBtn) themeBtn.click(); } },
        { g: "Elsewhere", icon: "fab fa-github", label: "GitHub profile", run: open("https://github.com/krieger-geist") },
        { g: "Elsewhere", icon: "fab fa-linkedin-in", label: "LinkedIn", run: open("https://www.linkedin.com/in/manas-suryavanshi-a17986363/") },
        { g: "Elsewhere", icon: "fab fa-x-twitter", label: "X (Twitter)", run: open("https://x.com/ManasSurya25491") }
    ];

    function toast(text) {
        let t = document.querySelector(".cmdk-toast");
        if (!t) {
            t = document.createElement("div");
            t.className = "cmdk-toast";
            t.setAttribute("role", "status");
            document.body.appendChild(t);
        }
        t.textContent = text;
        t.classList.add("show");
        clearTimeout(t._h);
        t._h = setTimeout(() => t.classList.remove("show"), 2200);
    }

    const dlg = document.createElement("div");
    dlg.className = "cmdk";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    dlg.setAttribute("aria-label", "Quick menu");
    dlg.innerHTML =
        '<div class="cmdk-panel">' +
          '<div class="cmdk-input-row"><i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
            '<input class="cmdk-input" type="text" placeholder="Search pages, projects, actions..." aria-label="Search" role="combobox" aria-expanded="true" aria-controls="cmdk-list" autocomplete="off" spellcheck="false">' +
            "<kbd>Esc</kbd></div>" +
          '<ul class="cmdk-list" id="cmdk-list" role="listbox"></ul>' +
          '<div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd>move</span><span><kbd>↵</kbd>open</span><span><kbd>Esc</kbd>close</span></div>' +
        "</div>";
    document.body.appendChild(dlg);

    const input = dlg.querySelector(".cmdk-input");
    const list = dlg.querySelector(".cmdk-list");
    let shown = [], active = 0, lastFocus = null;

    const mark = () => {
        list.querySelectorAll(".cmdk-item").forEach(li => li.setAttribute("aria-selected", String(li.id === "cmdk-" + active)));
        const cur = document.getElementById("cmdk-" + active);
        if (cur) { input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
    };

    const render = () => {
        const q = input.value.trim().toLowerCase();
        shown = items.filter(it => !q || (it.label + " " + (it.hint || "") + " " + it.g).toLowerCase().includes(q));
        active = Math.min(active, Math.max(0, shown.length - 1));
        list.innerHTML = "";
        if (!shown.length) {
            const li = document.createElement("li");
            li.className = "cmdk-empty";
            li.textContent = 'No results for "' + input.value.trim() + '"';
            list.appendChild(li);
            input.removeAttribute("aria-activedescendant");
            return;
        }
        let group = "";
        shown.forEach((it, idx) => {
            if (it.g !== group) {
                group = it.g;
                const h = document.createElement("li");
                h.className = "cmdk-group";
                h.setAttribute("role", "presentation");
                h.textContent = group;
                list.appendChild(h);
            }
            const li = document.createElement("li");
            li.className = "cmdk-item";
            li.id = "cmdk-" + idx;
            li.setAttribute("role", "option");
            li.innerHTML = '<i class="' + it.icon + '" aria-hidden="true"></i><span></span>' + (it.hint ? '<span class="hint"></span>' : "");
            li.children[1].textContent = it.label;
            if (it.hint) li.children[2].textContent = it.hint;
            li.addEventListener("pointermove", () => { if (active !== idx) { active = idx; mark(); } });
            li.addEventListener("click", () => runItem(idx));
            list.appendChild(li);
        });
        mark();
    };

    const show = () => {
        lastFocus = document.activeElement;
        input.value = "";
        active = 0;
        render();
        dlg.classList.add("open");
        document.body.style.overflow = "hidden";
        setTimeout(() => input.focus(), 10);
    };
    const hide = () => {
        dlg.classList.remove("open");
        document.body.style.overflow = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const runItem = idx => { const it = shown[idx]; if (!it) return; hide(); it.run(); };

    trigger.addEventListener("click", show);
    dlg.addEventListener("click", e => { if (e.target === dlg) hide(); });
    input.addEventListener("input", () => { active = 0; render(); });
    input.addEventListener("keydown", e => {
        const n = Math.max(1, shown.length);
        if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % n; mark(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
        else if (e.key === "Enter") { e.preventDefault(); runItem(active); }
        else if (e.key === "Tab") { e.preventDefault(); }
    });
    document.addEventListener("keydown", e => {
        const isOpen = dlg.classList.contains("open");
        const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (isOpen) hide(); else show();
        } else if (e.key === "Escape" && isOpen) {
            hide();
        } else if (e.key === "/" && !isOpen && !typing) {
            e.preventDefault();
            show();
        }
    });
})();
