// Restore preferences before the page paints or the React bundle starts.
(() => {
  let theme = 'light';
  let lang = 'en';
  try {
    const savedTheme = localStorage.getItem('sidea.theme.v1');
    const savedLang = localStorage.getItem('sidea.lang.v1');
    if (savedTheme === 'dark' || savedTheme === 'light') theme = savedTheme;
    if (savedLang === 'en' || savedLang === 'kr') lang = savedLang;
  } catch {
    // Browsers may block storage; the page still works with the defaults.
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#262626' : '#FBFBFB');
})();
