document.addEventListener('DOMContentLoaded', () => {

    // 1. Logica Menu Hamburger
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.mobile-nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });

        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // 2. Animazione allo scroll
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-content, .hero-card, .countdown-card').forEach(section => {
        if(section) scrollObserver.observe(section);
    });

    // 3. Logica per il Carosello
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => {
        const slidesContainer = carousel.querySelector('.carousel-slides');
        const prevButton = carousel.querySelector('.carousel-prev');
        const nextButton = carousel.querySelector('.carousel-next');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');
        
        if (!slidesContainer || !prevButton || !nextButton || !indicatorsContainer) return;

        const slides = Array.from(slidesContainer.querySelectorAll('img.carousel-slide'));
        const slideCount = slides.length;
        if (slideCount === 0) return;
        
        let currentIndex = 0;

        // Crea indicatori
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < slideCount; i++) {
            const indicator = document.createElement('span');
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
        const indicators = Array.from(indicatorsContainer.children);

        function updateCarousel() {
            slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateCarousel();
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        });
        
        updateCarousel();
    });

    // 4. Zoom immagini carosello (con Event Delegation)
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    const slidesContainer = document.querySelector('.carousel-slides');

    if (zoomOverlay && slidesContainer) {
        const zoomedImg = zoomOverlay.querySelector('.zoomed-img');
        const zoomClose = zoomOverlay.querySelector('.zoom-close');
        const zoomReset = zoomOverlay.querySelector('.zoom-reset');

        let scale = 1;
        let lastScale = 1;
        let startX = 0, startY = 0, lastX = 0, lastY = 0;
        let isDragging = false;
        let lastTouchEnd = 0;

        function resetZoom() {
            scale = 1;
            lastScale = 1;
            lastX = 0;
            lastY = 0;
            zoomedImg.style.transform = '';
            zoomedImg.classList.remove('zoomed-in');
            if (zoomReset) zoomReset.style.opacity = 0.85;
        }

        if (zoomedImg && zoomClose) {
            // Event delegation per apertura overlay
            slidesContainer.addEventListener('click', function(event) {
                const clickedImage = event.target.closest('.carousel-slide');
                if (clickedImage) {
                    zoomedImg.src = clickedImage.src;
                    zoomOverlay.classList.add('active');
                    resetZoom();
                }
            });

            // Chiudi overlay
            zoomClose.addEventListener('click', () => {
                zoomOverlay.classList.remove('active');
                resetZoom();
            });
            zoomOverlay.addEventListener('click', (e) => {
                if (e.target === zoomOverlay) {
                    zoomOverlay.classList.remove('active');
                    resetZoom();
                }
            });

            // Doppio tap/click per zoommare avanti/indietro
            zoomedImg.addEventListener('dblclick', (e) => {
                e.preventDefault();
                if (scale === 1) {
                    scale = 2.2;
                    zoomedImg.classList.add('zoomed-in');
                } else {
                    scale = 1;
                    zoomedImg.classList.remove('zoomed-in');
                }
                lastX = lastY = 0;
                zoomedImg.style.transform = `scale(${scale})`;
            });
            // Doppio tap mobile
            zoomedImg.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (e.touches.length === 0 && now - lastTouchEnd < 300) {
                    if (scale === 1) {
                        scale = 2.2;
                        zoomedImg.classList.add('zoomed-in');
                    } else {
                        scale = 1;
                        zoomedImg.classList.remove('zoomed-in');
                    }
                    lastX = lastY = 0;
                    zoomedImg.style.transform = `scale(${scale})`;
                }
                lastTouchEnd = now;
            });

            // Pinch to zoom (mobile)
            let initialDistance = null;
            let initialScale = 1;
            zoomedImg.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    initialDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    initialScale = scale;
                } else if (e.touches.length === 1 && scale > 1) {
                    isDragging = true;
                    startX = e.touches[0].clientX - lastX;
                    startY = e.touches[0].clientY - lastY;
                }
            });
            zoomedImg.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2 && initialDistance) {
                    const newDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    let newScale = initialScale * (newDistance / initialDistance);
                    newScale = Math.max(1, Math.min(newScale, 4));
                    scale = newScale;
                    zoomedImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
                    if (scale > 1) zoomedImg.classList.add('zoomed-in');
                    else zoomedImg.classList.remove('zoomed-in');
                } else if (e.touches.length === 1 && isDragging && scale > 1) {
                    lastX = e.touches[0].clientX - startX;
                    lastY = e.touches[0].clientY - startY;
                    zoomedImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
                }
            });
            zoomedImg.addEventListener('touchend', (e) => {
                if (e.touches.length < 2) {
                    initialDistance = null;
                    initialScale = scale;
                    isDragging = false;
                }
            });

            // Drag per desktop
            zoomedImg.addEventListener('mousedown', (e) => {
                if (scale === 1) return;
                isDragging = true;
                startX = e.clientX - lastX;
                startY = e.clientY - lastY;
                zoomedImg.style.cursor = 'grabbing';
            });
            document.addEventListener('mousemove', (e) => {
                if (isDragging && scale > 1) {
                    lastX = e.clientX - startX;
                    lastY = e.clientY - startY;
                    zoomedImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
                }
            });
            document.addEventListener('mouseup', () => {
                isDragging = false;
                zoomedImg.style.cursor = scale > 1 ? 'grab' : '';
            });

            // Rotella mouse per zoom desktop
            zoomedImg.addEventListener('wheel', (e) => {
                e.preventDefault();
                let delta = e.deltaY < 0 ? 0.15 : -0.15;
                scale += delta;
                scale = Math.max(1, Math.min(scale, 4));
                zoomedImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
                if (scale > 1) zoomedImg.classList.add('zoomed-in');
                else zoomedImg.classList.remove('zoomed-in');
            });

            // Reset zoom
            if (zoomReset) {
                zoomReset.addEventListener('click', () => {
                    resetZoom();
                });
            }
        }
    }
    
    // Logica per mostrare il messaggio di successo del form
    const accessForm = document.getElementById('accessForm');
    if (accessForm) {
        accessForm.addEventListener('submit', function (e) {
            // Un piccolo timeout per dare tempo a Formspree di reindirizzare
            setTimeout(() => {
                const successMessage = document.getElementById('successMessage');
                if(successMessage) {
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        });
    }

    // Countdown Timer Logic è gestito da config-manager.js

    // Logica per i banner informativi mobile
    document.addEventListener('click', function(event) {
        const banner = event.target.closest('.info-banner');
        if (!banner) return;

        const closeButton = event.target.closest('.banner-close');
        
        // Sia che si clicchi sulla X o sul banner, si esegue la stessa azione:
        // si comprime/espande la notifica.
        // Se si vuole chiudere definitivamente si dovrà ricaricare la pagina
        banner.classList.toggle('minimized');
        
        // if (closeButton) {
        //     banner.style.opacity = '0';
        //     setTimeout(() => banner.remove(), 300);
        // } else {
        //     banner.classList.toggle('minimized');
        // }
    });
}); 
