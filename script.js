document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('hidden'), 500);
    });
    setTimeout(() => preloader.classList.add('hidden'), 3000);

    // Header scroll effect
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        header.classList.toggle('scrolled', scrollY > 50);
        backToTop.classList.toggle('visible', scrollY > 500);
    });

    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    let mobileMenu = null;
    let mobileOverlay = null;

    function createMobileMenu() {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        body.appendChild(mobileOverlay);

        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <ul class="nav-links">
                <li><a href="#home">Início</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#antes-depois">Antes e Depois</a></li>
                <li><a href="#galeria">Galeria</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
        `;
        body.appendChild(mobileMenu);

        mobileOverlay.addEventListener('click', closeMobileMenu);
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    function toggleMobileMenu() {
        if (!mobileMenu) createMobileMenu();
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    // Hero carousel
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentHeroSlide = 0;

    function nextHeroSlide() {
        heroSlides[currentHeroSlide].classList.remove('active');
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        heroSlides[currentHeroSlide].classList.add('active');
    }

    setInterval(nextHeroSlide, 5000);

    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        const statsSection = document.querySelector('.stats');
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            statsAnimated = true;
            statNumbers.forEach(num => {
                const target = parseInt(num.dataset.target);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const counter = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        num.textContent = target;
                        clearInterval(counter);
                    } else {
                        num.textContent = Math.floor(current);
                    }
                }, 16);
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats();

    // Service cards scroll animation
    const serviceCards = document.querySelectorAll('.service-card');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    serviceCards.forEach(card => observer.observe(card));

    // Gallery carousel - auto scroll infinite
    const galleryTrack = document.querySelector('.gallery-track');
    if (galleryTrack) {
        const items = galleryTrack.innerHTML;
        galleryTrack.innerHTML = items + items;
    }

    // Before/After carousel - auto scroll infinite
    const baTrack = document.querySelector('.ba-track');
    if (baTrack) {
        const items = baTrack.innerHTML;
        baTrack.innerHTML = items + items;
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    });

    // Parallax effect on scroll for sections
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });

    // Duplicate testimonials for infinite scroll
    const testimonialTrack = document.querySelector('.testimonial-track');
    if (testimonialTrack) {
        const cards = testimonialTrack.innerHTML;
        testimonialTrack.innerHTML = cards + cards;
    }

    // Before/After image swap (hover + auto interval)
    const swapElements = document.querySelectorAll('.ba-swap');
    const SWAP_INTERVAL = 4000;

    swapElements.forEach(el => {
        const img = el.querySelector('img');
        const imgDefault = el.dataset.imgDefault;
        const imgAlt = el.dataset.imgAlt;
        let showingAlt = false;
        let interval = null;

        function swapTo(src) {
            img.classList.add('fading');
            setTimeout(() => {
                img.src = src;
                img.classList.remove('fading');
            }, 300);
        }

        function toggle() {
            showingAlt = !showingAlt;
            swapTo(showingAlt ? imgAlt : imgDefault);
        }

        interval = setInterval(toggle, SWAP_INTERVAL);

        el.addEventListener('mouseenter', () => {
            clearInterval(interval);
            if (!showingAlt) {
                showingAlt = true;
                swapTo(imgAlt);
            }
        });

        el.addEventListener('mouseleave', () => {
            showingAlt = false;
            swapTo(imgDefault);
            interval = setInterval(toggle, SWAP_INTERVAL);
        });
    });
});
