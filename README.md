# Toppy configurators

Losse configuratorpagina's voor toppy.nl, gehost via GitHub Pages.

- `stavenafdekking.html`: configurator stavenafdekking (uitvoering, vorm en maten,
  kleur, oprollen, gegevens). Rekent een prijsindicatie zoals de configurator op
  toppy.nl en stuurt de aanvraag naar JotForm "Offerte aanvragen stavenafdekking".

Op toppy.nl: plak het blok `configurator-modal.html` (in de kennisbank) op de pagina; elke
knop met `data-open-offerte` of `data-open-configurator` opent dan de pop-up. Losse iframe kan ook:

```html
<iframe src="https://ries-h.github.io/toppy-configurators/stavenafdekking.html"
        title="Stel je stavenafdekking samen" style="width:100%;height:100vh;border:0"></iframe>
```

De pagina stuurt berichten naar de pagina eromheen (`bron: 'toppy-staven-configurator'`,
type `geladen`, `stap`, `verzonden`, `sluiten`), zodat een modal kan sluiten en de
aanvraag als conversie kan tellen.

## Meten en herkomst (2026-10-27)

- **Conversie:** na een geslaagde aanvraag gaat de bezoeker na 1,5 seconde naar
  `https://www.toppy.nl/bedankt-offerte-aanvraag?configurator=<stavenafdekking|winterzeil|winternet>`.
  Op die url telt Tag Manager de offerte al (GA4 `offerte_aanvraag`, Meta "offerte aangevraagd").
  In de pop-up doet `popup.js` dat, op de losse pagina de configurator zelf.
  Daarnaast blijft `popup.js` het event `<staven|winter|winternet>_configurator_aanvraag` naar de
  dataLayer sturen. Hangt Tag Manager daar later zelf een trigger aan, dan kan het doorsturen weg.
- **Alleen echte aanvragen tellen:** pas als JotForm antwoordt. Na 15 seconden zonder antwoord ziet
  de klant wel het bedankscherm, maar telt er geen conversie en volgt er geen doorsturen.
- **Herkomst:** `popup.js` leest gclid, gbraid, wbraid, fbclid, msclkid en de utm-tags uit de url
  (bewaard 90 dagen, laatste klik wint; anders uit de cookies `_gcl_aw` en `_fbc`) en geeft ze met
  de landingspagina en de huidige pagina mee in de url van de configurator. De configurator zet ze
  onderaan "Samenstelling configurator" (q18) onder het kopje HERKOMST.
- **Eigen veld in Freshdesk:** maak in het JotForm-formulier een verborgen veld "Herkomst" en zet de
  veldnaam (bijv. `q31_herkomst`) bij `herkomstVeld` in de INSTELLINGEN van de configurator.
