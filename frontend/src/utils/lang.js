// Centralized Fast & Reliable Language Manager for TVK Website

export const getCurrentLanguage = () => {
  try {
    // 1. Primary fast source: localStorage preference
    const saved = localStorage.getItem('tvk_preferred_lang');
    if (saved === 'ta' || saved === 'en') {
      return saved;
    }

    // 2. Cookie inspection (robust parsing for googtrans)
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('googtrans=')) {
          const val = trimmed.substring('googtrans='.length);
          if (val.includes('/ta')) return 'ta';
          if (val.includes('/en')) return 'en';
        }
      }
    }
  } catch (e) {
    console.error('Error reading language:', e);
  }
  return 'en';
};

export const setAppLanguage = (langCode) => {
  const target = langCode === 'ta' ? 'ta' : 'en';
  const cookieVal = target === 'ta' ? '/en/ta' : '/en/en';

  try {
    // 1. Store preference instantly
    localStorage.setItem('tvk_preferred_lang', target);

    // 2. Skip full splash loader on language switch reload for instant feel
    sessionStorage.setItem('skip_temple_loader', 'true');

    // 3. Clear existing conflicting cookies on various domain/path levels
    const hostname = window.location.hostname || '';
    const domains = ['', hostname, `.${hostname}`];
    const paths = ['/', '/volunteer', '/appointment', '/about'];

    for (const d of domains) {
      for (const p of paths) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}; ${d ? `domain=${d};` : ''}`;
      }
    }

    // 4. Set clean cookies
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (hostname) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
      if (hostname.includes('.')) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      }
    }

    // 5. Fast reload to apply
    window.location.reload();
  } catch (e) {
    console.error('Error setting language:', e);
    window.location.reload();
  }
};
