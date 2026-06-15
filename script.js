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

        // Detecta caminho correto para index.html baseado na localização atual
        const path = window.location.pathname;
        let homePrefix = 'index.html';
        if (path.includes('/servicos/') || path.includes('/blog/')) {
            homePrefix = '../index.html';
        }

        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <ul class="nav-links">
                <li><a href="${homePrefix}#home">Início</a></li>
                <li><a href="${homePrefix}#servicos">Serviços</a></li>
                <li><a href="${homePrefix}#antes-depois">Antes e Depois</a></li>
                <li><a href="${homePrefix}#galeria">Galeria</a></li>
                <li><a href="${homePrefix}#sobre">Sobre</a></li>
                <li><a href="${homePrefix === 'index.html' ? 'faq.html' : (path.includes('/blog/') ? '../faq.html' : 'faq.html')}">FAQ</a></li>
                <li><a href="${homePrefix === 'index.html' ? 'blog/index.html' : (path.includes('/blog/') ? 'index.html' : '../blog/index.html')}">Blog</a></li>
                <li><a href="${homePrefix}#contato">Contato</a></li>
            </ul>
            <a href="https://wa.me/556241031439" class="btn btn-primary btn-neon mobile-cta" target="_blank" rel="noopener">
                <i class="fab fa-whatsapp"></i> Orçamento Grátis
            </a>
        `;
        body.appendChild(mobileMenu);

        mobileOverlay.addEventListener('click', closeMobileMenu);
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Notifica o whatsapp-tracking.js para reaplicar tracking
        document.dispatchEvent(new CustomEvent('mobileMenuCreated'));
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

    // Helper function to initialize interactive carousels with drag, swipe, arrows, and auto-scroll
    function initInteractiveCarousel(carouselSelector, prevBtnSelector, nextBtnSelector, speedMultiplier = 1) {
        const carousel = document.querySelector(carouselSelector);
        if (!carousel) return;
        const track = carousel.querySelector('div');
        if (!track) return;

        // Duplicate content for infinite scrolling loop
        const originalContent = track.innerHTML;
        track.innerHTML = originalContent + originalContent;

        let isDown = false;
        let startX;
        let scrollLeftVal;
        let isHovered = false;
        let isInteracting = false;
        let animationFrameId = null;
        let resumeTimeout = null;

        const baseSpeed = 1.0; // Increased base speed (originally ~0.5px equivalent per frame)
        const speed = baseSpeed * speedMultiplier;

        function getOriginalWidth() {
            return carousel.scrollWidth / 2;
        }

        // Smooth Auto scroll loop
        function autoScroll() {
            if (!isHovered && !isInteracting && !isDown) {
                const originalWidth = getOriginalWidth();
                carousel.scrollLeft += speed;

                if (carousel.scrollLeft >= originalWidth) {
                    carousel.scrollLeft -= originalWidth;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        }

        animationFrameId = requestAnimationFrame(autoScroll);

        carousel.addEventListener('mouseenter', () => { isHovered = true; });
        carousel.addEventListener('mouseleave', () => { isHovered = false; });

        function startInteracting() {
            isInteracting = true;
            if (resumeTimeout) clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => {
                isInteracting = false;
            }, 3000);
        }

        // Drag/Swipe Mouse Events
        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            isHovered = true;
            startInteracting();
            startX = e.pageX - carousel.offsetLeft;
            scrollLeftVal = carousel.scrollLeft;
            carousel.style.scrollBehavior = 'auto';
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                isHovered = false;
                carousel.style.scrollBehavior = 'smooth';
            }
        });

        carousel.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                carousel.style.scrollBehavior = 'smooth';
            }
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            let newScrollLeft = scrollLeftVal - walk;
            const originalWidth = getOriginalWidth();

            if (newScrollLeft >= originalWidth) {
                newScrollLeft -= originalWidth;
                scrollLeftVal -= originalWidth;
                startX = e.pageX - carousel.offsetLeft;
            } else if (newScrollLeft <= 0) {
                newScrollLeft += originalWidth;
                scrollLeftVal += originalWidth;
                startX = e.pageX - carousel.offsetLeft;
            }

            carousel.scrollLeft = newScrollLeft;
        });

        // Touch swipe events
        carousel.addEventListener('touchstart', (e) => {
            isDown = true;
            isHovered = true;
            startInteracting();
            startX = e.touches[0].pageX - carousel.offsetLeft;
            scrollLeftVal = carousel.scrollLeft;
            carousel.style.scrollBehavior = 'auto';
        });

        carousel.addEventListener('touchend', () => {
            isDown = false;
            isHovered = false;
            carousel.style.scrollBehavior = 'smooth';
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            let newScrollLeft = scrollLeftVal - walk;
            const originalWidth = getOriginalWidth();

            if (newScrollLeft >= originalWidth) {
                newScrollLeft -= originalWidth;
                scrollLeftVal -= originalWidth;
                startX = e.touches[0].pageX - carousel.offsetLeft;
            } else if (newScrollLeft <= 0) {
                newScrollLeft += originalWidth;
                scrollLeftVal += originalWidth;
                startX = e.touches[0].pageX - carousel.offsetLeft;
            }

            carousel.scrollLeft = newScrollLeft;
        });

        // Arrow Buttons
        const prevBtn = document.querySelector(prevBtnSelector);
        const nextBtn = document.querySelector(nextBtnSelector);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                startInteracting();
                carousel.style.scrollBehavior = 'smooth';
                const originalWidth = getOriginalWidth();
                
                if (carousel.scrollLeft <= 5) {
                    carousel.style.scrollBehavior = 'auto';
                    carousel.scrollLeft += originalWidth;
                    carousel.offsetHeight; // reflow
                    carousel.style.scrollBehavior = 'smooth';
                }
                carousel.scrollLeft -= 320;
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                startInteracting();
                carousel.style.scrollBehavior = 'smooth';
                const originalWidth = getOriginalWidth();

                carousel.scrollLeft += 320;

                setTimeout(() => {
                    if (carousel.scrollLeft >= originalWidth) {
                        carousel.style.scrollBehavior = 'auto';
                        carousel.scrollLeft -= originalWidth;
                    }
                }, 300);
            });
        }
    }

    // Initialize carousels with increased speed
    initInteractiveCarousel('.ba-carousel', '#ba-prev', '#ba-next', 1.8);
    initInteractiveCarousel('.gallery-carousel', '#gallery-prev', '#gallery-next', 1.8);
    initInteractiveCarousel('.testimonials-carousel', '#testimonials-prev', '#testimonials-next', 1.8);

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

    // Dynamic WhatsApp Link Customization for Google Ads and Site Tracking
    function customizeWhatsAppLinks() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Detect Google Ads traffic via UTM parameters, gclid, or referrer
        const isGoogleAds = (urlParams.has('utm_source') && urlParams.get('utm_source').toLowerCase() === 'google') || 
                            urlParams.has('gclid') || 
                            urlParams.has('utm_campaign') ||
                            document.referrer.includes('google.com');

        let message = "Olá! Gostaria de fazer um orçamento de gesso através do site.";
        if (isGoogleAds) {
            message = "Olá! Vi seu anúncio no Google e gostaria de fazer um orçamento de gesso.";
        }

        const encodedMessage = encodeURIComponent(message);
        const waLinks = document.querySelectorAll('a[href*="wa.me"]');
        
        waLinks.forEach(link => {
            const href = link.getAttribute('href');
            const baseUrl = href.split('?')[0];
            link.setAttribute('href', `${baseUrl}?text=${encodedMessage}`);
        });
    }
    
    customizeWhatsAppLinks();
});
