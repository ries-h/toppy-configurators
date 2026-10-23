/*
  Pop-up voor de configurator stavenafdekking op toppy.nl. Versie 2026-10-23.
  Gebruik: zet in het hero-blok één regel
    <script src="https://ries-h.github.io/toppy-configurators/popup.js" defer></script>
  Elke link naar https://ries-h.github.io/toppy-configurators/stavenafdekking.html (of met
  data-open-offerte / data-open-configurator) opent dan de configurator als venster over de pagina.
  Zonder dit script (of zonder JavaScript) opent dezelfde link de configurator als losse pagina.
  Sluiten: kruisje in de configurator, Esc, of naast het venster klikken.
*/
(function () {
    var d = document, root = d.documentElement;
    if (root.hasAttribute('data-staven-pop-init')) return; /* twee keer geladen? tweede keer doet niets */
    root.setAttribute('data-staven-pop-init', '');

    var HERKOMST = 'https://ries-h.github.io';
    var URL_CONFIGURATOR = HERKOMST + '/toppy-configurators/stavenafdekking.html';
    var BRON = 'toppy-staven-configurator';
    var KNOP = '[data-open-offerte],[data-open-configurator],a[href^="' + URL_CONFIGURATOR + '"]';

    var css = '' +
        '.tp-stavenpop{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:24px}' +
        '.tp-stavenpop.is-open{display:flex}' +
        '.tp-stavenpop .tp-stavenpop__achter{position:absolute;inset:0;background:rgba(30,36,38,.6)}' +
        '.tp-stavenpop .tp-stavenpop__venster{position:relative;width:min(1080px,100%);height:min(860px,100%);background:#fff;border-radius:.625rem;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
        '.tp-stavenpop .tp-stavenpop__venster iframe{display:block;width:100%;height:100%;border:0}' +
        '.tp-stavenpop .tp-stavenpop__laadt{position:absolute;inset:0;display:grid;place-items:center;margin:0;color:#5f6768;font:15px/1.5 Poppins,Helvetica,Arial,sans-serif}' +
        '.tp-stavenpop .tp-stavenpop__x{position:absolute;top:10px;right:10px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;background:#f5f5f5;color:#343e40;font-size:22px;line-height:1;cursor:pointer}' +
        '.tp-stavenpop.is-geladen .tp-stavenpop__x{display:none}' +
        '.tp-stavenpop .tp-stavenpop__x:focus-visible{outline:3px solid #35acf8;outline-offset:2px}' +
        'html.tp-stavenpop-open{overflow:hidden}' +
        '@media (max-width:600px){.tp-stavenpop{padding:0}.tp-stavenpop .tp-stavenpop__venster{width:100%;height:100%;border-radius:0}}';

    var pop = null, venster = null, terug = null;

    function bouw() {
        var s = d.createElement('style'); s.textContent = css; d.head.appendChild(s);
        pop = d.createElement('div');
        pop.className = 'tp-stavenpop';
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-modal', 'true');
        pop.setAttribute('aria-label', 'Stel je stavenafdekking samen');
        /* reserve-kruisje, alleen zolang de configurator laadt */
        pop.innerHTML = '<div class="tp-stavenpop__achter" data-staven-sluit></div>' +
            '<div class="tp-stavenpop__venster"><button type="button" class="tp-stavenpop__x" data-staven-sluit aria-label="Sluiten">×</button>' +
            '<p class="tp-stavenpop__laadt">Configurator laden…</p></div>';
        d.body.appendChild(pop);
        venster = pop.querySelector('.tp-stavenpop__venster');
        var f = d.createElement('iframe');
        f.src = URL_CONFIGURATOR;
        f.title = 'Stel je stavenafdekking samen';
        f.onload = function () { var l = venster.querySelector('.tp-stavenpop__laadt'); if (l) l.parentNode.removeChild(l); };
        venster.appendChild(f);
    }
    function open() {
        if (!pop) bouw();
        terug = d.activeElement;
        pop.classList.add('is-open');
        root.classList.add('tp-stavenpop-open');
        var x = pop.querySelector('.tp-stavenpop__x'); if (x && !pop.classList.contains('is-geladen')) x.focus();
        if (window.dataLayer) window.dataLayer.push({ event: 'staven_configurator_open' });
    }
    function sluit() {
        if (!pop || !pop.classList.contains('is-open')) return;
        pop.classList.remove('is-open');
        root.classList.remove('tp-stavenpop-open');
        if (terug && terug.focus) terug.focus();
    }

    d.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return; /* ctrl/cmd-klik: gewoon nieuw tabblad */
        var t = e.target.closest(KNOP);
        if (t) { e.preventDefault(); open(); return; }
        if (e.target.closest('[data-staven-sluit]')) { e.preventDefault(); sluit(); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') sluit(); });
    /* berichten uit de configurator: kruisje, geladen, verzonden */
    window.addEventListener('message', function (e) {
        var m = e.data;
        if (!m || m.bron !== BRON || e.origin !== HERKOMST || !pop) return;
        if (m.type === 'geladen') pop.classList.add('is-geladen');
        if (m.type === 'sluiten') sluit();
        if (m.type === 'verzonden') (window.dataLayer = window.dataLayer || []).push({ event: 'staven_configurator_aanvraag', uitvoering: m.uitvoering });
    });
})();
