// Transizione fade-in/fade-out globale tra pagine semplificata
window.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        document.body.classList.add('fade-in');
        document.body.classList.remove('fade-transition');

        // Applica animazione pop alle card
        document.querySelectorAll('.glass-card').forEach(card => {
            card.classList.remove('pop-card'); // reset per navigazione
            // Forza reflow per ri-triggerare l'animazione
            void card.offsetWidth;
            card.classList.add('pop-card');
            // Rimuovi la classe dopo l'animazione per permettere il riutilizzo
            setTimeout(() => {
                card.classList.remove('pop-card');
            }, 450);
        });
    }, 10);

    // Gestione fade-out sui link della navbar
    const navLinks = document.querySelectorAll('.nav-links a');
    let isTransitioning = false;
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Solo click sinistro, senza ctrl/cmd/shift/alt e solo link interni
            if (
                e.button !== 0 ||
                e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
                link.target === '_blank' ||
                link.hasAttribute('download') ||
                link.href.startsWith('http') && !link.href.startsWith(window.location.origin)
            ) {
                return;
            }
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !link.classList.contains('btn') && !isTransitioning) {
                e.preventDefault();
                isTransitioning = true;
                document.body.classList.remove('fade-in');
                document.body.classList.add('fade-transition');
                setTimeout(() => {
                    window.location.href = href;
                }, 350);
            }
        });
    });
});

// Fix: se torno indietro/avanti nella cronologia, forzo sempre il fade-in
window.addEventListener('pageshow', function (event) {
    document.body.classList.add('fade-in');
    document.body.classList.remove('fade-transition');
}); 