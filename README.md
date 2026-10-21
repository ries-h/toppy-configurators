# Toppy configurators

Losse configuratorpagina's voor toppy.nl, gehost via GitHub Pages.

- `stavenafdekking.html`: configurator stavenafdekking (uitvoering, vorm en maten,
  kleur, oprollen, gegevens). Rekent een prijsindicatie zoals de configurator op
  toppy.nl en stuurt de aanvraag naar JotForm "Offerte aanvragen stavenafdekking".

- `demo.html`: demo van de pop-up (knop opent de configurator over de pagina).

Op toppy.nl: plak het blok `configurator-modal.html` (in de kennisbank) op de pagina; elke
knop met `data-open-offerte` of `data-open-configurator` opent dan de pop-up. Losse iframe kan ook:

```html
<iframe src="https://ries-h.github.io/toppy-configurators/stavenafdekking.html"
        title="Stel je stavenafdekking samen" style="width:100%;height:100vh;border:0"></iframe>
```

De pagina stuurt berichten naar de pagina eromheen (`bron: 'toppy-staven-configurator'`,
type `geladen`, `stap`, `verzonden`, `sluiten`), zodat een modal kan sluiten en de
aanvraag als conversie kan tellen.
