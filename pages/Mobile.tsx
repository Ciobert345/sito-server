import React, { useState, useEffect } from 'react';
import bgImage from '../src/assets/bk.jpg';
import { useConfig } from '../contexts/ConfigContext';
import styles from './Mobile.module.css';

const Mobile: React.FC = () => {
    const { config, loading } = useConfig();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tab-access');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    const [showNews, setShowNews] = useState(false);
    const [links, setLinks] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState('');
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [countdownComplete, setCountdownComplete] = useState(false);

    const carouselImages = [
        '/img/pannello1.webp',
        '/img/pannello2.webp',
        '/img/pannello3.webp'
    ];

    // Countdown timer
    useEffect(() => {
        if (!config?.countdown?.enabled || !config.countdown.date) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = new Date(config.countdown.date).getTime();
            const distance = target - now;

            if (distance < 0) {
                setCountdownComplete(true);
                return;
            }

            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [config]);

    // Intersection Observer for animations
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!('IntersectionObserver' in window)) {
                document.querySelectorAll(`.${styles.sectionContent}, .${styles.heroCard}, .${styles.countdownCard}`).forEach(el => {
                    el.classList.add(styles.isVisible);
                });
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.isVisible);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll(`.${styles.sectionContent}, .${styles.heroCard}, .${styles.countdownCard}`).forEach(el => {
                observer.observe(el);
            });

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    };

    const handleImageClick = (src: string) => {
        setZoomImage(src);
        document.body.style.overflow = 'hidden';
    };

    const closeZoom = () => {
        setZoomImage(null);
        document.body.style.overflow = '';
    };

    const addLink = () => {
        const trimmed = linkInput.trim();
        if (!trimmed) return;
        try {
            new URL(trimmed);
            setLinks([...links, trimmed]);
            setLinkInput('');
        } catch {
            alert('Inserisci un URL valido.');
        }
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const toggleNews = () => {
        setShowNews(!showNews);
    };

    const columnToStatus: Record<string, string> = {
        'backlog': 'backlog',
        'nextup': 'planned',
        'inprogress': 'inProgress',
        'done': 'completed'
    };

    const statusText: Record<string, string> = {
        'backlog': 'Backlog',
        'planned': 'Pianificato',
        'inProgress': 'In Corso',
        'completed': 'Completato'
    };

    const roadmapItems = config?.feedbackRoadmap?.sections?.roadmap?.items || [];
    const sortedRoadmap = [...roadmapItems].sort((a, b) => {
        const columnOrder: Record<string, number> = { backlog: 0, nextup: 1, inprogress: 2, done: 3 };
        const priorityOrder: Record<string, number> = { 'Alta': 0, 'Media': 1, 'Bassa': 2, 'alta': 0, 'media': 1, 'bassa': 2 };

        const ca = columnOrder[a.column] ?? 99;
        const cb = columnOrder[b.column] ?? 99;
        if (ca !== cb) return ca - cb;

        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;

        return (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase());
    });

    const filteredRoadmap = activeFilter === 'all'
        ? sortedRoadmap
        : sortedRoadmap.filter(item => columnToStatus[item.column] === activeFilter);

    if (loading) {
        return <div className={styles.mobileBody} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (!config) {
        return <div className={styles.mobileBody} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error loading configuration</div>;
    }

    const enabledBanners = config.infoBanners?.filter(b => b.enabled) || [];

    return (
        <div className={styles.mobileBody}>
            {/* Fixed Header */}
            <header className={styles.mainHeader}>
                <a href="#top" className={styles.headerItem}>
                    <img src="/favicon.png" alt="Logo" className={styles.logo} />
                </a>
                <div className={styles.headerItem} onClick={toggleMenu}>
                    <div className={`${styles.hamburgerMenu} ${menuOpen ? styles.active : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className={`${styles.mobileNav} ${menuOpen ? styles.active : ''}`}>
                <h3 className={styles.navTitle}>Menu di Navigazione</h3>
                <ul>
                    <li><a href="#top" onClick={closeMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        <span>Stato</span>
                    </a></li>
                    <li><a href="#informazioni" onClick={closeMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        <span>Informazioni</span>
                    </a></li>
                    <li><a href="#dashboard" onClick={closeMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        <span>Dashboard</span>
                    </a></li>
                    <li><a href="#richiedi-accesso" onClick={closeMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
                        <span>Utilità</span>
                    </a></li>
                    <li><a href="#aggiornamenti" onClick={closeMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                        <span>Novità</span>
                    </a></li>
                </ul>
            </nav>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section id="stato-server" className={`${styles.section} ${styles.heroSection}`}>
                    <div
                        className={styles.backgroundImageContainer}
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    ></div>
                    <div className={styles.heroContentWrapper}>
                        {/* Info Banners */}
                        {enabledBanners.length > 0 && (
                            <div className={styles.infoBanners}>
                                {enabledBanners.map(banner => (
                                    <div key={banner.id} className={`${styles.infoBanner} ${styles.warning}`}>
                                        <div className={styles.bannerContent}>
                                            <h4>{banner.title}</h4>
                                            {banner.message && <p>{banner.message}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Countdown */}
                        {config.countdown?.enabled && !countdownComplete && (
                            <div className={`${styles.countdownCard} ${styles.isVisible}`}>
                                <h2 className={styles.countdownTitleMobile}>{config.countdown.title || "L'aggiornamento arriverà tra"}</h2>
                                <div className={styles.countdownBoxesMobile}>
                                    <div className={styles.countdownBoxMobile}>
                                        <div className={styles.countdownValueMobile}>{String(countdown.days).padStart(2, '0')}</div>
                                        <div className={styles.countdownLabelMobile}>Giorni</div>
                                    </div>
                                    <div className={styles.countdownBoxMobile}>
                                        <div className={styles.countdownValueMobile}>{String(countdown.hours).padStart(2, '0')}</div>
                                        <div className={styles.countdownLabelMobile}>Ore</div>
                                    </div>
                                    <div className={styles.countdownBoxMobile}>
                                        <div className={styles.countdownValueMobile}>{String(countdown.minutes).padStart(2, '0')}</div>
                                        <div className={styles.countdownLabelMobile}>Minuti</div>
                                    </div>
                                    <div className={styles.countdownBoxMobile}>
                                        <div className={styles.countdownValueMobile}>{String(countdown.seconds).padStart(2, '0')}</div>
                                        <div className={styles.countdownLabelMobile}>Secondi</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Countdown Complete */}
                        {config.countdown?.enabled && countdownComplete && (
                            <div className={`${styles.countdownCompleteCard} ${styles.isVisible}`}>
                                <div className={styles.successIconMobile}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9 12l2 2l4-4"></path>
                                    </svg>
                                </div>
                                <h3>L'aggiornamento è arrivato!</h3>
                                <p>{config.countdown.expiredMessage || 'Il server è ora disponibile e aggiornato. Scopri tutte le novità!'}</p>
                                <div className={styles.completeButtons}>
                                    <a href="#aggiornamenti" className={styles.btnLearnMore}>News</a>
                                    <a href="#informazioni" className={`${styles.btnLearnMore} ${styles.secondary}`}>Informazioni</a>
                                </div>
                            </div>
                        )}

                        {/* Hero Card */}
                        <div className={`${styles.heroCard} ${styles.heroCardMain} ${styles.isVisible}`}>
                            <h1>Server Manfredonia</h1>
                            <p>Un'esperienza di gioco unica. Esplora un mondo vasto e personalizzato, costruisci sistemi complessi e affronta sfide epiche.</p>
                            <a href="https://github.com/sHaDow105off/Mod-server-Manfredonia" target="_blank" rel="noopener noreferrer" className={styles.btnLearnMore}>Progetto su GitHub</a>
                        </div>
                    </div>
                </section>

                {/* Information Section */}
                <section id="informazioni" className={styles.section}>
                    <div className={`${styles.sectionContent} ${styles.premiumCard}`}>
                        <h2>Benvenuto a Manfredonia</h2>
                        <picture>
                            <img src="https://media.forgecdn.net/attachments/1108/547/bbqax1n-jpeg.jpeg" alt="BetterMinecraft landscape" className={`${styles.sectionImage} ${styles.roundedImage}`} loading="lazy" />
                        </picture>
                        <p>
                            Il server è basato sul modpack <b>BetterMinecraft</b>, che combina le migliori mod di avventura, tecnologia e magia.
                        </p>
                        <h3>Caratteristiche principali:</h3>
                        <ul className={styles.featuresList}>
                            <li>Nuove dimensioni e biomi da esplorare</li>
                            <li>Miglioramenti grafici e di performance</li>
                            <li>Nuove creature e boss da combattere</li>
                        </ul>
                    </div>
                </section>

                {/* Dashboard Section */}
                <section id="dashboard" className={styles.section}>
                    <div className={`${styles.sectionContent} ${styles.premiumCard}`}>
                        <h2>Pannello di Controllo</h2>
                        <p>
                            Il nostro server dispone di un pannello di controllo web che permette ai membri di monitorare lo stato del server e interagire con esso. Accedi tramite il nostro server Discord per avviare, spegnere o riavviare il server.
                        </p>
                        <div className={styles.carouselContainer}>
                            <div className={styles.carouselSlides} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {carouselImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Dashboard ${idx + 1}`}
                                        className={styles.carouselSlide}
                                        onClick={() => handleImageClick(img)}
                                        loading="lazy"
                                    />
                                ))}
                            </div>
                            <button className={styles.carouselPrev} onClick={prevSlide}>&#10094;</button>
                            <button className={styles.carouselNext} onClick={nextSlide}>&#10095;</button>
                            <div className={styles.carouselIndicators}>
                                {carouselImages.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={idx === currentSlide ? styles.active : ''}
                                        onClick={() => goToSlide(idx)}
                                    ></span>
                                ))}
                            </div>
                        </div>
                        <a href="https://server-manfredonia.ddns.net:25560/" target="_blank" rel="noopener noreferrer" className={`${styles.btnLearnMore} ${styles.dashboardLink}`}>Vai alla dashboard</a>
                    </div>
                </section>

                {/* Utilities Section */}
                <section id="richiedi-accesso" className={styles.section}>
                    <div className={`${styles.sectionContent} ${styles.premiumCard}`}>
                        <h2>Utilità</h2>

                        <div className={styles.tabContainer}>
                            <div className={styles.pillTabSelector}>
                                <button className={`${styles.pillTabBtn} ${activeTab === 'tab-access' ? styles.active : ''}`} onClick={() => handleTabClick('tab-access')}>
                                    <span className={styles.icon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>
                                    </span>
                                    <span className={styles.label}>Accesso</span>
                                </button>
                                <button className={`${styles.pillTabBtn} ${activeTab === 'tab-feedback' ? styles.active : ''}`} onClick={() => handleTabClick('tab-feedback')}>
                                    <span className={styles.icon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                                    </span>
                                    <span className={styles.label}>Segnala</span>
                                </button>
                                <button className={`${styles.pillTabBtn} ${activeTab === 'tab-suggestions' ? styles.active : ''}`} onClick={() => handleTabClick('tab-suggestions')}>
                                    <span className={styles.icon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M2 12C2 7.58 5.58 4 10 4h4c4.42 0 8 3.58 8 8 0 2.97-1.64 5.55-4.06 6.92-.6.34-.94.99-.94 1.68V21H7v-.4c0-.69-.34-1.34-.94-1.68C3.64 17.55 2 14.97 2 12z" /></svg>
                                    </span>
                                    <span className={styles.label}>Suggerimenti</span>
                                </button>
                                <button className={`${styles.pillTabBtn} ${activeTab === 'tab-roadmap' ? styles.active : ''}`} onClick={() => handleTabClick('tab-roadmap')}>
                                    <span className={styles.icon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-12" /><path d="M9 18l-6-3V3l6 3 6-3 6 3v12l-6-3z" /></svg>
                                    </span>
                                    <span className={styles.label}>Roadmap</span>
                                </button>
                            </div>

                            {/* Tab Access */}
                            <div className={`${styles.tabContent} ${activeTab === 'tab-access' ? styles.active : ''}`}>
                                <p>Compila il modulo seguente per richiedere l'accesso al server.</p>
                                <img src="https://media.forgecdn.net/attachments/1108/426/swamp-jpg.jpg" alt="Minecraft community" className={`${styles.sectionImage} ${styles.roundedImage} ${styles.sectionImageMarginTop}`} loading="lazy" />

                                <form action="https://formspree.io/f/mqabzreg" method="POST" className={styles.marginTop20}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name">Nome e Cognome</label>
                                        <input type="text" name="name" id="name" className={styles.formControl} placeholder="Es. Max Emilian Verstappen" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Email</label>
                                        <input type="email" name="email" id="email" className={styles.formControl} placeholder="Es. max-emilian.verstappen@gmail.com" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="minecraft">Nome Account Minecraft</label>
                                        <input type="text" name="minecraft" id="minecraft" className={styles.formControl} placeholder="Es. FranzHermann" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="discord">Nome Utente Discord</label>
                                        <input type="text" name="discord" id="discord" className={styles.formControl} placeholder="Es. FranzHermann#33" required />
                                    </div>
                                    <input type="hidden" name="_subject" value="Nuova richiesta di accesso al server Minecraft" />
                                    <button type="submit" className={`${styles.btnLearnMore} ${styles.btnFullWidth}`} style={{ marginTop: '10px' }}>Invia richiesta</button>
                                </form>
                            </div>

                            {/* Tab Feedback */}
                            <div className={`${styles.tabContent} ${activeTab === 'tab-feedback' ? styles.active : ''}`}>
                                <p>Hai riscontrato un problema con il server? Segnalacelo compilando il modulo qui sotto.</p>

                                <form action="https://formspree.io/f/xblavdda" method="POST" className={styles.marginTop20}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="problem-name">Nome e Cognome</label>
                                        <input type="text" name="name" id="problem-name" className={styles.formControl} placeholder="Es. Max Emilian Verstappen" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="problem-email">Email</label>
                                        <input type="email" name="email" id="problem-email" className={styles.formControl} placeholder="Es. max-emilian.verstappen@gmail.com" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="modpack-version">Versione Modpack</label>
                                        <input type="text" name="modpack-version" id="modpack-version" className={styles.formControl} placeholder="Es. 1.2.3" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="problem-description">Descrizione del problema</label>
                                        <textarea name="description" id="problem-description" className={styles.formControl} rows={5} placeholder="Descrivi dettagliatamente il problema riscontrato..." required></textarea>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="swisstransfer">Link SwissTransfer (opzionale)</label>
                                        <div className={styles.swisstransferContainer}>
                                            <input type="url" name="swisstransfer" id="swisstransfer" className={`${styles.formControl} ${styles.swisstransferInput}`} placeholder="Es. https://www.swisstransfer.com/d-XXXXX" />
                                            <a href="https://www.swisstransfer.com/it-it" target="_blank" rel="noopener noreferrer" className={styles.btnSwisstransfer}>Vai</a>
                                        </div>
                                    </div>
                                    <input type="hidden" name="_subject" value="Nuova segnalazione problema server Minecraft" />
                                    <button type="submit" className={`${styles.btnLearnMore} ${styles.btnFullWidth}`} style={{ marginTop: '10px' }}>Invia segnalazione</button>
                                </form>
                            </div>

                            {/* Tab Suggestions */}
                            <div className={`${styles.tabContent} ${styles.tabSuggestions} ${activeTab === 'tab-suggestions' ? styles.active : ''}`}>
                                <p>Hai un'idea o un miglioramento? Inviaci i tuoi suggerimenti qui sotto.</p>

                                <form action={config.feedbackRoadmap?.sections?.suggestions?.formspreeUrl || 'https://formspree.io/f/xblavdda'} method="POST" className={styles.marginTop20}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="suggestion-name-mobile">Nome e Cognome</label>
                                        <input type="text" name="name" id="suggestion-name-mobile" className={styles.formControl} placeholder="Es. Max Emilian Verstappen" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="suggestion-email-mobile">Email</label>
                                        <input type="email" name="email" id="suggestion-email-mobile" className={styles.formControl} placeholder="Es. max-emilian.verstappen@gmail.com" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="suggestion-type-mobile">Tipo di Suggerimento</label>
                                        <select id="suggestion-type-mobile" name="suggestion-type" className={styles.formControl} defaultValue="" required>
                                            <option value="" disabled hidden>Seleziona il tipo...</option>
                                            <optgroup label="Generale">
                                                <option value="gameplay">Gameplay</option>
                                                <option value="interface">Interfaccia</option>
                                                <option value="performance">Prestazioni</option>
                                            </optgroup>
                                            <optgroup label="Mod">
                                                <option value="mod">Nuova Mod</option>
                                            </optgroup>
                                            <optgroup label="Altro">
                                                <option value="altro">Altro</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="suggestion-description-mobile">Descrizione del Suggerimento</label>
                                        <textarea name="description" id="suggestion-description-mobile" className={styles.formControl} rows={5} placeholder="Descrivi il tuo suggerimento..." required></textarea>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="suggestion-link-input-mobile">Link utili (Modrinth/CurseForge/Altro)</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                                            <input
                                                type="url"
                                                id="suggestion-link-input-mobile"
                                                className={styles.formControl}
                                                placeholder="https://modrinth.com/mod/..."
                                                value={linkInput}
                                                onChange={(e) => setLinkInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                                            />
                                            <button type="button" onClick={addLink} className={styles.btnLearnMore}>Aggiungi</button>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '6px' }}>Aggiungi uno o più link. Puoi rimuoverli dall'elenco.</div>
                                        <div className={styles.linksListMobile}>
                                            {links.map((link, idx) => (
                                                <div key={idx} className={styles.linkChip}>
                                                    <span>{link}</span>
                                                    <button type="button" onClick={() => removeLink(idx)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                        {links.map((link, idx) => (
                                            <input key={idx} type="hidden" name="links[]" value={link} />
                                        ))}
                                    </div>

                                    <input type="hidden" name="_subject" value="Nuovo suggerimento Modpack - Mobile" />
                                    <button type="submit" className={`${styles.btnLearnMore} ${styles.btnFullWidth}`} style={{ marginTop: '10px' }}>Invia suggerimento</button>
                                </form>
                            </div>

                            {/* Tab Roadmap */}
                            <div className={`${styles.tabContent} ${activeTab === 'tab-roadmap' ? styles.active : ''}`}>
                                <p>Ecco la roadmap dei prossimi aggiornamenti e funzionalità previste per il server.</p>
                                <div className={styles.pillTabSelector}>
                                    <button className={`${styles.pillTabBtn} ${activeFilter === 'all' ? styles.active : ''}`} onClick={() => handleFilterClick('all')}>
                                        <span className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /></svg>
                                        </span>
                                        <span className={styles.label}>Tutti</span>
                                    </button>
                                    <button className={`${styles.pillTabBtn} ${activeFilter === 'backlog' ? styles.active : ''}`} onClick={() => handleFilterClick('backlog')}>
                                        <span className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#8e44ad"><circle cx="12" cy="12" r="9" /></svg>
                                        </span>
                                        <span className={styles.label}>Backlog</span>
                                    </button>
                                    <button className={`${styles.pillTabBtn} ${activeFilter === 'planned' ? styles.active : ''}`} onClick={() => handleFilterClick('planned')}>
                                        <span className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#3498db"><circle cx="12" cy="12" r="9" /></svg>
                                        </span>
                                        <span className={styles.label}>Pianificato</span>
                                    </button>
                                    <button className={`${styles.pillTabBtn} ${activeFilter === 'inProgress' ? styles.active : ''}`} onClick={() => handleFilterClick('inProgress')}>
                                        <span className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f39c12"><circle cx="12" cy="12" r="9" /></svg>
                                        </span>
                                        <span className={styles.label}>In Corso</span>
                                    </button>
                                    <button className={`${styles.pillTabBtn} ${activeFilter === 'completed' ? styles.active : ''}`} onClick={() => handleFilterClick('completed')}>
                                        <span className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#2ecc71"><circle cx="12" cy="12" r="9" /></svg>
                                        </span>
                                        <span className={styles.label}>Completato</span>
                                    </button>
                                </div>
                                <div className={`${styles.roadmapContainer} ${styles.improvedRoadmap}`}>
                                    {filteredRoadmap.map(item => {
                                        const status = columnToStatus[item.column] || 'planned';
                                        return (
                                            <div key={item.id} className={`${styles.roadmapItem} ${styles[status]}`}>
                                                <span className={styles.status}>{statusText[status]}</span>
                                                <h3>{item.title}</h3>
                                                <p>Tipo: {item.type} - Priorità: {item.priority}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Updates Section */}
                <section id="aggiornamenti" className={styles.section}>
                    <div className={`${styles.sectionContent} ${styles.premiumCard}`}>
                        <h2>Aggiornamenti</h2>
                        <p>Segui qui tutte le patch notes e le novità del server.</p>
                        <button onClick={toggleNews} className={styles.btnLearnMore} style={{ marginBottom: '20px' }}>
                            {showNews ? 'Nascondi aggiornamenti' : 'Mostra aggiornamenti'}
                        </button>
                        {showNews && (
                            <div className={styles.iframeContainer}>
                                <iframe
                                    src="https://dent-comte-e60.notion.site/ebd/20e1a36dbdb98050b8fac5ae5f158659?v=20e1a36dbdb98036aa1f000c15ecf1b2"
                                    loading="lazy"
                                ></iframe>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.siteFooter}>
                <p>© 2025 Server Manfredonia. Tutti i diritti riservati. Minecraft è un marchio registrato di Mojang AB.</p>
            </footer>

            {/* Image Zoom Overlay */}
            {zoomImage && (
                <div className={`${styles.imageZoomOverlay} ${styles.active}`} onClick={closeZoom}>
                    <span className={styles.zoomClose}>×</span>
                    <img className={styles.zoomedImg} src={zoomImage} alt="Immagine ingrandita" />
                </div>
            )}
        </div>
    );
};

export default Mobile;
