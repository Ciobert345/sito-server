/**
 * Config Manager - Gestisce la configurazione del sito
 * Questo script carica il file config.json e applica le configurazioni al sito
 */

class ConfigManager {
    constructor() {
        this.config = null;
        this.initialized = false;
    }

    /**
     * Inizializza il config manager caricando il file di configurazione
     */
    async init() {
        try {
            const response = await fetch('/config.json');
            if (!response.ok) {
                throw new Error(`Errore nel caricamento della configurazione: ${response.status}`);
            }

            this.config = await response.json();
            this.initialized = true;
            console.log('Configurazione caricata con successo:', this.config);

            // Applica le configurazioni
            this.applyConfigurations();

            // Inizializza il countdown dopo aver applicato le configurazioni
            if (this.config.countdown && this.config.countdown.enabled) {
                this.initializeCountdown();
            }

            return true;
        } catch (error) {
            console.error('Errore durante l\'inizializzazione del ConfigManager:', error);
            return false;
        }
    }

    /**
     * Applica tutte le configurazioni al sito
     */
    applyConfigurations() {
        if (!this.initialized) {
            console.error('ConfigManager non inizializzato. Chiamare init() prima.');
            return;
        }

        // Applica le informazioni del sito
        this.applySiteInfo();

        // Applica la configurazione del countdown
        this.applyCountdown();

        // Applica la configurazione del banner di manutenzione
        this.applyMaintenanceBanner();

        // Applica i banner informativi
        this.applyInfoBanners();

        // Applica la configurazione del box Novità importanti
        this.applyUpdateNotice();

        // Applica i link di download
        this.applyDownloadLinks();

        // Applica i testi del sito
        this.applyTexts();
    }

