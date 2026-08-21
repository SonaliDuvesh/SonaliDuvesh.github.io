# 💻 Sonali OS — Interactive Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Ubuntu Theme" />
</div>

<br />

**Sonali OS** is a premium, fully interactive Ubuntu-desktop-style portfolio website developed for **Sonali Duvesh** (Data Scientist & Web Developer). It provides an immersive desktop operating system simulation directly inside the browser, complete with a lock screen boot sequence, draggable floating windows, a command line terminal emulator, a customized web browser, audio widgets, and a responsive mobile task-switching layout.

---

## 🌟 Key Features

### 🔒 Authentic Lock Screen Boot Sequence
- Start with a secure Ubuntu-style lock screen showing real-time date/clock overlay.
- Dynamic credential credentials submit card with custom loading and screen-unlock fade transitions.

### 🪟 Advanced Floating Window Manager
- Multitask natively with multiple floating windows that can be **dragged, minimized, maximized, focused, or closed**.
- Realistic active-window borders and visual stacking depths ($Z$-index layered hierarchy).
- Automatic desktop boundary checks to prevent windows from sliding off-screen.

### 📟 Terminal Emulator
- A interactive Unix terminal emulator running a custom command parser.
- Interactive commands:
  - `help`: Lists all available commands.
  - `neofetch`: Renders a custom Sonali OS specs logo and system details.
  - `ls`: List virtual text and shell script files.
  - `cat [file]`: Output text files (`about_me.txt`, `projects.txt`, `contact.txt`, `secret.sh`).
  - `clear`: Clear console history.

### 📂 File Manager with Active Preview Sidebar
- Dynamically fetches and parses the latest repositories from the GitHub API.
- Supports a details sidebar displaying previews, descriptive text, metadata tags, and code links.
- Supports double-clicking folders to load the project's homepage inside the system's browser.

### 🎧 Ambient Music Player
- Custom glassmorphic music control widget.
- Responsive audio waves visualizer reacting when tracks play.
- Complete with playlists, volume controller, progress-bar seeking, track timing, and cover art integration.

### 📱 Responsive Convergence Layout
- Seamless layout reflowing for tablet and mobile screens.
- Replaces complex floating windows on mobile screens with fullscreen card-switching tabs and a back-navigation task switcher.

---

## 🛠️ Technology Stack

- **Structure**: HTML5 (Clean, semantic components layout).
- **Styling**: Tailwind CSS (Utility framework via CDN with custom forms and container query plugins).
- **Custom CSS**: Vanilla CSS (`style.css` containing custom animations, scrollbars, desktop layering rules, and mobile overrides).
- **Logic**: Vanilla ES6+ JavaScript (`script.js` controlling window dynamics, calendar date loops, audio events, terminal parser, browser history, and API network requests).
- **Iconography**: Google Material Symbols Outlined.
- **Typography**: Be Vietnam Pro & JetBrains Mono fonts.

---

## 📁 Codebase Structure

The project follows a clean separation of concerns, separating content structure, style definitions, and functional logic:

```bash
portfolio/
├── index.html       # Clean semantic markup and tailwind classes
├── style.css        # Custom CSS animations, glassmorphism, scrollbars, and mobile overrides
├── script.js        # Core system script containing window manager, terminals, and widgets logic
├── wallpaper.jpg    # High-definition desktop background wallpaper
└── README.md        # Documentation and guide
```

---

## 🚀 Getting Started

To view this portfolio locally, you can serve the directory using a simple HTTP server. 

### Option 1: Python 3
Run this command inside the project directory:
```bash
python3 -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your web browser.

### Option 2: Node.js (npx serve)
Run this command:
```bash
npx serve .
```
Then visit the output URL (typically `http://localhost:3000`).

---

## 🔧 Personalization

To personalize the portfolio for your own name and projects, update the configurations in the source files:

1. **GitHub Repositories**: Update the username in the `fetchGitHubRepos` API fetch endpoint located in `script.js`.
2. **Terminal Info**: Update the text outputs for `neofetch` and `cat about_me.txt` files inside the terminal handler command list in `script.js`.
3. **Contact email & socials**: Update the email, GitHub link, and LinkedIn links in `index.html` and `script.js`.
