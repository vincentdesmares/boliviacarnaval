# Vincent Desmares · @BoliviaCarnaval

Static website showcasing Bolivian dance photography and making every album easy to find.
Plain HTML, CSS and JavaScript: no build step, hosted for free on GitHub Pages.

## Add a new album

1. Add a cover image to `img/covers/` (JPG, about 800×600, under 200 KB). Name it like the album id.
2. Add an entry at the top of `data/albums.json`:

```json
{
  "id": "2025-10-paris-example",
  "title": "Paris - Example",
  "date": "2025-10",
  "country": "France",
  "link": "https://photos.google.com/share/…",
  "photos": 1200,
  "dances": ["Caporales", "Tinku"],
  "groups": ["Caporales San Simon Cochabamba : Filial Francia"],
  "cover": "img/covers/2025-10-paris-example.jpg",
  "featured": false
}
```

- `date` is `YYYY-MM`; albums are sorted newest first.
- `photos` can be `null` when unknown.
- `dances`, `groups` and `country` feed the filters automatically.
- `featured: true` shows the cover in the photo mosaic at the top of the page (keep about 6).

## Edit texts

Spanish texts are in `index.html`; English translations are in the `EN` block at the top of `js/app.js`.

## Filtered links

Filters are kept in the URL, so you can share a link to one group's or one dance's albums, for example
`?dance=Tinku` or `?group=KantutaUSA&year=2024`.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Header
The home page header is a 3D tunnel of album photos (`css/hero3d.css`, `js/hero3d.js`, `js/hero-tunel.js`).
It uses small thumbnails from `img/hero/` (320×240): when you add an album, add its thumbnail there too.
Each photo links to its album. The animation stops when the header is off screen and respects "reduce motion".
