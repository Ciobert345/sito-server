export const isMobilePhone = (): boolean => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) ||
        (ua.includes('Mac') && 'ontouchend' in document);

    return isMobile && !isTablet;
};

export const shouldRedirectToMobile = (): boolean => {
    // Check if already on mobile route
    if (window.location.hash.includes('/mobile')) return false;

    // Check localStorage to respect user preference
    const preference = localStorage.getItem('viewMode');
    if (preference === 'desktop') return false;

    return isMobilePhone();
};

export const switchToDesktop = (): void => {
    localStorage.setItem('viewMode', 'desktop');
    window.location.hash = '#/';
    window.location.reload();
};

export const switchToMobile = (): void => {
    localStorage.removeItem('viewMode');
    window.location.hash = '#/mobile';
    window.location.reload();
};
