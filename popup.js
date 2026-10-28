/*
  Pop-up voor de configurators op toppy.nl (stavenafdekking, winterzeil, winternet, lamellendek). Versie 2026-10-27.
  Gebruik: zet in het hero-blok één regel
    <script src="https://ries-h.github.io/toppy-configurators/popup.js" defer></script>
  Elke link naar een configurator in https://ries-h.github.io/toppy-configurators/
  (stavenafdekking.html, winterzeil.html, winternet.html, lamellendek.html) opent dan als venster over de pagina.
  Knoppen met data-open-offerte / data-open-configurator openen de stavenafdekking.
  Zonder dit script (of zonder JavaScript) opent dezelfde link de configurator als losse pagina.
  Sluiten: kruisje in de configurator, Esc, of naast het venster klikken.
  Meten (2026-10-27): na een verzonden aanvraag gaat de pagina naar /bedankt-offerte-aanvraag (op toppy.be
  voor Belgische klanten, 2026-10-28), waar
  Tag Manager de offerte-conversie al telt. De herkomst (gclid, utm-tags, landingspagina) gaat via de
  url mee naar de configurator en komt zo in JotForm en Freshdesk.
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
        'winterzeil.html': ['Stel je winterzeil samen', 'toppy-winter-configurator', 'winter_configurator'],
        'winternet.html': ['Stel je winternet samen', 'toppy-winternet-configurator', 'winternet_configurator'],
        'lamellendek.html': ['Stel je lamellendek samen', 'toppy-lamellen-configurator', 'lamellen_configurator']
    };
    /* bedankpagina op het domein van de klant: toppy.be als de pop-up op toppy.be staat
       of als de klant in de configurator België kiest (lamellendek), anders toppy.nl */
    function bedankt(slug, land) {
        var be = /toppy\.be$/.test(location.hostname) || land === 'België';
        return 'https://www.toppy.' + (be ? 'be' : 'nl') + '/bedankt-offerte-aanvraag?configurator=' + slug;
    }
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

    /* herkomst van de bezoeker: klik-id's en utm-tags uit de url. Bewaard (90 dagen, laatste klik
       wint), zodat ze ook meegaan als iemand via een advertentie binnenkomt en daarna doorklikt. */
    var SLEUTELS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    function koekje(naam) { var m = d.cookie.match(new RegExp('(?:^|; )' + naam + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
    function herkomst() {
        var h = {}, nieuw = false, opslag = null, q;
        try { q = new URLSearchParams(location.search); } catch (x) { q = null; }
        if (q) SLEUTELS.forEach(function (k) { var w = q.get(k); if (w) { h[k] = w; nieuw = true; } });
        try {
            if (nieuw) {
                h.landing = location.href.split('#')[0];
                if (d.referrer) h.referrer = d.referrer;
                localStorage.setItem('tp_herkomst', JSON.stringify({ t: Date.now(), h: h }));
            } else {
                opslag = JSON.parse(localStorage.getItem('tp_herkomst') || 'null');
                if (opslag && Date.now() - opslag.t < 90 * 864e5) h = opslag.h;
            }
        } catch (x) { /* geen opslag (privévenster): dan alleen wat er nu in de url staat */ }
        /* geen gclid/fbclid in url of opslag? De cookies van Google en Meta hebben hem soms nog */
        if (!h.gclid) { var g = koekje('_gcl_aw').split('.'); if (g.length > 2) h.gclid = g.slice(2).join('.'); }
        if (!h.fbclid) { var fb = koekje('_fbc').split('.'); if (fb.length > 3) h.fbclid = fb.slice(3).join('.'); }
        h.pagina = location.href.split('#')[0];
        var uit = [];
        for (var k in h) if (h[k]) uit.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(h[k]).slice(0, 500)));
        return uit.length ? '?' + uit.join('&') : '';
    }

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
            f.src = MAP + bestand + herkomst();
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
        if (e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return; /* ctrl/cmd-klik: gewoon nieuw tabblad */
        var t = e.target.closest(KNOP);
        if (t) {
            /* in de capture-fase en niet doorgeven: anders kan het linkscript van de site de klik
               eerder afhandelen en naar de losse pagina doorsturen (gebeurde soms wel, soms niet) */
            e.preventDefault(); e.stopPropagation();
            var h = (t.getAttribute('href') || '').split(/[?#]/)[0], bestand = 'stavenafdekking.html';
            for (var b in CONFIGURATORS) if (h === MAP + b) bestand = b;
            open(bestand); return;
        }
        if (e.target.closest('[data-staven-sluit]')) { e.preventDefault(); sluit(); }
    }, true);
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
        if (m.type === 'verzonden') {
            (window.dataLayer = window.dataLayer || []).push({ event: CONFIGURATORS[bestand][2] + '_aanvraag', uitvoering: m.uitvoering });
            /* naar de bedankpagina: daar telt Tag Manager de offerte-conversie (GA4, Meta, Google Ads).
               Kort wachten, zodat de bezoeker het bedankscherm ziet en de tag hierboven kan afgaan. */
            var slug = bestand.replace('.html', '');
            setTimeout(function () { location.href = bedankt(slug, m.land); }, 1500);
        }
    });
})();
