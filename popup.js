/*
  Pop-up voor de configurators op toppy.nl (stavenafdekking en winterzeil). Versie 2026-10-23.
  Gebruik: zet in het hero-blok één regel
    <script src="https://ries-h.github.io/toppy-configurators/popup.js" defer></script>
  Elke link naar een configurator in https://ries-h.github.io/toppy-configurators/
  (stavenafdekking.html, winterzeil.html) opent dan als venster over de pagina.
  Knoppen met data-open-offerte / data-open-configurator openen de stavenafdekking.
  Zonder dit script (of zonder JavaScript) opent dezelfde link de configurator als losse pagina.
  Sluiten: kruisje in de configurator, Esc, of naast het venster klikken.
*/
(function () {
    var d = document, root = d.documentElement;
    if (root.hasAttribute('data-staven-pop-init')) return; /* twee keer geladen? tweede keer doet niets */
    root.setAttribute('data-staven-pop-init', '');

    var HERKOMST = 'https://ries-h.github.io';
    var MAP = HERKOMST + '/toppy-configurators/';
    /* bestand: [titel, bron in de berichten, event voor Tag Manager] */
    var CONFIGURATORS = {
        'stavenafdekking.html': ['Stel je stavenafdekking samen', 'toppy-staven-configurator', 'staven_configurator'],
        'winterzeil.html': ['Stel je winterzeil samen', 'toppy-winter-configurator', 'winter_configurator']
    };
    var KNOP = '[data-open-offerte],[data-open-configurator]';
    for (var b in CONFIGURATORS) KNOP += ',a[href^="' + MAP + b + '"]';

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

    var pop = null, venster = null, terug = null, nu = null;

    function bouw() {
        var s = d.createElement('style'); s.textContent = css; d.head.appendChild(s);
        pop = d.createElement('div');
        pop.className = 'tp-stavenpop';
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-modal', 'true');
        /* reserve-kruisje, alleen zolang de configurator laadt */
        pop.innerHTML = '<div class="tp-stavenpop__achter" data-staven-sluit></div>' +
            '<div class="tp-stavenpop__venster"><button type="button" class="tp-stavenpop__x" data-staven-sluit aria-label="Sluiten">×</button></div>';
        d.body.appendChild(pop);
        venster = pop.querySelector('.tp-stavenpop__venster');
    }
    /* één iframe per configurator; heropenen houdt de ingevulde stap vast */
    function frame(bestand) {
        var f = venster.querySelector('iframe[data-bestand="' + bestand + '"]');
        if (!f) {
            var l = d.createElement('p'); l.className = 'tp-stavenpop__laadt'; l.textContent = 'Configurator laden…';
            venster.appendChild(l);
            f = d.createElement('iframe');
            f.src = MAP + bestand;
            f.title = CONFIGURATORS[bestand][0];
            f.setAttribute('data-bestand', bestand);
            f.onload = function () { if (l.parentNode) l.parentNode.removeChild(l); };
            venster.appendChild(f);
        }
        [].forEach.call(venster.querySelectorAll('iframe'), function (x) { x.style.display = x === f ? '' : 'none'; });
        pop.classList.toggle('is-geladen', f.hasAttribute('data-geladen'));
        return f;
    }
    function open(bestand) {
        if (!pop) bouw();
        nu = bestand;
        frame(bestand);
        pop.setAttribute('aria-label', CONFIGURATORS[bestand][0]);
        terug = d.activeElement;
        pop.classList.add('is-open');
        root.classList.add('tp-stavenpop-open');
        var x = pop.querySelector('.tp-stavenpop__x'); if (x && !pop.classList.contains('is-geladen')) x.focus();
        if (window.dataLayer) window.dataLayer.push({ event: CONFIGURATORS[bestand][2] + '_open' });
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
        if (t) {
            e.preventDefault();
            var h = (t.getAttribute('href') || '').split(/[?#]/)[0], bestand = 'stavenafdekking.html';
            for (var b in CONFIGURATORS) if (h === MAP + b) bestand = b;
            open(bestand); return;
        }
        if (e.target.closest('[data-staven-sluit]')) { e.preventDefault(); sluit(); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') sluit(); });
    /* berichten uit de configurator: kruisje, geladen, verzonden */
    window.addEventListener('message', function (e) {
        var m = e.data;
        if (!m || e.origin !== HERKOMST || !pop) return;
        var bestand = null;
        for (var b in CONFIGURATORS) if (CONFIGURATORS[b][1] === m.bron) bestand = b;
        if (!bestand) return;
        if (m.type === 'geladen') { var f = venster.querySelector('iframe[data-bestand="' + bestand + '"]'); if (f) f.setAttribute('data-geladen', ''); if (bestand === nu) pop.classList.add('is-geladen'); }
        if (m.type === 'sluiten') sluit();
        if (m.type === 'verzonden') (window.dataLayer = window.dataLayer || []).push({ event: CONFIGURATORS[bestand][2] + '_aanvraag', uitvoering: m.uitvoering });
    });
})();
