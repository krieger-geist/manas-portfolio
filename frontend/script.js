/* ==========================================
   MANAS PORTFOLIO 2026
   Global JavaScript
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       MOBILE MENU
    =============================== */

    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {

        menuBtn.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-active");

            const icon = menuBtn.querySelector("i");

            if (navLinks.classList.contains("mobile-active")) {

                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");

            } else {

                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");

            }

        });

    }

    /* ===============================
       TYPING EFFECT
    =============================== */

    const typing = document.getElementById("typing-text");

    if (typing) {

        const words = [

            "Java Backend Developer",

            "Spring Boot Learner",

            "REST API Developer",

            "AI Integration Explorer"

        ];

        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function type() {

            const current = words[wordIndex];

            if (!deleting) {

                typing.textContent = current.substring(0, charIndex + 1);

                charIndex++;

                if (charIndex === current.length) {

                    deleting = true;

                    setTimeout(type, 1500);

                    return;

                }

            } else {

                typing.textContent = current.substring(0, charIndex - 1);

                charIndex--;

                if (charIndex === 0) {

                    deleting = false;

                    wordIndex++;

                    if (wordIndex >= words.length) {

                        wordIndex = 0;

                    }

                }

            }

            setTimeout(type, deleting ? 60 : 120);

        }

        type();

    }

    /* ===============================
       STICKY HEADER
    =============================== */

    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

    /* ===============================
       SCROLL REVEAL
    =============================== */

    const revealItems = document.querySelectorAll(".card,.section-title,.hero-content,.stat");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: .15

    });

    revealItems.forEach(item => {

        item.classList.add("fade-up");

        observer.observe(item);

    });

    /* ===============================
       COUNTER ANIMATION
    =============================== */

    const counters = document.querySelectorAll(".stat h2, .stat-card h2");

    counters.forEach(counter => {

        const targetText = counter.innerText;

        const number = parseInt(targetText);

        if (isNaN(number)) return;

        let count = 0;

        const speed = Math.ceil(number / 50);

        const update = () => {

            count += speed;

            if (count >= number) {

                counter.innerText = targetText;

            } else {

                if (targetText.includes("%")) {

                    counter.innerText = count + "%";

                } else if (targetText.includes("+")) {

                    counter.innerText = count + "+";

                } else {

                    counter.innerText = count;

                }

                requestAnimationFrame(update);

            }

        };

        update();

    });

    /* ===============================
       PROJECT FILTER
    =============================== */

    const filterBtns = document.querySelectorAll(".filter-btn");
const projects = document.querySelectorAll(".project-item");

filterBtns.forEach(btn=>{

btn.onclick=()=>{

filterBtns.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

const filter=btn.dataset.filter;

projects.forEach(project=>{

if(filter==="all"){

project.style.display="block";

return;

}

project.style.display=
project.classList.contains(filter)
?"block":"none";

});

};

});

        

    

    /* ===============================
       GALLERY LIGHTBOX
    =============================== */

                        const gallery=document.querySelectorAll(".gallery-card img");

                    if(gallery.length){

                    const lightbox=document.createElement("div");

                    lightbox.className="lightbox";

                    document.body.appendChild(lightbox);

                    gallery.forEach(img=>{

                    img.onclick=()=>{

                    lightbox.classList.add("active");

                    lightbox.innerHTML=`

                    <span class="close">&times;</span>

                    <img src="${img.src}">

                    `;

                    };

                    });

                    lightbox.onclick=()=>{

                    lightbox.classList.remove("active");

                    };

                    }

                        /* ===============================
                        BACK TO TOP
                        =============================== */

                        const topBtn = document.createElement("button");

                        topBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';

                        topBtn.className = "top-btn";

                        document.body.appendChild(topBtn);

                        window.addEventListener("scroll", () => {

                            if (window.scrollY > 400) {

                                topBtn.classList.add("show-top");

                            }

                            else {

                                topBtn.classList.remove("show-top");

                            }

                        });

                        topBtn.addEventListener("click", () => {

                            window.scrollTo({

                                top: 0,

                                behavior: "smooth"

                            });

                        });

                    });

                    /* =======================================
                    LOADER
                    ======================================= */

                    window.addEventListener("load",()=>{

                    const loader=document.getElementById("loader");

                    if(loader){

                    setTimeout(()=>{

                    loader.classList.add("loader-hide");

                    },800);

                    }

                    });

                    /* =======================================
                    PARTICLES
                    ======================================= */

                    const particles=document.getElementById("particles");

                    if(particles){

                    for(let i=0;i<80;i++){

                    const p=document.createElement("span");

                    p.className="particle";

                    const size=Math.random()*6+2;

                    p.style.width=size+"px";
                    p.style.height=size+"px";

                    p.style.left=Math.random()*100+"vw";

                    p.style.animationDuration=
                    10+Math.random()*20+"s";

                    p.style.animationDelay=
                    Math.random()*10+"s";

                    particles.appendChild(p);

                    }

                    }

                    /* =======================================
                    CURSOR GLOW
                    ======================================= */

                    const glow=document.getElementById("cursor-glow");

                    document.addEventListener("mousemove",(e)=>{

                    if(glow){

                    glow.style.left=e.clientX+"px";

                    glow.style.top=e.clientY+"px";

                    }

                    });

                    /* =======================================
                    THEME
                    ======================================= */

                    const themeBtn=document.getElementById("theme-toggle");

                    if(themeBtn){

                    const icon = themeBtn.querySelector("i");

                    // Sync the icon with whatever theme the inline
                    // bootstrap script already applied to <body>.
                    if(document.body.classList.contains("light")){
                        icon.className="fas fa-sun";
                    }

                    themeBtn.onclick=()=>{

                    document.body.classList.toggle("light");

                    if(document.body.classList.contains("light")){

                    icon.className="fas fa-sun";

                    localStorage.setItem("theme","light");

                    }else{

                    icon.className="fas fa-moon";

                    localStorage.setItem("theme","dark");

                    }

                    }

                    }

                    /* ===================================
LIGHTBOX
=================================== */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.querySelector(".close-lightbox");

if (lightbox && lightboxImg && closeLightbox) {

    function openLightbox(imageSrc) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add("active");
    }

    window.openLightbox = openLightbox;

    closeLightbox.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });
}

/* ===================================
   CONTACT FORM (Java Backend)
=================================== */

const contactForm = document.getElementById("contact-form");

if (contactForm) {

    const formMessage = document.getElementById("form-message");
    const submitBtn = document.getElementById("contact-submit-btn");
    const apiBaseUrl = window.PORTFOLIO_API_URL || "http://localhost:8080";

    function showFormMessage(text, type) {
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.className = "form-message " + type;
    }

    function setSubmitting(isSubmitting) {
        if (!submitBtn) return;
        submitBtn.disabled = isSubmitting;
        const label = submitBtn.querySelector("span");
        if (label) {
            label.textContent = isSubmitting ? "Sending..." : "Send Message";
        }
    }

    contactForm.addEventListener("submit", async (e) => {
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
        showFormMessage("", "");

        try {
            const response = await fetch(apiBaseUrl + "/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success !== false) {
                showFormMessage(data.message || "Thank you! Your message has been sent.", "success");
                contactForm.reset();
            } else if (response.status === 429) {
                showFormMessage(data.message || "Too many messages sent recently. Please try again later.", "error");
            } else {
                showFormMessage(data.message || "Could not send message. Please try again.", "error");
            }
        } catch (err) {
            showFormMessage(
                "Unable to reach the server right now. Please try again in a moment, or email me directly.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    });
}


                      