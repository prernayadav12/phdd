# PhD Application Season 2027

A one-page static website that tracks deadlines, start terms and funding for 110 fully funded computer science and AI PhD programs worldwide for 2027 entry. The soonest open deadline is always at the top. It needs no server, database or build step.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | The page itself |
| `styles.css` | All styling, with light and dark themes |
| `data.js` | Every program, the plan steps and the start-term table. Edit this one to add or change programs |
| `app.js` | Sorting, filters, countdowns, progress saving, export and import |

## Open it on your computer

Unzip the folder and double-click `index.html`. It works offline, but the fonts need an internet connection (it falls back to system fonts without one).

## Put it online (free)

Pick one:

- **Netlify Drop:** go to https://app.netlify.com/drop and drag the whole unzipped folder onto the page. You get a public link in a few seconds. Sign in if you want to keep it or change the address.
- **GitHub Pages:** create a public repository, upload the four files (`index.html`, `styles.css`, `data.js`, `app.js`) to the main branch, then open **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save. The site appears at `https://<your-username>.github.io/<repository-name>/` after a minute or two.
- **Cloudflare Pages:** create a project, choose **Upload assets**, and upload the folder.

## Your progress

Statuses ("Drafting", "Submitted" and so on) and plan ticks are saved in the browser you use, so they don't follow you to another device or browser on their own. Click **Export progress** to download a `phd-tracker-progress.json` file, then **Import progress** on the other device to load it. If you put the site online, each visitor gets their own separate progress.

## Updating a program

Each program in `data.js` is one line, for example:

```js
{id:"mit", name:"EECS PhD", uni:"MIT", region:"US",
 due:"2026-12-01T23:59:00-05:00", tz:"11:59 pm ET",
 fund:"g", fundTxt:"Funded on admission", v:"annual", fee:"$90",
 url:"https://...", note:"..."}
```

- `id`: a short unique name. Don't change it after you've saved progress, or that program's saved status is lost.
- `due`: the deadline with the university's time zone offset (`-05:00` is US Eastern, `+00:00` is UK winter, `+05:30` is India).
- `region`: one of `US`, `UK`, `Europe`, `Canada`, `Asia`, `Middle East`, `Australia`.
- `fund`: `"g"` if PhD admits are normally funded, `"c"` if you compete for a separate scholarship or position.
- `v`: how sure the date is: `"confirmed"`, `"annual"`, `"lastcycle"` or `"estimate"` (the last two show a red "Check date" tag).
- Optional `early`: an earlier date, such as a fee-discount or fellowship deadline, as `"YYYY-MM-DD"`.

Start terms live in the `INTAKE` table further down `data.js`. A program not listed there is shown as "Fall 2027, other terms not listed".

Dates were last checked on 8 Oct 2026. Always confirm a deadline on the university's own page before you submit.
