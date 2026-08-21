# Plant Locator v2

Password-protected phone web app: live GPS position on your plant map, asset-number search
("navigation of sorts"), steadied by an adaptive filter. Runs from GitHub Pages, installs to the
home screen, works offline after first load. Location is computed by the phone's OS and never
leaves the page.

## Files that go in the GitHub repo

| File | Purpose |
|---|---|
| `index.html` | The entire app |
| `map.enc` | Your map (printed machine numbers erased — the app draws them live), AES-256 encrypted |
| `assets.enc` | Encrypted asset list (143 machine numbers auto-read off the map) |
| `encrypt.html` | Tool to (re-)encrypt a map / change the password (contains no secrets) |
| `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png` | Offline cache + home-screen install |
| `README.md` | This file |

**Do NOT upload** `map-clean-KEEP-OFF-GITHUB.png` — that's your unencrypted map (machine
numbers erased). Keep it on your computer; you'll need it if you ever change the password
(open `encrypt.html`, pick it, type the new password, upload the new `map.enc`).

## Deploying / redeploying

1. If replacing the old version: repo Settings → scroll to the bottom → **Delete this repository**
   (this also wipes the old unencrypted `map.png` from history). Then create a new **public** repo
   with the **same name** so the URL doesn't change.
2. Upload the repo files above, commit.
3. Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save. (Pages settings do not
   carry over to a recreated repo — set them again.)
4. On any phone that used the old version: open the site, then **close and reopen it once** — the
   first open installs the update, the second one runs it.

## Password

- One password unlocks everything; each phone remembers it after the first entry.
- Menu → **Lock — forget password on this phone** makes it ask again (for shared phones).
- Wrong password = the map stays unreadable noise. There is no recovery — but nothing is lost:
  re-encrypt from your original PNG with `encrypt.html`.
- After changing the password: everyone types the new one once; then, on a phone that has the
  assets, Menu → **Export assets file** and upload the new `assets.enc` (it's encrypted with the
  password too).
- Honest limit: the code is public, only the data is encrypted. The password is the whole wall —
  someone who can guess it gets the map.

## Calibration (first-run guide walks you through this)

Go to **two doorways (or step just outside) at opposite ends of the building** — GPS is strongest
there and outdoor points position you correctly indoors. At each: Menu → Add calibration point →
tap your exact spot on the map → hold still ~30 s → Save. A 3rd point makes the app cross-check
itself and show a fit error in feet; if one point shows a big "off by" value, delete and redo it. At 5+ well-spread points the app
automatically switches to a tighter 6-parameter "precision fit."
Calibration is per-phone and survives closing the app.

## Assets

- The machine numbers you see on the map are drawn live from the asset list (the printed ones
  were erased from the image) — so **Add places a number on the map, Move moves it, Delete
  removes it**. A menu checkbox hides them all if you want a clean map.
- **Find** (bottom bar): type a number → tap the match → the map jumps there with a blinking pink
  marker. While tracking, a dashed route follows the corridors to it and the chip shows the
  walking distance along that route ("… ft walk"), recalculating as you move. The router reads
  the map's colors (white = corridor, colored = department), so it prefers corridors but can cut
  into a department for the last leg — it doesn't know where doors are, so treat it as
  "go this way," not exact steps. If routing isn't possible (no calibration yet), it falls back
  to a straight dashed line and straight-line feet. The Find and manage
  lists stay empty until you type, so hundreds of assets never make them long.
- **Menu → Add / tag assets**: type a number, tap its spot, then **drag the pin** to fine-tune
  (or tap elsewhere to jump it) and hit Save — it immediately asks for the next number, so you
  can tag dozens in one walk. Typing an existing number drops a draggable pin on it to move it,
  as does Move in the asset list. The calibration pin drags the same way.
- Tags save on the phone instantly. To share them (or back them up): Menu → **Export assets file**,
  then upload that `assets.enc` to the repo. Other phones pick it up via Menu → **Reload assets
  from the website file** (or automatically on a fresh install).
- The pre-loaded numbers were read off the map automatically — spot-check them; Move/Delete
  fixes any that landed off.
- When you make a better map later: re-encrypt it as `map.enc`. If it's the same layout at a
  different resolution, asset spots scale over automatically; if the layout itself changed,
  re-tag what moved.

## RTU air unit map

Menu → **Show RTU air unit map** swaps the view: department colors blank out to the bare
building outline, and every rooftop/air unit (with its name and number) appears at its true
location — registered onto the exact same pixel frame, so your calibration, live dot,
corridor routing, and asset Find all keep working on it. Asset number labels and department
selection hide in this view; the same button switches back. `rtu.enc` is encrypted with the
same password; keep `rtu-map-KEEP-OFF-GITHUB.png` offline with your other master, and after a
password change re-encrypt it with encrypt.html and rename the download to `rtu.enc`.

## Departments

Tap a legend swatch or any colored block on the map (or open **Find** — department chips are
listed there, and typing letters matches names). All of that department's areas blink with a
pink highlight and the view zooms to fit them; ✕ on the chip clears it. Selecting an asset
and selecting a department are exclusive — one thing blinks at a time. The large mint-green
area isn't in the legend, so it isn't selectable.

## The steadier dot

Raw GPS jumps around; the app now runs an adaptive filter: standing still, it averages harder and
harder and the dot settles (status shows "avg"); when your position genuinely starts drifting, it
drops the average and follows with a couple seconds of lag. Garbage fixes (terrible accuracy,
physically impossible teleports) are discarded. **Menu → Enable motion & compass** makes it
noticeably better: the accelerometer locks the dot when the phone is physically still and reacts
faster when you start walking. The translucent circle is still the GPS's own honest uncertainty —
believe the circle.

## Updates not showing up?

Files are cached for offline use, so updates normally land on the *second* open after an upload
(first open downloads, second one runs). If a phone still shows old data: **Menu → Force fresh
update** wipes the app/site cache and re-downloads everything — tags, calibration, and the
remembered password are kept. "Reload assets from the website file" also now bypasses every
cache layer.

## If location is blocked (especially iPhone)

Tap the GPS status in the top-left for the built-in checklist. Short version: Settings → Privacy &
Security → Location Services ON → **Safari Websites** → While Using + Precise ON; then on the page,
aA → Website Settings → Location → Allow. Test in plain Safari before using the home-screen icon.

## Known limits

- Indoors under a steel roof, GPS may be ±50–160 ft or absent; the accuracy circle tells the truth.
  Browsers cannot scan Wi-Fi or Bluetooth beacons — real indoor positioning would need a native
  app plus beacon hardware.
- The screen must stay on while tracking (the app holds a wake lock); phones don't give web pages
  GPS in the background.
- The compass wedge is approximate and steel structure skews it.
