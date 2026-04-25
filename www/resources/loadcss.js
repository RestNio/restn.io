// Load non-critical stylesheets asynchronously so they don't block render.
// Font Awesome and AOS are not needed for first paint (icons/animations are
// below the fold), so we apply them after the page is usable.
(function () {
    function loadCss(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    loadCss('font-awesome-all.css');
    loadCss('aos.css');
}());
