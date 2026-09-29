# Segue

Segue is a desktop app for Windows and Linux that turns a folder of songs into a continuous, DJ-style mix. It listens to every track, puts them in the order that flows best, and plays the set with beat-matched transitions. Everything runs locally; no audio leaves your computer.

<p align="center">
  <a href="https://github.com/chamitro/segue/releases/latest/download/Segue-Setup.exe"><img alt="Download for Windows" src="https://img.shields.io/badge/Download-Windows%20installer-0078D6?style=for-the-badge&logo=windows&logoColor=white"></a>
  <a href="https://github.com/chamitro/segue/releases/latest/download/Segue-linux-amd64.deb"><img alt="Download for Ubuntu" src="https://img.shields.io/badge/Download-Ubuntu%20(.deb)-E95420?style=for-the-badge&logo=ubuntu&logoColor=white"></a>
</p>
<p align="center">·
  <a href="https://github.com/chamitro/segue/releases">All releases</a>
</p>


## What it does

**Analysis.** For each song Segue estimates tempo, beat strength, rhythmic density, musical key (shown in Camelot notation, e.g. 8A) and a relative energy level. It also maps the song's structure in 16-beat phrases: intro, main sections, breakdowns and outro.

**Ordering.** Every pair of songs gets a transition cost from tempo difference (half/double-time aware), key compatibility on the Camelot wheel and the jump in energy. A local search finds the order with the smoothest total flow. You can weight tempo, key and energy, choose the shape of the set (smoothest, build up, peak then ease, wind down) and pin the opener.

**Transitions.** Each change is planned on the audio clock:
- *Beat-matched blend* when tempos are close: the next song enters on a downbeat aligned with a phrase boundary of the current one, is nudged to the same tempo, and the basslines swap halfway through.
- *Cut on the downbeat* when both songs have a strong beat but very different tempos.
- *Fade* when a song has no steady beat, or in Simple mode.

**Dynamic song length.** Pace (Full songs → Rapid) or "Fit this set into N minutes" decides how much of each song plays. Each song keeps its strongest sections and leaves at a natural point such as the start of a breakdown; energetic songs mid-set move on sooner and the opener and closer get more room. The next song comes in near its beginning, at the point that best fits how the previous song is leaving.

**Sets.** Build several sets in tabs, prepare the next one while another plays, and let playback continue from one set into the next.

## Download

Click a button at the top of this page, or pick a file from [Releases](https://github.com/chamitro/segue/releases).

- **Windows:** run `Segue-Setup.exe` to install, or run `Segue-portable.exe` without installing. SmartScreen may warn because the app isn't code-signed: choose *More info -> Run anyway*.
- **Ubuntu / Debian:** open the downloaded `.deb` with *App Center*, or run `sudo apt install ./Segue-linux-amd64.deb`. Segue then appears in your applications menu; you can also start it with `segue` in a terminal.
- **Other Linux:** make the `.AppImage` executable (`chmod +x Segue-linux-x86_64.AppImage`) and run it.

## Run from source

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

## Build

```bash
npm run dist:win     # on Windows: installer, portable exe and zip
npm run dist:linux   # on Linux: .deb for Ubuntu/Debian and AppImage
```

Output goes to `dist/`. Pushing a tag such as `v1.4.2` runs the GitHub Actions workflow, which builds the Windows and Linux apps on GitHub's servers and publishes them as a GitHub release; the download buttons always point to the newest one.

## How the code is organised

- `main.js` – application window, native file and folder dialogs, recursive folder scanning
- `preload.js` – narrow bridge that lets the page pick and read audio files
- `app/index.html` – the whole interface, audio analysis (runs in a background worker), ordering and the playback engine. It also works on its own in a browser.

## Limitations

- Beat and phrase detection assumes a steady tempo in 4/4; live recordings with drifting tempo or songs in 3/4 get cuts or fades rather than blends.
- Tempo matching changes pitch slightly (about one semitone at 6%), like a turntable. Lower the tempo sync range if you notice it.
- Segue can't hear vocals, so it may occasionally leave a song mid-line; staying on phrase boundaries makes this rare.

## License

MIT. The bundled fonts (Figtree, Bricolage Grotesque) are under the SIL Open Font License.
