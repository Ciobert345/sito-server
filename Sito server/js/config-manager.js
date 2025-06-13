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
                countdownTitleElement.textContent = this.config.countdown.title;
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
        if (!this.config.updateNotice) return;
        
        const updateNoticeBox = document.getElementById('update-notice-box');
        if (!updateNoticeBox) return;
        
        // Verifica se il box Novità importanti è abilitato
        if (!this.config.updateNotice.enabled) {
            updateNoticeBox.style.display = 'none';
            return;
        } else {
            updateNoticeBox.style.display = 'block';
        }
        
        // Aggiorna il titolo principale (h3)
        if (this.config.updateNotice.title) {
            const mainTitleElement = updateNoticeBox.querySelector('h3');
            if (mainTitleElement) {
                mainTitleElement.textContent = this.config.updateNotice.title;
            }
        }
        
        // Aggiorna il sottotitolo (h4)
        if (this.config.updateNotice.subtitle) {
            const subtitleElement = updateNoticeBox.querySelector('h4');
            if (subtitleElement) {
                // Mantieni la parte "Novità!" e aggiorna solo la seconda parte
                subtitleElement.innerHTML = `<span style="color: var(--accent);">Novità!</span> ${this.config.updateNotice.subtitle}`;
            }
        }
        
        // Aggiorna il badge
        const updateBadge = document.getElementById('update-badge');
        if (updateBadge) {
            if (this.config.updateNotice.showBadge !== undefined) {
                // Trova il contenitore del badge (il div padre del badge)
                const badgeContainer = updateBadge.closest('div[style*="background: linear-gradient"]') || updateBadge.parentElement;
                if (badgeContainer) {
                    badgeContainer.style.display = this.config.updateNotice.showBadge ? 'inline-block' : 'none';
                }
                
                if (this.config.updateNotice.showBadge && this.config.updateNotice.badgeText) {
                    updateBadge.textContent = this.config.updateNotice.badgeText;
                }
            } else if (this.config.updateNotice.badgeText) {
                updateBadge.textContent = this.config.updateNotice.badgeText;
                updateBadge.parentElement.style.display = 'block';
            } else {
                updateBadge.parentElement.style.display = 'none';
            }
        }
        
        // Aggiorna le caratteristiche
        if (this.config.updateNotice.features && this.config.updateNotice.features.length) {
            // Trova il contenitore delle caratteristiche
            const featuresContainer = updateNoticeBox.querySelector('div[style*="display: flex; flex-direction: column; gap: 8px"]');
            if (featuresContainer) {
                // Rimuovi tutte le caratteristiche esistenti
                featuresContainer.innerHTML = '';
                
                // Aggiungi le nuove caratteristiche
                this.config.updateNotice.features.forEach(feature => {
                    const featureElement = document.createElement('div');
                    featureElement.style.display = 'flex';
                    featureElement.style.alignItems = 'flex-start';
                    featureElement.innerHTML = `
                        <span style="
                            display: inline-flex;
                            min-width: 16px;
                            height: 16px;
                            margin-top: 3px;
                            margin-right: 8px;
                        ">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </span>
                        <span style="
                            color: rgba(255, 255, 255, 0.92);
                            font-size: 0.9rem;
                            line-height: 1.5;
                        ">
                            ${feature}
                        </span>
                    `;
                    featuresContainer.appendChild(featureElement);
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
            
            // Crea il banner
            const bannerElement = document.createElement('div');
            bannerElement.className = `info-banner ${banner.style || 'default'}`;
            bannerElement.id = banner.id;
            
            // Crea l'icona
            let iconSvg = '';
            switch (banner.icon) {
                case 'notification':
                    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><circle cx="12" cy="4" r="2"></circle></svg>';
                    break;
                case 'event':
                    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                    break;
                default:
                    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            }
            
            // Crea il contenuto del banner
            bannerElement.innerHTML = `
                <div class="banner-icon">${iconSvg}</div>
                <div class="banner-content">
                    <h4 class="banner-title">
                        <span class="banner-highlight">${banner.title}</span> ${banner.subtitle}
                    </h4>
                    <p class="banner-message">${banner.message}</p>
                </div>
                <button class="banner-close" onclick="document.getElementById('${banner.id}').style.display='none'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            
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
                window.globalCountdownExpired = true;
                
                // Aggiorna l'interfaccia per mostrare che il countdown è scaduto
                if (countdownTitleEl) countdownTitleEl.style.display = "none";
                if (countdownContainerEl) countdownContainerEl.style.display = "none";
                
                // Pulisci il contenuto degli elementi del timer
                if (daysEl) daysEl.innerText = "--";
                if (hoursEl) hoursEl.innerText = "--";
                if (minutesEl) minutesEl.innerText = "--";
                if (secondsEl) secondsEl.innerText = "--";
                
                // Nascondi i bottoni GitHub non dentro #countdown-complete
                const githubButtons = document.querySelectorAll('.github-button');
                githubButtons.forEach(function(btn) {
                    if (!btn.closest('#countdown-complete')) {
                        btn.style.display = 'none';
                    }
                });
                
                // Mostra la sezione di countdown completato
                if (countdownCompleteSectionEl) {
                    countdownCompleteSectionEl.style.display = 'block';
                    void countdownCompleteSectionEl.offsetWidth;
                    countdownCompleteSectionEl.classList.add('visible');
                }
                
                // Verifica se il banner di manutenzione deve essere mostrato
                this.checkMaintenanceBanner();
                
                return;
            }
            
            // Calcola giorni, ore, minuti e secondi
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Aggiorna gli elementi HTML
            if (daysEl) daysEl.innerText = days < 10 ? "0" + days : days;
            if (hoursEl) hoursEl.innerText = hours < 10 ? "0" + hours : hours;
            if (minutesEl) minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
            if (secondsEl) secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
        };
        
        // Aggiorna subito il countdown
        updateCountdown();
        
        // Imposta l'intervallo per aggiornare il countdown ogni secondo
        window.globalCountdownInterval = setInterval(updateCountdown, 1000);
        window.globalCountdownExpired = false;
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