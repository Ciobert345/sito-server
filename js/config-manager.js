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
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`Errore nel caricamento della configurazione: ${response.status}`);
            }

            this.config = await response.json();
            this.initialized = true;
            console.log('Configurazione caricata con successo:', this.config);

            // Controllo immediato: se il countdown è già scaduto, nascondi subito la sezione Novità importanti
            if (this.config.countdown && this.config.countdown.enabled && this.config.countdown.date) {
                const now = new Date().getTime();
                const countdownDate = new Date(this.config.countdown.date).getTime();
                if (now > countdownDate) {
                    const updateNoticeBox = document.getElementById('update-notice-box');
                    if (updateNoticeBox) updateNoticeBox.style.display = 'none';
                }
            }

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

        // Se GitHub è configurato, salta applyDownloadLinks e carica direttamente da GitHub
        const hasGitHub = this.config.github && 
                         this.config.github.repository && 
                         this.config.github.repository !== 'NOMEUTENTE/NOMEREPO';

        if (hasGitHub) {
            // PRIMA abilita i link con fallback dal config (così non rimangono bloccati)
            // POI carica da GitHub e aggiorna con gli URL più recenti
            this.enableDownloadLinksFromConfig();
            // Carica e applica i dati dalla release GitHub (questo aggiornerà anche i link)
            this.loadGitHubRelease();
        } else {
            // Applica i link di download dal config solo se GitHub non è configurato
            this.applyDownloadLinks();
        }

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
        console.log('[DEBUG] applyUpdateNotice chiamata', window.ConfigManager && window.ConfigManager.config && window.ConfigManager.config.countdown);
        // Nascondi subito la sezione se il countdown è già scaduto
        if (window.ConfigManager && window.ConfigManager.config && window.ConfigManager.config.countdown) {
            const cfg = window.ConfigManager.config.countdown;
            if (cfg.enabled && cfg.date) {
                const now = new Date().getTime();
                const countdownDate = new Date(cfg.date).getTime();
                if (now > countdownDate) {
                    console.log('[DEBUG] Countdown scaduto, nascondo box novità');
                    const box = document.getElementById('update-notice-box');
                    if (box) box.style.display = 'none';
                }
            }
        }
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
        console.log('[DEBUG] initializeCountdown chiamata', window.countdownDateString);
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

                    // Nascondi la sezione Novità importanti
                    const updateNoticeBox = document.getElementById('update-notice-box');
                    console.log('DEBUG: Countdown scaduto, provo a nascondere update-notice-box', updateNoticeBox);
                    if (updateNoticeBox) updateNoticeBox.style.display = 'none';

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

    /**
     * Carica l'ultima release da GitHub e popola la sezione
     */
    async loadGitHubRelease() {
        if (!this.config.github || !this.config.github.repository) {
            console.warn('[ConfigManager] Repository GitHub non configurato');
            this.showGitHubError();
            return;
        }

        // TODO: inserisci qui nome repo (formato: NOMEUTENTE/NOMEREPO)
        const repo = this.config.github.repository;
        
        // Verifica che il repository non sia il placeholder
        if (repo === 'NOMEUTENTE/NOMEREPO') {
            console.warn('[ConfigManager] Repository GitHub non configurato correttamente');
            this.showGitHubError();
            return;
        }

        const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('[ConfigManager] Nessuna release trovata');
                    this.showGitHubError();
                } else {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }
                // Non fare return, continua per abilitare i link con fallback
                return;
            }

            const release = await response.json();

            // Verifica che ci siano i dati necessari
            if (!release.tag_name || !release.assets || release.assets.length === 0) {
                console.warn('[ConfigManager] Release senza dati completi');
                this.showGitHubError();
                // Non fare return, continua per abilitare i link con fallback
                return;
            }

            // Trova gli asset .zip e .mrpack
            let zipUrl = null;
            let mrpackUrl = null;
            
            release.assets.forEach(asset => {
                const name = asset.name.toLowerCase();
                if (name.endsWith('.zip') && !zipUrl) {
                    zipUrl = asset.browser_download_url;
                } else if (name.endsWith('.mrpack') && !mrpackUrl) {
                    mrpackUrl = asset.browser_download_url;
                }
            });

            // Se non troviamo .zip, usa il primo asset disponibile come fallback
            if (!zipUrl && release.assets.length > 0) {
                zipUrl = release.assets[0].browser_download_url;
            }

            if (!zipUrl) {
                console.warn('[ConfigManager] Nessun asset disponibile per il download');
                this.showGitHubError();
                return; // showGitHubError già abilita i link con fallback
            }

            // Popola la sezione con i dati della release (usa .zip per il pulsante principale)
            this.populateGitHubRelease({
                version: release.tag_name,
                changelog: release.body || 'Nessun changelog disponibile',
                downloadUrl: zipUrl
            });

            // Aggiorna i link di download esistenti con i formati corretti
            // Chiama immediatamente (la funzione ha già un sistema di retry interno)
            this.updateDownloadLinksFromGitHub(zipUrl, mrpackUrl);

        } catch (error) {
            console.error('[ConfigManager] Errore nel caricamento della release GitHub:', error);
            this.showGitHubError();
        }
    }

    /**
     * Popola la sezione HTML con i dati della release
     */
    populateGitHubRelease(data) {
        const loadingEl = document.getElementById('github-loading');
        const errorEl = document.getElementById('github-error');
        const infoEl = document.getElementById('github-release-info');
        const versionEl = document.getElementById('version-tag');
        const changelogEl = document.getElementById('changelog-content');
        const downloadBtn = document.getElementById('github-download-btn');

        // Nascondi loading ed error
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

        // Mostra le informazioni
        if (infoEl) {
            infoEl.style.display = 'block';
            
            // Versione
            if (versionEl) {
                versionEl.textContent = data.version;
            }

            // Changelog - converti markdown base in HTML semplice
            if (changelogEl) {
                let changelogText = data.changelog;
                // Rimuovi markdown base e converti in testo formattato
                changelogText = changelogText
                    .replace(/###\s+(.+)/g, '<strong>$1</strong>')
                    .replace(/##\s+(.+)/g, '<strong>$1</strong>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/`(.+?)`/g, '<code style="background: rgba(255, 255, 255, 0.15); padding: 2px 6px; border-radius: 4px;">$1</code>');
                
                changelogEl.innerHTML = changelogText;
            }

            // Link download
            if (downloadBtn) {
                downloadBtn.href = data.downloadUrl;
            }
        }
    }

    /**
     * Mostra il messaggio di errore
     */
    showGitHubError() {
        const loadingEl = document.getElementById('github-loading');
        const errorEl = document.getElementById('github-error');
        const infoEl = document.getElementById('github-release-info');

        if (loadingEl) loadingEl.style.display = 'none';
        if (infoEl) infoEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
        
        // Anche in caso di errore, abilita i link usando i valori dal config come fallback
        this.enableDownloadLinksFromConfig();
    }
    
    /**
     * Abilita i link di download usando i valori dal config come fallback
     */
    enableDownloadLinksFromConfig() {
        if (!this.config.downloadLinks) {
            console.warn('[ConfigManager] Nessun downloadLinks nel config, non posso abilitare i link');
            return;
        }
        
        // Funzione helper con retry
        const enableLinks = (retryCount = 0) => {
            const maxRetries = 5;
            const downloadBtns = document.querySelectorAll('.download-modpack-btn');
            console.log('[ConfigManager] Abilitazione link da config (fallback):', downloadBtns.length, 'pulsanti trovati (tentativo', retryCount + 1, ')');
            
            // Se non trova i link e non abbiamo raggiunto il limite di retry, riprova
            if (downloadBtns.length === 0 && retryCount < maxRetries) {
                console.log('[ConfigManager] Link non trovati per fallback, riprovo tra 100ms...');
                setTimeout(() => enableLinks(retryCount + 1), 100);
                return;
            }
            
            if (downloadBtns.length === 0) {
                console.warn('[ConfigManager] Link non trovati dopo', maxRetries, 'tentativi per fallback');
                return;
            }
        
            downloadBtns.forEach((btn, index) => {
                const format = btn.getAttribute('data-format');
                let fallbackUrl = null;
                
                // Cerca l'URL di fallback nel config
                if (format === 'mrpack' && this.config.downloadLinks.modrinth && this.config.downloadLinks.modrinth.modpack) {
                    fallbackUrl = this.config.downloadLinks.modrinth.modpack;
                } else if (format === 'zip') {
                    // Per zip, prova prima CurseForge, poi SKLauncher
                    if (this.config.downloadLinks.curseforge && this.config.downloadLinks.curseforge.modpack) {
                        fallbackUrl = this.config.downloadLinks.curseforge.modpack;
                    } else if (this.config.downloadLinks.sklauncher && this.config.downloadLinks.sklauncher.modpack) {
                        fallbackUrl = this.config.downloadLinks.sklauncher.modpack;
                    } else if (this.config.downloadLinks.update && this.config.downloadLinks.update.latest) {
                        fallbackUrl = this.config.downloadLinks.update.latest;
                    }
                }
                
                if (fallbackUrl) {
                    btn.href = fallbackUrl;
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.onclick = function(e) { return true; };
                    btn.removeAttribute('onclick');
                    console.log(`[ConfigManager] Link ${index + 1} abilitato con fallback:`, fallbackUrl);
                } else {
                    console.warn(`[ConfigManager] Nessun fallback disponibile per pulsante ${index + 1} (format: ${format})`);
                    // Anche senza fallback, abilita il link (potrebbe essere aggiornato dopo)
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.onclick = function(e) { return true; };
                    btn.removeAttribute('onclick');
                }
            });
        };
        
        // Avvia l'abilitazione con retry
        enableLinks();
    }

    /**
     * Aggiorna i link di download esistenti con gli URL da GitHub
     * @param {string} zipUrl - URL del file .zip
     * @param {string} mrpackUrl - URL del file .mrpack (opzionale)
     */
    updateDownloadLinksFromGitHub(zipUrl, mrpackUrl = null) {
        console.log('[ConfigManager] Aggiornamento link download da GitHub:', { zipUrl, mrpackUrl });
        
        // Funzione helper per aggiornare i link con retry
        const updateLinks = (retryCount = 0) => {
            const maxRetries = 5;
            const downloadBtns = document.querySelectorAll('.download-modpack-btn');
            console.log('[ConfigManager] Trovati', downloadBtns.length, 'pulsanti download-modpack-btn (tentativo', retryCount + 1, ')');
            
            // Se non trova i link e non abbiamo raggiunto il limite di retry, riprova
            if (downloadBtns.length === 0 && retryCount < maxRetries) {
                console.log('[ConfigManager] Link non trovati, riprovo tra 100ms...');
                setTimeout(() => updateLinks(retryCount + 1), 100);
                return;
            }
            
            // Se dopo tutti i retry non trova i link, usa il fallback
            if (downloadBtns.length === 0) {
                console.warn('[ConfigManager] Link non trovati dopo', maxRetries, 'tentativi, uso fallback');
                this.enableDownloadLinksFromConfig();
                return;
            }
            
            downloadBtns.forEach((btn, index) => {
                const format = btn.getAttribute('data-format');
                console.log(`[ConfigManager] Pulsante ${index + 1}: format=${format}, href attuale=${btn.href}`);
                
                if (format === 'mrpack' && mrpackUrl) {
                    btn.href = mrpackUrl;
                    // Abilita il link e rimuovi lo stile disabilitato
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    // Sostituisci l'onclick con una funzione che permette il download
                    btn.onclick = function(e) {
                        // Permetti il comportamento normale del link
                        return true;
                    };
                    // Rimuovi anche l'attributo onclick inline
                    btn.removeAttribute('onclick');
                    console.log('[ConfigManager] Link .mrpack aggiornato e abilitato:', mrpackUrl, 'href finale:', btn.href);
                } else if (format === 'zip' && zipUrl) {
                    btn.href = zipUrl;
                    // Abilita il link e rimuovi lo stile disabilitato
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    // Sostituisci l'onclick con una funzione che permette il download
                    btn.onclick = function(e) {
                        // Permetti il comportamento normale del link
                        return true;
                    };
                    // Rimuovi anche l'attributo onclick inline
                    btn.removeAttribute('onclick');
                    console.log('[ConfigManager] Link .zip aggiornato e abilitato:', zipUrl, 'href finale:', btn.href);
                } else {
                    console.warn(`[ConfigManager] Pulsante ${index + 1} non aggiornato: format=${format}, zipUrl=${!!zipUrl}, mrpackUrl=${!!mrpackUrl}`);
                }
            });
        };
        
        // Avvia l'aggiornamento con retry
        updateLinks();
        
        // Aggiorna anche TUTTI i link che puntano a GitHub releases (per retrocompatibilità)
        const allGitHubLinks = document.querySelectorAll('a[href*="github.com"]');
        console.log('[ConfigManager] Trovati', allGitHubLinks.length, 'link GitHub nella pagina');
        
        let updatedCount = 0;
        allGitHubLinks.forEach(link => {
            // Salta i link già aggiornati sopra
            if (link.classList.contains('download-modpack-btn')) {
                return;
            }
            
            const currentHref = link.href.toLowerCase();
            
            // Controlla se il link punta a una release GitHub
            if (currentHref.includes('/releases/download/')) {
                const oldHref = link.href;
                
                // Se il link punta a un file .mrpack e abbiamo un .mrpack, aggiornalo
                if (currentHref.includes('.mrpack') && mrpackUrl) {
                    link.href = mrpackUrl;
                    updatedCount++;
                    console.log('[ConfigManager] Link .mrpack aggiornato:', oldHref, '->', mrpackUrl);
                }
                // Se il link punta a un file .zip o non ha estensione specifica, aggiornalo con .zip
                else if (currentHref.includes('.zip') || (!currentHref.includes('.mrpack') && zipUrl)) {
                    link.href = zipUrl;
                    updatedCount++;
                    console.log('[ConfigManager] Link .zip aggiornato:', oldHref, '->', zipUrl);
                }
            }
        });
        
        console.log('[ConfigManager] Totale link aggiornati:', updatedCount + downloadBtns.length);
        
        // POI: Aggiorna i link specifici per ogni launcher (per sicurezza)
        this.updateSpecificLauncherLinks(zipUrl, mrpackUrl);
    }
    
    /**
     * Aggiorna i link specifici per ogni launcher
     */
    updateSpecificLauncherLinks(zipUrl, mrpackUrl = null) {
        const curseforgeContainer = document.querySelector('.download-options > .download-option:nth-child(1)');
        if (curseforgeContainer) {
            const curseforgeBtn = curseforgeContainer.querySelector('.btn');
            if (curseforgeBtn && zipUrl) {
                curseforgeBtn.href = zipUrl;
                console.log('[ConfigManager] Link CurseForge confermato:', zipUrl);
            }
        }

        // Aggiorna Modrinth (seconda opzione) con .mrpack se disponibile, altrimenti .zip
        const modrinthContainer = document.querySelector('.download-options > .download-option:nth-child(2)');
        if (modrinthContainer) {
            const modrinthBtn = modrinthContainer.querySelector('.btn');
            if (modrinthBtn) {
                if (mrpackUrl) {
                    modrinthBtn.href = mrpackUrl;
                    console.log('[ConfigManager] Link Modrinth confermato con .mrpack:', mrpackUrl);
                } else if (zipUrl) {
                    // Fallback a .zip se .mrpack non è disponibile
                    modrinthBtn.href = zipUrl;
                    console.warn('[ConfigManager] File .mrpack non trovato, uso .zip per Modrinth');
                }
            }
        }

        // Aggiorna SKLauncher (terza opzione) con .zip
        const sklauncherContainer = document.querySelector('.download-options > .download-option:nth-child(3)');
        if (sklauncherContainer) {
            const sklauncherBtn = sklauncherContainer.querySelector('.btn');
            if (sklauncherBtn && zipUrl) {
                sklauncherBtn.href = zipUrl;
                console.log('[ConfigManager] Link SKLauncher confermato:', zipUrl);
            }
        }

        // Aggiorna il pulsante di aggiornamento con .zip
        const updateBtn = document.getElementById('update-download-btn');
        if (updateBtn && zipUrl) {
            updateBtn.href = zipUrl;
        }

        // Aggiorna anche i pulsanti con il testo "SCARICA AGGIORNAMENTO"
        document.querySelectorAll('a').forEach(link => {
            if (link.textContent.trim() === 'SCARICA AGGIORNAMENTO' && zipUrl) {
                link.href = zipUrl;
            }
        });
    }

    applyDownloadLinks() {
        if (!this.config.downloadLinks) return;

        // Se GitHub è configurato, salta l'aggiornamento dei link modpack
        // (verranno aggiornati da loadGitHubRelease)
        const skipModpackLinks = this.config.github && 
                                  this.config.github.repository && 
                                  this.config.github.repository !== 'NOMEUTENTE/NOMEREPO';

        // Aggiorna i link per CurseForge
        if (this.config.downloadLinks.curseforge) {
            // Link del modpack - salta se GitHub è configurato
            if (!skipModpackLinks) {
                const curseforgeBtns = document.querySelectorAll('.download-option:nth-child(1) .btn');
                curseforgeBtns.forEach(btn => {
                    if (this.config.downloadLinks.curseforge.modpack) {
                        btn.href = this.config.downloadLinks.curseforge.modpack;
                    }
                });
            }

            // Link del launcher (sempre aggiornato)
            const curseforgeLinks = document.querySelectorAll('.download-option:nth-child(1) a[href*="curseforge.com"]');
            curseforgeLinks.forEach(link => {
                if (this.config.downloadLinks.curseforge.launcher) {
                    link.href = this.config.downloadLinks.curseforge.launcher;
                }
            });
        }

        // Aggiorna i link per Modrinth
        if (this.config.downloadLinks.modrinth) {
            // Link del modpack - salta se GitHub è configurato
            if (!skipModpackLinks) {
                const modrinthBtns = document.querySelectorAll('.download-option:nth-child(2) .btn');
                modrinthBtns.forEach(btn => {
                    if (this.config.downloadLinks.modrinth.modpack) {
                        btn.href = this.config.downloadLinks.modrinth.modpack;
                    }
                });
            }

            // Link del launcher (sempre aggiornato)
            const modrinthLinks = document.querySelectorAll('.download-option:nth-child(2) a[href*="modrinth.com"]');
            modrinthLinks.forEach(link => {
                if (this.config.downloadLinks.modrinth.launcher) {
                    link.href = this.config.downloadLinks.modrinth.launcher;
                }
            });
        }

        // Aggiorna i link per SKLauncher
        if (this.config.downloadLinks.sklauncher) {
            // Link del modpack - salta se GitHub è configurato
            if (!skipModpackLinks) {
                const sklauncherBtns = document.querySelectorAll('.download-option:nth-child(3) .btn');
                sklauncherBtns.forEach(btn => {
                    if (this.config.downloadLinks.sklauncher.modpack) {
                        btn.href = this.config.downloadLinks.sklauncher.modpack;
                    }
                });
            }

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
    
    // Salva l'istanza globalmente PRIMA di init per accesso successivo
    window.ConfigManager = window.ConfigManager || {};
    window.ConfigManager.instance = configManager;
    
    configManager.init().then(success => {
        if (success) {
            console.log('ConfigManager inizializzato con successo');
            
            // Assicurati che i link vengano aggiornati anche dopo che tutto è caricato
            // Questo risolve il problema quando si ricarica la pagina
            setTimeout(() => {
                const instance = window.ConfigManager.instance;
                if (instance && instance.config) {
                    const downloadBtns = document.querySelectorAll('.download-modpack-btn');
                    const disabledBtns = Array.from(downloadBtns).filter(btn => {
                        const style = window.getComputedStyle(btn);
                        return style.pointerEvents === 'none' || btn.href === '#' || btn.href === '' || btn.href === window.location.href;
                    });
                    
                    if (disabledBtns.length > 0) {
                        console.log('[ConfigManager] Trovati', disabledBtns.length, 'link ancora disabilitati dopo caricamento, riabilito con fallback');
                        instance.enableDownloadLinksFromConfig();
                    } else {
                        console.log('[ConfigManager] Tutti i link sono già abilitati');
                    }
                }
            }, 1000); // Aumentato a 1 secondo per dare più tempo
        } else {
            console.error('Errore durante l\'inizializzazione del ConfigManager');
            // Anche in caso di errore, prova ad abilitare i link con fallback
            setTimeout(() => {
                if (configManager.config) {
                    configManager.enableDownloadLinksFromConfig();
                }
            }, 1000);
        }
    });
    
    // Listener aggiuntivo per quando la pagina è completamente caricata
    window.addEventListener('load', () => {
        setTimeout(() => {
            const instance = window.ConfigManager.instance;
            if (instance && instance.config) {
                const downloadBtns = document.querySelectorAll('.download-modpack-btn');
                const disabledBtns = Array.from(downloadBtns).filter(btn => {
                    const style = window.getComputedStyle(btn);
                    return style.pointerEvents === 'none' || btn.href === '#' || btn.href === '' || btn.href === window.location.href;
                });
                
                if (disabledBtns.length > 0) {
                    console.log('[ConfigManager] Evento load: trovati', disabledBtns.length, 'link ancora disabilitati, riabilito con fallback');
                    instance.enableDownloadLinksFromConfig();
                }
            }
        }, 500);
    });
    
    // Listener globale per prevenire click su link disabilitati
    // E se il link è disabilitato, prova ad abilitarlo immediatamente e poi riprova il click
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.download-modpack-btn');
        if (target && (target.href === '#' || target.href === '' || target.href === window.location.href)) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[ConfigManager] Click su link disabilitato, provo ad abilitarlo...');
            
            // Prova immediatamente ad abilitare il link
            const instance = window.ConfigManager.instance;
            if (instance && instance.config) {
                instance.enableDownloadLinksFromConfig();
                
                // Riprova dopo un breve delay e se il link è stato abilitato, esegui il click
                setTimeout(() => {
                    if (target.href !== '#' && target.href !== '' && target.href !== window.location.href) {
                        console.log('[ConfigManager] Link abilitato, eseguo il download:', target.href);
                        // Esegui il download
                        window.open(target.href, '_blank');
                    } else {
                        // Se ancora non funziona, riprova
                        instance.enableDownloadLinksFromConfig();
                        setTimeout(() => {
                            if (target.href !== '#' && target.href !== '' && target.href !== window.location.href) {
                                window.open(target.href, '_blank');
                            }
                        }, 200);
                    }
                }, 100);
            }
            return false;
        }
    }, true);
    
    // Aggiungi event listener per hover solo quando i link sono abilitati
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.download-modpack-btn');
        if (target && target.href !== '#' && target.href !== '' && target.href !== window.location.href) {
            target.style.transform = 'translateY(-3px)';
            target.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.4)';
            target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.download-modpack-btn');
        if (target && target.href !== '#' && target.href !== '' && target.href !== window.location.href) {
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.3)';
            target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
        }
    });
});

window.ConfigManager = ConfigManager;

/**
 * Applica i link di download dal config.json
 */

