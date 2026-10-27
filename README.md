# Toppy configurators

Losse configuratorpagina's voor toppy.nl, gehost via GitHub Pages.

- `winterzeil.html`: configurator winterzeil op maat (type Budget/Basis/Deluxe, vorm en
  maten, kleur, bevestiging, gegevens). Rekent zoals configurator 1028 op toppy.nl en stuurt de
  aanvraag naar JotForm "Offerte aanvragen winterzeil" (262952653525362).
- `winternet.html`: configurator winternet op maat (type Budget/Basis/Deluxe, vorm en maten,
  kleur, bevestiging, gegevens). Rekent zoals configurator 1712 op toppy.nl en stuurt de aanvraag
  voorlopig naar hetzelfde JotForm als het winterzeil (type "Winternet" in de samenstelling).
  Typefoto's: `winternet-budget.jpeg`, `winternet-basis.jpeg`, `winternet-deluxe.jpeg` in de root.
- `lamellendek.html`: configurator lamellendek (situatie nieuw/vervangen, lamellen, kleur, vorm en
  maten, oprollen, installatie, gegevens). Vervangt het invulscherm van JotForm "Aanvraag formulier
  lamellen" (223043516146347) en stuurt de aanvraag naar datzelfde formulier, inclusief de verborgen
  "(connectie)"-velden, zodat mails en het Freshdesk-ticket gelijk blijven. Foto's in `lamellendek/`.
- `popup.js`: opent alle configurators als venster over een toppy.nl-pagina.
- `stavenafdekking.html`: configurator stavenafdekking (uitvoering, vorm en maten,
  kleur, oprollen, gegevens). Rekent een prijsindicatie zoals de configurator op
  toppy.nl en stuurt de aanvraag naar JotForm "Offerte aanvragen stavenafdekking".

Op toppy.nl (pop-up over de pagina): zet in het hero-blok één regel

```html
<script src="https://ries-h.github.io/toppy-configurators/popup.js" defer></script>
```

en laat de knop linken naar `https://ries-h.github.io/toppy-configurators/stavenafdekking.html`
of `https://ries-h.github.io/toppy-configurators/winterzeil.html`
of `https://ries-h.github.io/toppy-configurators/winternet.html`
of `https://ries-h.github.io/toppy-configurators/lamellendek.html`.
`popup.js` vangt elke link naar die pagina (en elke knop met `data-open-offerte` of
`data-open-configurator`) af en opent de configurator in een venster over de pagina. Zonder
het script opent de link gewoon de losse pagina. Losse iframe kan ook:

```html
<iframe src="https://ries-h.github.io/toppy-configurators/stavenafdekking.html"
        title="Stel je stavenafdekking samen" style="width:100%;height:100vh;border:0"></iframe>
```

De pagina stuurt berichten naar de pagina eromheen (`bron: 'toppy-staven-configurator'`,
type `geladen`, `stap`, `verzonden`, `sluiten`), zodat een modal kan sluiten en de
aanvraag als conversie kan tellen.

## Meten en herkomst (2026-10-27)

- **Conversie:** na een geslaagde aanvraag gaat de bezoeker na 1,5 seconde naar
  `https://www.toppy.nl/bedankt-offerte-aanvraag?configurator=<stavenafdekking|winterzeil|winternet|lamellendek>`
  (lamellendek op de losse pagina: België naar toppy.be, zoals het oude formulier).
  Op die url telt Tag Manager de offerte al (GA4 `offerte_aanvraag`, Meta "offerte aangevraagd").
  In de pop-up doet `popup.js` dat, op de losse pagina de configurator zelf.
  Daarnaast blijft `popup.js` het event `<staven|winter|winternet|lamellen>_configurator_aanvraag` naar de
  dataLayer sturen. Hangt Tag Manager daar later zelf een trigger aan, dan kan het doorsturen weg.
- **Alleen echte aanvragen tellen:** pas als JotForm antwoordt. Na 15 seconden zonder antwoord ziet
  de klant wel het bedankscherm, maar telt er geen conversie en volgt er geen doorsturen.
- **Herkomst:** `popup.js` leest gclid, gbraid, wbraid, fbclid, msclkid en de utm-tags uit de url
  (bewaard 90 dagen, laatste klik wint; anders uit de cookies `_gcl_aw` en `_fbc`) en geeft ze met
  de landingspagina en de huidige pagina mee in de url van de configurator. De configurator zet ze
  onderaan "Samenstelling configurator" (q18) onder het kopje HERKOMST.
- **Eigen veld in Freshdesk:** maak in het JotForm-formulier een verborgen veld "Herkomst" en zet de
  veldnaam (bijv. `q31_herkomst`) bij `herkomstVeld` in de INSTELLINGEN van de configurator.
