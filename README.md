# Plengsen Pop

A relaxed, family-inspired match-3 game for phones, tablets, and desktop browsers. The name combines **Plengnok + Eriksen = Plengsen**.

Built with React, JavaScript, and Vite, with original SVG artwork and a Danish and Thai interface. The production build is a static web app with installable PWA and offline support. No backend or database is required.

## Features

- A responsive 7 × 7 board with touch, mouse, and keyboard controls.
- Cascading matches with score multipliers up to ×5.
- Progressively higher level goals, 24 moves per round, and no time limit.
- Free hints and automatic board replacement when no moves are available.
- Fruit, Denmark, and Thailand themes, with automatic or manual theme selection.
- Optional sound effects.
- Progress, preferences, and best score saved locally in the browser.
- Home screen installation and offline play in the production build.

## Getting started with Docker

You need Git and Docker with the Compose plugin. Docker handles the Node.js environment and dependencies.

```sh
git clone https://github.com/SoftAllan/plengsen-pop.git
cd plengsen-pop
docker compose --profile dev up --build dev
```

Open [http://localhost:5173](http://localhost:5173).

The project directory is mounted into the development container, so source changes appear automatically. Dependencies are stored in the `dev_dependencies` named volume. The first start downloads the dependencies; subsequent starts reuse that volume. Keep `package-lock.json` in version control so production builds use the locked dependency versions.

To try the game on a phone or tablet, connect it to the same network and open `http://<development-host-ip>:5173`. The host must allow incoming connections on that port. Use the development server on a trusted development network.

Stop the server with Ctrl+C. To remove the development container and its network:

```sh
docker compose --profile dev down
```

## Developing without Docker

Alternatively, install Node.js 24 and npm, then run these commands from the cloned repository:

```sh
npm ci
npm run dev
```

The development server is available at [http://localhost:5173](http://localhost:5173).

## How to play

1. Swipe a tile toward a neighbour, or select two adjacent tiles. With a keyboard, use the arrow keys to move focus and Enter or Space to select tiles.
2. Form a horizontal or vertical line of at least three identical tiles. Each matched tile is worth 10 points. Swaps without a match do not use a move.
3. New tiles fall into the empty spaces. Further matches create a cascade, increasing the multiplier from ×2 up to ×5.
4. Reach the score goal within 24 moves to advance. Level 1 starts at 700 points, and each new level adds 150 points to the goal.

Hints are free. If the board has no legal moves, it is replaced automatically without changing the score or using an additional move.

The default theme is the fruit garden. Automatic theme selection introduces Denmark on levels 4, 12, 20, and so on, and Thailand on levels 8, 16, 24, and so on. A fixed theme can be selected in settings.

## Production deployment

### Run with Docker Compose

From the repository directory:

```sh
docker compose --profile prod up --build -d game
```

Open [http://localhost:8080](http://localhost:8080), or use the deployment host's address.

The production image serves the built files with Nginx on container port **8080**. It runs as the Nginx user, with a read-only filesystem and temporary storage mounted at `/tmp` by Compose.

To change the published ports, create a local `.env` file in the repository root with either or both settings:

```dotenv
DEV_PORT=5174
PORT=8081
```

The defaults are 5173 for development and 8080 for production. The `.env` file is ignored by Git.

### Build and run an image directly

Run these commands from your cloned repository. They build a new image locally from your source files, then start a container from that image. `--target production` selects the production stage in the Dockerfile. `plengsen-pop:0.1.0` is an example image name and tag; you can change it as long as you use the same value in both commands.

```sh
docker build --target production -t plengsen-pop:0.1.0 .
docker run -d --name plengsen-pop --restart unless-stopped \
  -p 8080:8080 --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
  --cap-drop ALL --security-opt no-new-privileges:true plengsen-pop:0.1.0
```

You can build on the deployment host or distribute the image through a container registry. When building on a different CPU architecture, use Docker Buildx with the target platform, such as `--platform linux/amd64`.

### Host the static build

With Node.js and npm installed:

```sh
npm ci
npm run build
```

Deploy the contents of `dist/` to a static web host. The build includes the generated service worker and all assets required for offline play. `npm run preview` serves the production build locally for checking before deployment.

### HTTPS and access

For a hosted installation, serve the game over HTTPS, either through your hosting provider or a reverse proxy in front of the container. Service workers and offline features require HTTPS, except on `localhost`. An HTTP address on a local network supports online play but does not provide the full PWA experience.

The game has no authentication. If you want to restrict access to an installation, configure access control at the hosting, reverse proxy, or network level.

## Installation, offline play, and saved progress

- **iPhone and iPad:** open the HTTPS address in Safari and use Share → Add to Home Screen.
- **Android:** open the address in Chrome and use its menu to install the app or add it to the home screen. Menu wording varies by browser version.
- Open the production build online first and allow its service worker to install before playing offline. The development server does not register a service worker.
- Updates are downloaded while online. If an installed copy still shows an older version, close its windows or tabs and reopen it.
- Progress is saved after a move finishes. Reloading during an animation restores the last completed move.
- Saves use the browser's `localStorage` and belong to that browser and origin. They do not sync between devices. Clearing site data may erase them, and changing the hosting address creates a separate save location.

## Tests

With the development container running:

```sh
docker compose exec dev npm test
```

Or with local dependencies installed:

```sh
npm test
```

The tests cover board generation, legal moves, overlapping matches, gravity, cascades, and saved-game validation.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/game.js` | Game rules, match detection, legal moves, gravity, and board generation |
| `src/App.jsx` | Interface, input handling, and animations |
| `src/art.jsx` | Original SVG tiles and icons |
| `src/i18n.js` | Danish and Thai interface text |
| `src/storage.js` | Local saves and saved-game validation |
| `src/styles.css` | Responsive layout and animations |
| `public/` | App manifest and installation icons |
| `scripts/build-sw.mjs` | Service worker generation and offline cache versioning |
| `scripts/make-icons.mjs` | Optional PNG icon generation from `public/icon.svg` |
| `test/` | Game and storage tests using the Node.js test runner |
| `Dockerfile` | Development, build, and production image stages |
| `compose.yaml` | Development and production services |
| `docker/nginx.conf` | Production web server configuration |

PNG installation icons are included in the repository. Regenerating them with `scripts/make-icons.mjs` requires the optional `sharp` package; normal development and production builds use the existing icons.

## Contributing

Bug reports, gameplay ideas, and translation improvements are welcome through GitHub issues and pull requests. For a bug report, include the browser, device, interface language, and steps needed to reproduce the issue. The Thai translations are an initial draft and would benefit from review by native speakers.

Possible future additions include special tiles, more varied level goals, player profiles, shared high scores, and optional progress synchronisation.

## License

The original project code, artwork, and documentation are licensed under the [MIT License](LICENSE). You may use, modify, and redistribute them, including commercially, provided you retain the copyright and license notices.

Production builds include a copy of `LICENSE`. Third-party dependencies and container base images retain their respective licenses.
