  document.addEventListener('DOMContentLoaded', () => {
      // 1. Background Particles
      const bg = document.getElementById('molecules-bg');
      for(let i=0; i<15; i++) {
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.width = (Math.random() * 5 + 2) + 'px';
        dot.style.height = dot.style.width;
        dot.style.background = 'var(--text-secondary)';
        dot.style.borderRadius = '50%';
        dot.style.opacity = '0.2';
        dot.style.animation = `float ${10 + Math.random() * 10}s infinite linear`;
        bg.appendChild(dot);
      }

      // 2. Theme Toggle
      const themeBtn = document.getElementById('theme-toggle');
      const html = document.documentElement;
      const savedTheme = localStorage.getItem('theme') || 'dark';
      
      html.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

      themeBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
      });

      function updateThemeIcon(t) {
        themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      }

      // 3. Data Injection
      const skills = [
        { name: 'Java (Core & Adv)', level: 90, icon: 'fa-coffee' },
        { name: 'Spring Boot', level: 40, icon: 'fa-leaf' },
        { name: 'MySQL', level: 80, icon: 'fa-database' },
        { name: 'JavaScript / React', level: 60, icon: 'fab fa-js' },
        { name: 'HTML5 / CSS3', level: 60, icon: 'fab fa-html5' },
        { name: 'Git & GitHub', level: 70, icon: 'fab fa-github' }
      ];
      
      const projects = [
        { title: 'Smart Campus AI Agent', cat: 'ai', desc: 'Voice-activated assistant delivering real-time campus information and navigation support.', tags: ['HTML/CSS', 'N8N', 'Java Script'] },
        { title: 'CoffeeHouse Website ', cat: 'Web', desc: 'Responsive website for a coffee shop with menu browsing, ordering, and dynamic UI effects.', tags: ['HTML', 'CSS', 'JS','NODE JS'] },
        { title: 'Spotify Clone Website', cat: 'web',      desc: 'Interactive music streaming interface mimicking Spotify s playlist and playback features enrolled.', tags: ['HTML', 'CSS', 'JS'] },
        { title: 'Eco-Friendly Website', cat: 'web', desc: 'Engaging site promoting sustainability initiatives with animations and eco-tips.', tags: ['HTML', 'CSS', 'JS'] },
        { title: 'Chatting Website', cat: 'web', desc: 'Real-time chat application enabling user-to-user messaging with HTML/CSS/JS.', tags: ['HTML/CSS', 'JS'] },
        { title: 'SafeShe Website', cat: 'web', desc: 'Safety-focused platform for women, featuring emergency alerts and resource links.', tags: ['JavaScript', 'HTML/CSS'] },
        { title: 'Billing Machine System', cat: 'ai', desc: ' Java Swing-based desktop app for generating invoices and managing sales transactions.', tags: ['Java + SWING'] },
        { title: 'Bank Management System', cat: 'ai', desc: 'Comprehensive Java application handling account operations, transactions, and customer data.', tags: ['Java + Swing', 'MySQL',] }
      ];

      // Render Skills (Updated to remove percentage)
      const sCont = document.getElementById('skills-container');
      skills.forEach(s => {
        const div = document.createElement('div');
        // Using 'simple' class for clean look without bars
        div.className = 'skill-card-simple'; 
        div.innerHTML = `
          <div class="skill-icon"><i class="${s.icon.includes('fab') ? s.icon : 'fas ' + s.icon}"></i></div>
          <div class="skill-name">${s.name}</div>
        `;
        sCont.appendChild(div);
      });

      // Render Projects
      const pCont = document.getElementById('projects-container');
      function renderProjects(f) {
        pCont.innerHTML = '';
        projects.filter(p => f === 'all' ? true : p.cat === f).forEach(p => {
          const div = document.createElement('div');
          div.className = 'card project-card';
          div.innerHTML = `
            <h3>${p.title}</h3>
            <p style="margin:0.5rem 0 1rem;">${p.desc}</p>
            <div class="project-tags">
              ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>`;
          pCont.appendChild(div);
        });
      }
      renderProjects('all');

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.addEventListener('click', e => {
          document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
          e.target.classList.add('active');
          renderProjects(e.target.dataset.filter);
        });
      });

      // 5. Interactions
      const menuToggle = document.getElementById('menu-toggle');
      const navLinks = document.querySelector('.nav-links');
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.querySelector('i').className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      });
      document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').className = 'fas fa-bars';
      }));

      const form = document.getElementById('contact-form');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        setTimeout(() => {
          const toast = document.getElementById('toast');
          toast.classList.add('show');
          form.reset();
          btn.innerHTML = orig;
          btn.disabled = false;
          setTimeout(() => toast.classList.remove('show'), 3000);
        }, 1500);
      });

      // Scroll Animation
      const obs = new IntersectionObserver((es) => {
        es.forEach(e => {
          if(e.isIntersecting) {
            e.target.style.opacity = 1;
            e.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.card, .section-title, .gallery-item, .about-img, .about-text, .skill-card-simple').forEach(el => {
        el.style.opacity = 0; el.style.transform = 'translateY(20px)'; el.style.transition = 'all 0.6s ease-out';
        obs.observe(el);
      });
    });

    
const lightbox = document.getElementById('lightbox');
const lightboxClose = '<span class="lightbox-close">&times;</span>';

// 1. Function for Images
function openLightbox(src) {
  lightbox.innerHTML = `<img class="lightbox-content" id="lightbox-img" src="${src}" alt="Full view">` + lightboxClose;
  lightbox.classList.add('active');
  attachCloseListener();
}

// Helper to close
function attachCloseListener() {
  const closeBtn = lightbox.querySelector('.lightbox-close');
  closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.onclick = (e) => {
    if(e.target === lightbox) lightbox.classList.remove('active');
  };
}
  