    /**
     * Applica le informazioni di base del sito
     */
    applySiteInfo() {
        if (!this.config.siteInfo) return;

        // Imposta il titolo della pagina
        if (this.config.siteInfo.title) {
            document.title = this.config.siteInfo.title;
        }

        // Imposta la descrizione della pagina
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && this.config.siteInfo.description) {
            metaDescription.setAttribute('content', this.config.siteInfo.description);
        }
    }

    /**
     * Applica la configurazione del countdown
     */
    applyCountdown() {
        if (!this.config.countdown) return;

        // Verifica se il countdown è abilitato
        if (!this.config.countdown.enabled) {
            const countdownElement = document.getElementById('countdown');
            const countdownTitleElement = document.getElementById('countdown-title');

            if (countdownElement) countdownElement.style.display = 'none';
            if (countdownTitleElement) countdownTitleElement.style.display = 'none';

            // Imposta la variabile globale per indicare che il countdown è disabilitato
            window.globalCountdownDisabled = true;

            // Verifica se il banner di manutenzione deve essere mostrato
            this.checkMaintenanceBanner();
            return;
        } else {
            window.globalCountdownDisabled = false;
        }

        // Aggiorna la data del countdown
        if (this.config.countdown.date) {
            // Imposta la variabile globale countdownDateString
            window.countdownDateString = this.config.countdown.date;
            console.log('Data del countdown aggiornata:', this.config.countdown.date);

            // Riavvia il countdown se è già stato inizializzato
            if (window.globalCountdownInterval) {
                clearInterval(window.globalCountdownInterval);
                window.globalCountdownInterval = null;
                window.globalCountdownExpired = false;

                // Richiama la funzione di inizializzazione del countdown
                this.initializeCountdown();
            }
        }

        // Aggiorna il titolo del countdown
        if (this.config.countdown.title) {
            const countdownTitleElement = document.getElementById('countdown-title');
            if (countdownTitleElement) {
                // countdownTitleElement.textContent = this.config.countdown.title;
            }
        }

        // Aggiorna il messaggio di countdown scaduto
        if (this.config.countdown.expiredMessage) {
            const countdownCompleteElement = document.getElementById('countdown-complete');
            if (countdownCompleteElement) {
                const messageElement = countdownCompleteElement.querySelector('h2');
                if (messageElement) {
                    messageElement.textContent = this.config.countdown.expiredMessage;
                }
            }
        }
    }

    /**
     * Applica la configurazione del banner di manutenzione
     * Nota: Funzione mantenuta per compatibilità ma disabilitata
     */
    applyMaintenanceBanner() {
        // Banner di manutenzione rimosso dalla configurazione
        const maintenanceWarning = document.getElementById('maintenance-warning');
        if (maintenanceWarning) {
            maintenanceWarning.style.display = 'none';
        }
    }

    /**
     * Verifica se il banner di manutenzione deve essere mostrato
     * Mostra il banner quando mancano meno di 2 ore al countdown
     */
    checkMaintenanceBanner() {
        const maintenanceWarning = document.getElementById('maintenance-warning');
        const countdownContainerEl = document.getElementById('countdown');
        const anchor = document.getElementById('countdown-anchor');
        const maintenanceTitle = maintenanceWarning ? maintenanceWarning.querySelector('.maintenance-title') : null;

        // Verifica se mancano meno di 2 ore al countdown
        if (window.countdownDateString) {
            const countdownDate = new Date(window.countdownDateString).getTime();
            const now = new Date().getTime();
            const distance = countdownDate - now;
            const hoursLeft = Math.floor(distance / (1000 * 60 * 60));

            // Se mancano meno di 2 ore, mostra il banner di manutenzione
            if (distance > 0 && hoursLeft < 2) {
                if (maintenanceWarning) {
                    maintenanceWarning.style.display = 'block';

                    // Aggiorna il titolo del banner se necessario
                    if (maintenanceTitle) {
                        maintenanceTitle.textContent = '🚧 Il server è in manutenzione 🚧';
                    }

                    // Sposta il countdown all'interno del banner
                    const maintenanceCountdownSlot = document.getElementById('maintenance-countdown-slot');
                    if (maintenanceCountdownSlot && countdownContainerEl) {
                        maintenanceCountdownSlot.appendChild(countdownContainerEl);
                    }
                }
                return;
            }
        }

        // Se non ci sono le condizioni per mostrare il banner, nascondilo
        if (maintenanceWarning) {
            maintenanceWarning.style.display = 'none';
        }

        // Assicuriamoci che il countdown sia nel posto giusto
        if (countdownContainerEl && anchor && anchor.parentNode && anchor.nextSibling !== countdownContainerEl) {
            anchor.parentNode.insertBefore(countdownContainerEl, anchor.nextSibling);
        }
    }

    /**
     * Applica la configurazione del box Novità importanti
     */
    applyUpdateNotice() {
        const cfg = this.config.updateNotice;
        const box = document.getElementById('update-notice-box');
        if (!cfg || !box) return;

        // Abilita/disabilita tutto il box
        box.style.display = cfg.enabled ? 'block' : 'none';
        if (!cfg.enabled) return;

        // Titolo principale
        const h3 = box.querySelector('.update-notice-title');
        if (h3 && cfg.title) {
            h3.textContent = cfg.title;
        }

        // Sottotitolo
        const h4 = box.querySelector('.update-notice-subtitle');
        if (h4) {
            if (cfg.subtitle) {
                h4.innerHTML = cfg.subtitle;
                h4.style.display = '';
            } else {
                h4.style.display = 'none';
            }
        }

        // Badge
        const badge = box.querySelector('#update-badge');
        if (badge) {
            if (cfg.showBadge) {
                badge.textContent = cfg.badgeText || '';
                badge.style.display = cfg.badgeText ? 'inline-block' : 'none';
            } else {
                badge.style.display = 'none';
            }
        }

        // Lista features
        const featuresContainer = box.querySelector('.update-notice-features');
        if (featuresContainer) {
            featuresContainer.innerHTML = '';  // pulisci
            if (Array.isArray(cfg.features)) {
                cfg.features.forEach(htmlText => {
                    const div = document.createElement('div');
                    div.className = 'feature';
                    div.innerHTML = `
                    <span class="feature-icon">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="var(--accent)" stroke-width="3" stroke-linecap="round">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    <span class="feature-text">${htmlText}</span>
                `;
                    featuresContainer.appendChild(div);
                });
            }
        }
    }


    /**
     * Applica i banner informativi
     */
    applyInfoBanners() {
        if (!this.config.infoBanners || !this.config.infoBanners.length) return;

        const bannerContainer = document.getElementById('info-banners');
        if (!bannerContainer) return;

        // Rimuovi tutti i banner esistenti
        bannerContainer.innerHTML = '';

        // Aggiungi i banner abilitati
        this.config.infoBanners.forEach(banner => {
            if (!banner.enabled) return;

            // Rileva se siamo sulla pagina mobile
            const isMobilePage = document.querySelector('.hero-content-wrapper') !== null;
            
            const bannerElement = document.createElement('div');
            bannerElement.className = `info-banner ${banner.style || 'default'}`;
            bannerElement.id = banner.id;
            
            if(isMobilePage) {
                // STRUTTURA PER MOBILE: Semplice, senza icona e sempre minimizzata di default
                bannerElement.classList.add('minimized'); // Parte sempre minimizzato
                bannerElement.innerHTML = `
                    <div class="banner-content">
                        <h4>${banner.title}</h4>
                        <p>${banner.message}</p>
                    </div>
                    <button class="banner-close" aria-label="Chiudi notifica"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                `;
            } else {
                // STRUTTURA PER DESKTOP (originale)
                bannerElement.classList.add('minimized', 'never-opened');
                bannerElement.setAttribute('tabindex', '0');
                bannerElement.setAttribute('role', 'button');
                bannerElement.setAttribute('aria-expanded', 'false');
                bannerElement.setAttribute('aria-label', banner.title);

                let iconSvg = '';
                switch (banner.icon) {
                    case 'notification':
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><circle cx="12" cy="4" r="2"></circle></svg>';
                        break;
                    case 'event':
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                        break;
                    default:
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                }

                bannerElement.innerHTML = `
                    <div class="banner-icon">${iconSvg}</div>
                    <div class="banner-content" style="display:none">
                        <h4 class="banner-title">
                            <span class="banner-highlight">${banner.title}</span> ${banner.subtitle || ''}
                        </h4>
                        <p class="banner-message">${banner.message}</p>
                        <button class="banner-close" aria-label="Riduci notifica" title="Riduci">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                `;

                const iconDiv = bannerElement.querySelector('.banner-icon');
                const contentDiv = bannerElement.querySelector('.banner-content');
                if (bannerElement.classList.contains('never-opened')) {
                    iconDiv.classList.add('pulse-anim');
                }
                iconDiv.addEventListener('click', e => {
                    if (bannerElement.classList.contains('minimized')) {
                        bannerElement.classList.remove('minimized', 'never-opened');
                        iconDiv.classList.remove('pulse-anim');
                        bannerElement.setAttribute('aria-expanded', 'true');
                        contentDiv.style.display = '';
                    }
                });
                contentDiv.querySelector('.banner-close').addEventListener('click', e => {
                    e.stopPropagation();
                    bannerElement.classList.add('minimized');
                    contentDiv.style.display = 'none';
                });
            }

            // Aggiungi il banner al container
            bannerContainer.appendChild(bannerElement);
        });
    }

    /**
     * Applica i testi del sito
     * Nota: La sezione "texts" è stata rimossa dal config.json
     */
    applyTexts() {
        // La sezione "texts" è stata rimossa dal config.json
        // Questa funzione è mantenuta per compatibilità ma non fa nulla
        console.log('[ConfigManager] La sezione "texts" è stata rimossa dal config.json');
        return;
    }

    /**
     * Applica i testi della home page
     */
    applyHomeTexts(texts) {
        // Hero section
        if (texts.hero) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroDescription = document.querySelector('.hero-description');

            if (heroTitle && texts.hero.title) heroTitle.textContent = texts.hero.title;
            if (heroSubtitle && texts.hero.subtitle) heroSubtitle.textContent = texts.hero.subtitle;
            if (heroDescription && texts.hero.description) heroDescription.textContent = texts.hero.description;
        }

        // Features section
        if (texts.features && texts.features.length) {
            const featureElements = document.querySelectorAll('.feature');

            texts.features.forEach((feature, index) => {
                if (index < featureElements.length) {
                    const titleElement = featureElements[index].querySelector('.feature-title');
                    const descriptionElement = featureElements[index].querySelector('.feature-description');

                    if (titleElement && feature.title) titleElement.textContent = feature.title;
                    if (descriptionElement && feature.description) descriptionElement.textContent = feature.description;
                }
            });
        }

        // Join section
        if (texts.joinSection) {
            const joinTitle = document.querySelector('.join-title');
            const joinSteps = document.querySelectorAll('.join-step');

            if (joinTitle && texts.joinSection.title) joinTitle.textContent = texts.joinSection.title;

            if (texts.joinSection.steps && texts.joinSection.steps.length) {
                texts.joinSection.steps.forEach((step, index) => {
                    if (index < joinSteps.length) {
                        joinSteps[index].textContent = step;
                    }
                });
            }
        }
    }

    /**
     * Applica i testi della pagina updates
     */
    applyUpdatesTexts(texts) {
        // Title and description
        const updatesTitle = document.querySelector('.updates-title');
        const updatesDescription = document.querySelector('.updates-description');

        if (updatesTitle && texts.title) updatesTitle.textContent = texts.title;
        if (updatesDescription && texts.description) updatesDescription.textContent = texts.description;

        // Updates list
        if (texts.updates && texts.updates.length) {
            const updatesContainer = document.querySelector('.updates-list');
            if (!updatesContainer) return;

            // Rimuovi gli aggiornamenti esistenti
            updatesContainer.innerHTML = '';

            // Aggiungi gli aggiornamenti dal config
            texts.updates.forEach(update => {
                const updateElement = document.createElement('div');
                updateElement.className = 'update-item';

                updateElement.innerHTML = `
                    <div class="update-date">${update.date}</div>
                    <h3 class="update-title">${update.title}</h3>
                    <p class="update-description">${update.description}</p>
                `;

                updatesContainer.appendChild(updateElement);
            });
        }
    }

    /**
     * Determina la pagina corrente in base all'URL
     */
    getCurrentPage() {
        const path = window.location.pathname;

        if (path.endsWith('index.html') || path === '/' || path === '') {
            return 'home';
        } else if (path.endsWith('updates.html')) {
            return 'updates';
        }

        // Estrai il nome del file dall'URL
        const pageName = path.split('/').pop().split('.')[0];
        return pageName || 'home';
    }

    /**
     * Inizializza il countdown con la data corrente
     */
    initializeCountdown() {
        if (!window.countdownDateString) return;

        console.log('[ConfigManager] Inizializzazione countdown con data:', window.countdownDateString);

        const countdownDate = new Date(window.countdownDateString).getTime();
        const countdownTitleEl = document.getElementById("countdown-title");
        const countdownContainerEl = document.getElementById("countdown");
        const countdownCompleteSectionEl = document.getElementById("countdown-complete");
        const daysEl = document.getElementById("countdown-days");
        const hoursEl = document.getElementById("countdown-hours");
        const minutesEl = document.getElementById("countdown-minutes");
        const secondsEl = document.getElementById("countdown-seconds");

        // Elementi per la versione mobile
        const heroContentWrapper = document.querySelector('.hero-content-wrapper');
        const countdownCompleteCard = document.getElementById('countdown-complete-card');

        // Funzione per aggiornare il countdown
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            // Verifica se il banner di manutenzione deve essere mostrato
            this.checkMaintenanceBanner();

            // Verifica se il countdown è scaduto
            if (distance < 0) {
                if (window.globalCountdownInterval) {
                    clearInterval(window.globalCountdownInterval);
                    window.globalCountdownInterval = null;
                }

                if (!window.globalCountdownExpired) {
                    window.globalCountdownExpired = true;

                    // Verifica se siamo sulla pagina mobile
                    const isMobilePage = document.querySelector('.hero-content-wrapper') !== null;

                    if (isMobilePage) {
                        // Logica per la pagina mobile
                        const countdownCard = document.querySelector('.countdown-card');
                        const countdownCompleteCard = document.getElementById('countdown-complete-card');
                        
                        if (countdownCard) countdownCard.style.display = 'none';
                        if (countdownCompleteCard) {
                            countdownCompleteCard.style.display = 'block';
                            // Attiva l'animazione di comparsa
                            setTimeout(() => countdownCompleteCard.classList.add('is-visible'), 50);
                        }

                    } else {
                        // Logica per la pagina desktop (originale)
                        const countdownTitleEl = document.getElementById("countdown-title");
                        const countdownContainerEl = document.getElementById("countdown");
                        const countdownCompleteSectionEl = document.getElementById("countdown-complete");

                        if (countdownTitleEl) countdownTitleEl.style.display = "none";
                        if (countdownContainerEl) countdownContainerEl.style.display = "none";
                        if (countdownCompleteSectionEl) {
                             countdownCompleteSectionEl.style.display = 'block';
                             setTimeout(() => countdownCompleteSectionEl.classList.add('visible'), 50);
                        }
                    }
                }
                return;
            }

            // Calcola giorni, ore, minuti, secondi
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Aggiorna gli elementi del countdown
            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

            // Logica per il cambio di stile in prossimità della scadenza (versione mobile)
            const countdownCard = document.querySelector('.countdown-card');
            const countdownTitleEl = document.getElementById('countdown-title');
            
            if (countdownCard && countdownTitleEl) {
                // Attiva la modalità manutenzione se mancano 2 ore o meno
                if (distance <= (2 * 60 * 60 * 1000)) { 
                    countdownCard.classList.add('maintenance-warning');
                    countdownTitleEl.innerText = "🚧 Il server è in manutenzione 🚧";
                } else {
                    countdownCard.classList.remove('maintenance-warning');
                    if (countdownTitleEl.innerText !== "L'aggiornamento arriverà tra") {
                       countdownTitleEl.innerText = "L'aggiornamento arriverà tra";
                    }
                }
            }
        };

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Chiamata iniziale per impostare subito i valori
    }

    applyDownloadLinks() {
        if (!this.config.downloadLinks) return;

        // Aggiorna i link per CurseForge
        if (this.config.downloadLinks.curseforge) {
            // Link del modpack
            const curseforgeBtns = document.querySelectorAll('.download-option:nth-child(1) .btn');
            curseforgeBtns.forEach(btn => {
                if (this.config.downloadLinks.curseforge.modpack) {
                    btn.href = this.config.downloadLinks.curseforge.modpack;
                }
            });

            // Link del launcher
            const curseforgeLinks = document.querySelectorAll('.download-option:nth-child(1) a[href*="curseforge.com"]');
            curseforgeLinks.forEach(link => {
                if (this.config.downloadLinks.curseforge.launcher) {
                    link.href = this.config.downloadLinks.curseforge.launcher;
                }
            });
        }

        // Aggiorna i link per Modrinth
        if (this.config.downloadLinks.modrinth) {
            // Link del modpack
            const modrinthBtns = document.querySelectorAll('.download-option:nth-child(2) .btn');
            modrinthBtns.forEach(btn => {
                if (this.config.downloadLinks.modrinth.modpack) {
                    btn.href = this.config.downloadLinks.modrinth.modpack;
                }
            });

            // Link del launcher
            const modrinthLinks = document.querySelectorAll('.download-option:nth-child(2) a[href*="modrinth.com"]');
            modrinthLinks.forEach(link => {
                if (this.config.downloadLinks.modrinth.launcher) {
                    link.href = this.config.downloadLinks.modrinth.launcher;
                }
            });
        }

        // Aggiorna i link per SKLauncher
        if (this.config.downloadLinks.sklauncher) {
            // Link del modpack
            const sklauncherBtns = document.querySelectorAll('.download-option:nth-child(3) .btn');
            sklauncherBtns.forEach(btn => {
                if (this.config.downloadLinks.sklauncher.modpack) {
                    btn.href = this.config.downloadLinks.sklauncher.modpack;
                }
            });

            // Link del launcher
            const sklauncherLinks = document.querySelectorAll('.download-option:nth-child(3) a[href*="skmedix.pl"]');
            sklauncherLinks.forEach(link => {
                if (this.config.downloadLinks.sklauncher.launcher) {
                    link.href = this.config.downloadLinks.sklauncher.launcher;
                }
            });
        }

        // Aggiorna il link per l'aggiornamento del modpack
        if (this.config.downloadLinks.update && this.config.downloadLinks.update.latest) {
            // Aggiorna tutti i pulsanti di aggiornamento nella pagina
            const updateBtns = document.querySelectorAll('.update-image-container .btn');
            updateBtns.forEach(btn => {
                btn.href = this.config.downloadLinks.update.latest;
            });

            // Aggiorna il pulsante con ID specifico
            const updateBtn = document.getElementById('update-download-btn');
            if (updateBtn) {
                updateBtn.href = this.config.downloadLinks.update.latest;
            }

            // Cerca anche i pulsanti con il testo "SCARICA AGGIORNAMENTO"
            document.querySelectorAll('a').forEach(link => {
                if (link.textContent.trim() === 'SCARICA AGGIORNAMENTO') {
                    link.href = this.config.downloadLinks.update.latest;
                }
            });
        }
    }
}

// Inizializza il ConfigManager quando il documento è pronto
document.addEventListener('DOMContentLoaded', () => {
    const configManager = new ConfigManager();
    configManager.init().then(success => {
        if (success) {
            console.log('ConfigManager inizializzato con successo');
        } else {
            console.error('Errore durante l\'inizializzazione del ConfigManager');
        }
    });
});

/**
 * Applica i link di download dal config.json
 */
