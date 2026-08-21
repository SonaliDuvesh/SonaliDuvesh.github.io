// Clock top bar & lock screen updater
function updateClocks() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12 instead of 0
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);

    // Update lock screen
    document.getElementById('lock-clock').textContent = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${minutes}`;
    document.getElementById('lock-date').textContent = dateStr;

    // Update top bar
    const weekdayShort = now.toLocaleDateString('en-US', { weekday: 'short' });
    const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = now.getDate();
    document.getElementById('topbar-clock').textContent = `${weekdayShort} ${monthShort} ${dayNum}  ${hours}:${minutes} ${ampm}`;

    // Update calendar dropdown time/date
    const calTime = document.getElementById('calendar-time');
    if (calTime) calTime.textContent = `${hours}:${minutes} ${ampm}`;
    const calDate = document.getElementById('calendar-full-date');
    if (calDate) calDate.textContent = dateStr;
}
setInterval(updateClocks, 1000);
updateClocks();

// Lock / Unlock animations
function unlockOS(event) {
    if (event) event.preventDefault();
    const passwordField = document.getElementById('password-input');
    const loading = document.getElementById('loading-indicator');
    const form = document.getElementById('login-form');
    const lockScreen = document.getElementById('lock-screen');

    // Hide form and show loading
    form.style.display = 'none';
    loading.classList.remove('hidden');

    setTimeout(() => {
        // Fade out Lock screen
        lockScreen.classList.add('opacity-0');
        lockScreen.classList.add('pointer-events-none');
        
        // Show floating settings window as default stack transition
        setTimeout(() => {
            openWindow('about-window');
        }, 500);
    }, 1200);
}

function lockOS() {
    const lockScreen = document.getElementById('lock-screen');
    const loading = document.getElementById('loading-indicator');
    const form = document.getElementById('login-form');
    const passwordField = document.getElementById('password-input');

    // Reset forms
    form.style.display = 'block';
    loading.classList.add('hidden');
    passwordField.value = '';

    // Bring Lock overlay
    lockScreen.classList.remove('opacity-0');
    lockScreen.classList.remove('pointer-events-none');
    hideSystemMenu();
}

// Dropdown System Menu toggler
function toggleSystemMenu() {
    const menu = document.getElementById('system-dropdown');
    menu.classList.toggle('hidden');
}
function hideSystemMenu() {
    const menu = document.getElementById('system-dropdown');
    menu.classList.add('hidden');
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
    const menu = document.getElementById('system-dropdown');
    const clock = document.getElementById('topbar-clock');
    const rightControls = clock.nextElementSibling;
    const calMenu = document.getElementById('calendar-dropdown');
    
    if (menu && rightControls && !menu.contains(e.target) && !rightControls.contains(e.target)) {
        hideSystemMenu();
    }
    if (calMenu && clock && !calMenu.contains(e.target) && !clock.contains(e.target)) {
        hideCalendarMenu();
    }
});

// ==================== FLOATING WINDOW ENGINE ====================
let windowsFocusStack = [];
let highestZ = 10;

function updateBodyWindowState() {
    const openWindows = Array.from(document.querySelectorAll('.app-window')).filter(win => 
        !win.classList.contains('hidden') && !win.classList.contains('minimized')
    );
    if (openWindows.length > 0) {
        document.body.classList.add('window-open');
    } else {
        document.body.classList.remove('window-open');
    }
}

function openWindow(winId) {
    const win = document.getElementById(winId);
    win.classList.remove('hidden');
    win.classList.remove('minimized');
    
    // Bring to focus
    focusWindow(winId);
    
    // Highlight dock indicator
    const indicatorId = winId.replace('-window', '-indicator');
    const indicator = document.getElementById(indicatorId);
    if (indicator) indicator.classList.remove('hidden');

    // Reflow layout check
    handleMobileViewReflow();

    // Toggle body class for mobile dock auto-hide
    updateBodyWindowState();
}

function closeWindow(winId) {
    const win = document.getElementById(winId);
    win.classList.add('hidden');
    
    // Hide dock indicator
    const indicatorId = winId.replace('-window', '-indicator');
    const indicator = document.getElementById(indicatorId);
    if (indicator) indicator.classList.add('hidden');

    updateBodyWindowState();
}

function minimizeWindow(winId) {
    const win = document.getElementById(winId);
    win.classList.add('minimized');

    updateBodyWindowState();
}

function toggleWindow(winId) {
    const win = document.getElementById(winId);
    if (win.classList.contains('hidden') || win.classList.contains('minimized')) {
        openWindow(winId);
    } else {
        minimizeWindow(winId);
    }
}

function maximizeWindow(winId) {
    const win = document.getElementById(winId);
    win.classList.toggle('maximized');
}

function focusWindow(winId) {
    const win = document.getElementById(winId);
    highestZ += 1;
    win.style.zIndex = highestZ;
    
    // Style active border outline (visual cue)
    document.querySelectorAll('.app-window').forEach(w => {
        w.classList.remove('border-brand-orange/50', 'shadow-2xl');
        w.classList.add('border-black/15');
    });
    win.classList.remove('border-black/15');
    win.classList.add('border-brand-orange/50', 'shadow-2xl');
}

// Draggable window implementation
document.querySelectorAll('.app-window').forEach(win => {
    const header = win.querySelector('.window-header');
    
    // Focus on click
    win.addEventListener('mousedown', () => {
        focusWindow(win.id);
    });

    // Double click header to maximize
    header.addEventListener('dblclick', () => {
        if (window.innerWidth >= 768) {
            maximizeWindow(win.id);
        }
    });

    // Drag mouse handler
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
        // Return if click is on buttons
        if (e.target.tagName === 'BUTTON' || e.target.parentElement.tagName === 'BUTTON') return;
        // Return if window is maximized
        if (win.classList.contains('maximized') || window.innerWidth < 768) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Parse current position
        initialX = parseInt(win.style.left) || 100;
        initialY = parseInt(win.style.top) || 100;

        win.style.transition = 'none'; // Disable animate during dragging
        focusWindow(win.id);
        
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    });

    function dragMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // Bound check values to prevent offscreen limits
        let newLeft = initialX + dx;
        let newTop = initialY + dy;

        if (newTop < 48) newTop = 48; // Prevent titlebar under top bar
        
        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
    }

    function dragEnd() {
        isDragging = false;
        win.style.transition = ''; // Restore animation transitions
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }
});

// Mobile responsiveness adapter: maximize windows automatically on small screens
function handleMobileViewReflow() {
    const isMobile = window.innerWidth < 768;
    document.querySelectorAll('.app-window').forEach(win => {
        if (isMobile) {
            win.classList.add('maximized');
            // Hide desktop controls, show mobile controls
            const dControls = win.querySelector('.window-controls-desktop');
            const mControls = win.querySelector('.window-controls-mobile');
            if (dControls) dControls.classList.add('hidden');
            if (mControls) mControls.classList.remove('hidden');
        } else {
            win.classList.remove('maximized');
            // Restore desktop layout controls
            const dControls = win.querySelector('.window-controls-desktop');
            const mControls = win.querySelector('.window-controls-mobile');
            if (dControls) dControls.classList.remove('hidden');
            if (mControls) mControls.classList.add('hidden');
        }
    });
}
window.addEventListener('resize', handleMobileViewReflow);
// Run once on launch
handleMobileViewReflow();

// ==================== APP: ABOUT ME (SETTINGS) TAB CONTROL ====================
function switchSettingsTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    // Display active tab content
    document.getElementById(tabId).classList.remove('hidden');

    // Reset navigation indicators for desktop sidebar
    const desktopButtons = document.querySelectorAll('#about-window .window-sidebar-desktop .tab-btn');
    desktopButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-white/10', 'border-brand-orange');
        btn.classList.add('border-transparent');
    });

    // Find and activate the correct desktop button
    const activeDesktopBtn = Array.from(desktopButtons).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId));
    if (activeDesktopBtn) {
        activeDesktopBtn.classList.remove('border-transparent');
        activeDesktopBtn.classList.add('active', 'bg-white/10', 'border-brand-orange');
    }

    // Reset and activate mobile navigation indicators
    const mobileButtons = document.querySelectorAll('#about-window .window-sidebar-mobile button');
    mobileButtons.forEach(btn => {
        btn.classList.remove('text-white', 'scale-110');
        btn.classList.add('text-white/60');
    });

    const activeMobileBtn = Array.from(mobileButtons).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId));
    if (activeMobileBtn) {
        activeMobileBtn.classList.remove('text-white/60');
        activeMobileBtn.classList.add('text-white', 'scale-110');
    }
}

// ==================== APP: FILES (PROJECTS) PROPERTY SELECTION ====================
let selectedFolderUrl = "https://github.com/SonaliDuvesh";

function selectFolder(title, tagsStr, desc, imgSrc, url) {
    const isMobile = window.innerWidth < 768;
    selectedFolderUrl = url || "https://github.com/SonaliDuvesh";
    
    if (isMobile) {
        // Mobile layout uses pop-up overlay panel
        const popup = document.getElementById('file-details-popup');
        if (popup) {
            popup.classList.remove('hidden');
            popup.classList.add('flex');
        }
        
        const titleMobile = document.getElementById('folder-detail-title-mobile');
        if (titleMobile) titleMobile.innerText = title;
        const descMobile = document.getElementById('folder-detail-desc-mobile');
        if (descMobile) descMobile.innerText = desc;
    } else {
        // Desktop uses right-side sidebar panel
        const sidebar = document.getElementById('file-details-sidebar');
        if (sidebar) sidebar.classList.remove('hidden');
        
        const detailTitle = document.getElementById('folder-detail-title');
        if (detailTitle) detailTitle.innerText = title;
        const detailDesc = document.getElementById('folder-detail-desc');
        if (detailDesc) detailDesc.innerText = desc;
        const detailImg = document.getElementById('folder-detail-img');
        if (detailImg) detailImg.src = imgSrc;

        const tagsContainer = document.getElementById('folder-detail-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            tagsStr.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider';
                span.innerText = tag.trim();
                tagsContainer.appendChild(span);
            });
        }
    }

    // Visual feedback border overlay for selected folder
    const folderIcons = document.querySelectorAll('.folder-icon');
    folderIcons.forEach(icon => {
        icon.classList.remove('bg-brand-canvasGray', 'border-brand-orange/20');
    });
    
    // Search for active folder based on title match
    const activeFolder = Array.from(folderIcons).find(icon => {
        const onClickVal = icon.getAttribute('onclick') || '';
        return onClickVal.toLowerCase().includes(title.toLowerCase());
    });
    if (activeFolder) {
        activeFolder.classList.add('bg-brand-canvasGray', 'border-brand-orange/20');
    }
}

function launchSelectedFolder() {
    if (selectedFolderUrl) {
        navigateBrowser(selectedFolderUrl);
        openWindow('browser-window');
    }
}

async function fetchGitHubRepos() {
    try {
        const res = await fetch('https://api.github.com/users/SonaliDuvesh/repos?sort=updated');
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
            renderRepos(data);
        }
    } catch (err) {
        console.log("GitHub API Fetch failed, keeping fallback projects list:", err);
    }
}

function renderRepos(repos) {
    const grid = document.getElementById('project-folders-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    repos.forEach(repo => {
        const name = repo.name;
        const lang = repo.language || 'Code';
        const desc = (repo.description || 'No description provided.')
            .replace(/'/g, "\\'")
            .replace(/"/g, '&quot;');
        const homepage = repo.homepage || repo.html_url;
        const imgSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
        
        const folderDiv = document.createElement('div');
        const escapedName = name.replace(/'/g, "\\'");
        const escapedLang = lang.replace(/'/g, "\\'");
        
        folderDiv.className = 'folder-icon flex flex-col items-center p-3 rounded-xl hover:bg-brand-canvasGray border border-transparent hover:border-black/5 cursor-pointer text-center group transition w-full overflow-hidden';
        folderDiv.setAttribute('onclick', `selectFolder('${escapedName}', '${escapedLang}', '${desc}', '${imgSrc}', '${homepage}')`);
        folderDiv.setAttribute('ondblclick', 'launchSelectedFolder()');
        
        folderDiv.innerHTML = `
            <span class="material-symbols-outlined text-[54px] text-brand-orange/80 group-hover:scale-105 transition duration-200">folder</span>
            <span class="text-xs font-semibold text-brand-charcoal mt-1 group-hover:text-brand-orange w-full truncate block px-1" title="${name}">${name}</span>
        `;
        grid.appendChild(folderDiv);
    });

    // Automatically select the first dynamically loaded folder
    const firstFolder = grid.querySelector('.folder-icon');
    if (firstFolder) firstFolder.click();
}

// Fetch on load
fetchGitHubRepos();

function closeFolderDetails() {
    document.getElementById('file-details-sidebar').classList.add('hidden');
    document.querySelectorAll('.folder-icon').forEach(icon => {
        icon.classList.remove('bg-brand-canvasGray', 'border-brand-orange/20');
    });
}

function closeFolderDetailsMobile() {
    document.getElementById('file-details-popup').classList.add('hidden');
    document.querySelectorAll('.folder-icon').forEach(icon => {
        icon.classList.remove('bg-brand-canvasGray', 'border-brand-orange/20');
    });
}

// Select first folder on window load (default state)
setTimeout(() => {
    const firstFolder = document.querySelector('.folder-icon');
    if (firstFolder) firstFolder.click();
}, 1000);

// ==================== APP: CONTACT MESSAGE SUBMIT ====================
function submitContactForm(e) {
    e.preventDefault();
    const successMsg = document.getElementById('contact-success');
    successMsg.classList.remove('hidden');
    e.target.reset();
    setTimeout(() => {
        successMsg.classList.add('hidden');
    }, 3000);
}

// ==================== APP: TERMINAL ENGINE ====================
function focusTerminalInput() {
    document.getElementById('terminal-input').focus();
}

function handleTerminalCommand(e) {
    if (e.key !== 'Enter') return;
    
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const command = input.value.trim();
    const commandLower = command.toLowerCase();

    // Append entered prompt
    const promptDiv = document.createElement('div');
    promptDiv.className = 'flex items-center gap-1 mt-2';
    promptDiv.innerHTML = `<span class="text-[#859900]">sonali@sonali-os</span><span class="text-[#D33682]">:</span><span class="text-[#268BD2]">~$</span> <span class="text-white select-text">${command}</span>`;
    history.appendChild(promptDiv);

    // Execute command logics
    const outputDiv = document.createElement('div');
    outputDiv.className = 'text-white/80 select-text font-mono mt-1 whitespace-pre-wrap';

    if (commandLower === '') {
        // Do nothing
    } else if (commandLower === 'clear') {
        history.innerHTML = '';
    } else if (commandLower === 'help') {
        outputDiv.textContent = `Sonali OS Terminal Commands:
  help      - Show available terminal commands
  neofetch  - Display system parameters & specs logo
  ls        - List directory files
  cat [file]- Output text file content
  clear     - Wipe shell logs history`;
    } else if (commandLower === 'ls') {
        outputDiv.innerHTML = `<span class="text-[#268BD2] font-bold">about_me.txt</span>    <span class="text-[#268BD2] font-bold">projects.txt</span>    <span class="text-[#268BD2] font-bold">contact.txt</span>    <span class="text-green-500 font-bold">secret.sh</span>`;
    } else if (commandLower === 'neofetch') {
        outputDiv.innerHTML = `
<span class="text-brand-orange font-bold">       ..---..       </span>  <span class="text-brand-orange font-bold">sonali@sonali-os</span>
<span class="text-brand-orange font-bold">     .'       '.     </span>  ----------------
<span class="text-brand-orange font-bold">    /   Sonali  \\    </span>  OS: Sonali OS v1.0.0 (converged-edition)
<span class="text-brand-orange font-bold">   |    Duvesh   |   </span>  Kernel: x86_64 Linux 6.2.0-generic
<span class="text-brand-orange font-bold">   |    Active   |   </span>  Uptime: 2 years, 6 months
<span class="text-brand-orange font-bold">    \\           /    </span>  Shell: bash 5.1.16
<span class="text-brand-orange font-bold">     '.       .'     </span>  Resolution: 2560x2048
<span class="text-brand-orange font-bold">       ''---''       </span>  DE: GNOME 44.0 (Convergence Humanist Theme)
                       CPU: Apple M3 Max virtualized 10 Cores
                       Memory: 64GB DDR5 / virtualized
`;
    } else if (commandLower.startsWith('cat ')) {
        const targetFile = commandLower.slice(4).trim();
        if (targetFile === 'about_me.txt') {
            outputDiv.textContent = `Sonali Duvesh — Data Scientist & Web Developer
------------------------------------------------
Driven by curiosity and continuous improvement.
Pursuing BS in Data Science & Applications at IIT Madras (IITM).
Passionate about machine learning, computer vision, and backend APIs.`;
        } else if (targetFile === 'projects.txt') {
            outputDiv.textContent = `Projects Directory:
-------------------
- allMomentMatters (JavaScript):
  Computer vision match analytics for racket sports player tracking.
- Placement_Portal_Vue (Flask, VueJS):
  Recruitment portal utilizing SQLite, Redis, and Celery jobs.
- SecretWallpaper (Python, Pillow):
  Generates image wallpapers with hidden pixel pattern mosaics.`;
        } else if (targetFile === 'contact.txt') {
            outputDiv.textContent = `Contact Info:
-------------
- Email:    sonaliduvesh@gmail.com
- GitHub:   https://github.com/SonaliDuvesh
- LinkedIn: https://www.linkedin.com/in/sonali-duvesh/`;
        } else if (targetFile === 'secret.sh') {
            outputDiv.className = 'text-yellow-500 font-bold font-mono mt-1';
            outputDiv.textContent = `[Warning] Accessing easter egg script...
Initializing gravity inversion...
TypeError: Antigravity module loaded successfully!
(Hint: You are paired with the Antigravity AI assistant right now!)`;
        } else {
            outputDiv.className = 'text-red-500 font-mono mt-1';
            outputDiv.textContent = `cat: ${targetFile}: No such file in directories.`;
        }
    } else {
        outputDiv.className = 'text-red-500 font-mono mt-1';
        outputDiv.textContent = `sonali-bash: command not found: ${command}. Type 'help' for command list.`;
    }

    if (commandLower !== 'clear') {
        history.appendChild(outputDiv);
    }

    // Reset input and scroll down terminal window
    input.value = '';
    const scrollContainer = history.parentElement;
    setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 10);
}

// ==================== APP: CALCULATOR ENGINE ====================
let calcExpression = "";
function pressCalc(val) {
    const screen = document.getElementById("calc-screen");
    if (val === 'C') {
        calcExpression = "";
        screen.textContent = "0";
    } else if (val === '=') {
        try {
            if (calcExpression.trim() === "") return;
            // Sanitize math string
            const sanitized = calcExpression.replace(/[^0-9+\-*/().]/g, '');
            const result = new Function(`return ${sanitized}`)();
            screen.textContent = result;
            calcExpression = String(result);
        } catch (e) {
            screen.textContent = "Error";
            calcExpression = "";
        }
    } else {
        if (screen.textContent === "Error" || screen.textContent === "0") {
            if (val !== '+' && val !== '-' && val !== '*' && val !== '/') {
                calcExpression = "";
            }
        }
        calcExpression += val;
        screen.textContent = calcExpression;
    }
}

// ==================== APP: CALENDAR ENGINE ====================
let currentCalendarDate = new Date();

function toggleCalendarMenu() {
    const calMenu = document.getElementById('calendar-dropdown');
    calMenu.classList.toggle('hidden');
    if (!calMenu.classList.contains('hidden')) {
        // Render calendar for current date when opened
        currentCalendarDate = new Date();
        renderCalendar(currentCalendarDate);
    }
}

function hideCalendarMenu() {
    const calMenu = document.getElementById('calendar-dropdown');
    calMenu.classList.add('hidden');
}

function renderCalendar(dateObj) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    
    // Set month/year title text
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendar-days-grid');
    grid.innerHTML = '';

    // Find first day of the month & total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    // Populate padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month empty';
        dayDiv.textContent = prevTotalDays - i;
        grid.appendChild(dayDiv);
    }

    // Populate current month's days
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        // Highlight if it's today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        grid.appendChild(dayDiv);
    }
}

function navigateMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar(currentCalendarDate);
}

// ==================== APP: MUSIC PLAYER ENGINE ====================
const musicPlaylist = [
    {
        title: "Midnight Lofi",
        artist: "Lofi Ambient Beats",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80"
    },
    {
        title: "Summer Chill",
        artist: "Chillhop Vibes",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80"
    },
    {
        title: "Synthwave Dreams",
        artist: "Retro Wave",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&q=80"
    }
];

let currentTrackIndex = 0;
let isMusicPlaying = false;
const audioElement = document.getElementById('ambient-audio');
const vinylDisk = document.getElementById('vinyl-disk');
const playMusicBtn = document.getElementById('play-music-btn');
const musicBars = document.querySelectorAll('.music-bar');

function loadTrack(index) {
    currentTrackIndex = index;
    const track = musicPlaylist[currentTrackIndex];
    audioElement.src = track.url;
    document.getElementById('track-title').textContent = track.title;
    document.getElementById('track-artist').textContent = track.artist;
    vinylDisk.style.backgroundImage = `url('${track.cover}')`;
    
    // Reset progress
    document.getElementById('track-progress').style.width = '0%';
    document.getElementById('track-time-current').textContent = '0:00';
    document.getElementById('track-time-total').textContent = '0:00';
}

function togglePlayMusic() {
    if (audioElement.src === "" || audioElement.src === window.location.href) {
        loadTrack(0);
    }
    if (isMusicPlaying) {
        audioElement.pause();
        isMusicPlaying = false;
        playMusicBtn.innerHTML = '<span class="material-symbols-outlined text-lg">play_arrow</span>';
        vinylDisk.classList.remove('animate-vinyl');
        musicBars.forEach(bar => bar.classList.remove('active'));
    } else {
        audioElement.play().then(() => {
            isMusicPlaying = true;
            playMusicBtn.innerHTML = '<span class="material-symbols-outlined text-lg">pause</span>';
            vinylDisk.classList.add('animate-vinyl');
            musicBars.forEach(bar => bar.classList.add('active'));
        }).catch(e => {
            console.log("Audio play blocked by browser policy:", e);
        });
    }
}

function nextTrack() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= musicPlaylist.length) nextIndex = 0;
    loadTrack(nextIndex);
    if (isMusicPlaying) {
        audioElement.play();
    } else {
        togglePlayMusic();
    }
}

function prevTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = musicPlaylist.length - 1;
    loadTrack(prevIndex);
    if (isMusicPlaying) {
        audioElement.play();
    } else {
        togglePlayMusic();
    }
}

function setMusicVolume(val) {
    audioElement.volume = parseFloat(val);
}

function updateAudioProgress() {
    const duration = audioElement.duration;
    const currentTime = audioElement.currentTime;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    document.getElementById('track-progress').style.width = `${progressPercent}%`;

    // Helper to format time
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    };

    document.getElementById('track-time-current').textContent = formatTime(currentTime);
    document.getElementById('track-time-total').textContent = formatTime(duration);
}

function seekAudio(e) {
    const progressBar = document.getElementById('track-progress-bar');
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const duration = audioElement.duration;
    if (isNaN(duration)) return;

    const newTime = (clickX / width) * duration;
    audioElement.currentTime = newTime;
}

// ==================== APP: IFRAME BROWSER ENGINE ====================
const browserHistory = [];
let browserHistoryIndex = -1;

function navigateBrowser(url) {
    const addressInput = document.getElementById('browser-address-input');
    const homepageView = document.getElementById('browser-homepage');
    const localDoc = document.getElementById('local-browser-doc');
    const iframeContainer = document.getElementById('browser-iframe-container');
    const iframe = document.getElementById('browser-iframe');
    const lockIcon = document.getElementById('browser-lock-icon');
    const loading = document.getElementById('browser-loading');

    if (url === 'local-homepage') {
        // Show homepage with the local document details inside browser
        addressInput.value = 'https://sonali.dev';
        homepageView.classList.remove('hidden');
        localDoc.classList.remove('hidden');
        iframeContainer.classList.add('hidden');
        iframe.src = '';
        lockIcon.textContent = 'lock';
        lockIcon.className = 'material-symbols-outlined text-sm text-green-600';
        
        // Add to history
        addBrowserHistory('local-homepage');
        return;
    }

    // Normal external URL or search
    homepageView.classList.add('hidden');
    localDoc.classList.add('hidden');
    iframeContainer.classList.remove('hidden');
    loading.classList.remove('hidden');

    let finalUrl = url.trim();
    // Prefix http if not exists
    if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }

    addressInput.value = finalUrl;
    iframe.src = finalUrl;
    
    // Adjust secure lock icon color if https
    if (finalUrl.startsWith('https://')) {
        lockIcon.textContent = 'lock';
        lockIcon.className = 'material-symbols-outlined text-sm text-green-600';
    } else {
        lockIcon.textContent = 'lock_open';
        lockIcon.className = 'material-symbols-outlined text-sm text-amber-500';
    }

    // Add to history
    addBrowserHistory(finalUrl);
}

function onIframeLoaded() {
    document.getElementById('browser-loading').classList.add('hidden');
}

function handleBrowserNavigation(e) {
    if (e.key !== 'Enter') return;
    const inputVal = e.target.value.trim();
    if (inputVal === '') return;

    // Detect if it is a URL or search query
    const isUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(inputVal);
    if (isUrl) {
        navigateBrowser(inputVal);
    } else {
        // Search via DuckDuckGo
        const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(inputVal)}`;
        navigateBrowser(searchUrl);
    }
}

function handleBrowserSearch(e) {
    if (e.key !== 'Enter') return;
    const inputVal = e.target.value.trim();
    if (inputVal === '') return;
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(inputVal)}`;
    navigateBrowser(searchUrl);
}

function addBrowserHistory(url) {
    // If we navigated away from intermediate history points, clear forward stack
    if (browserHistoryIndex < browserHistory.length - 1) {
        browserHistory.splice(browserHistoryIndex + 1);
    }
    // Add if it's different from current
    if (browserHistory[browserHistory.length - 1] !== url) {
        browserHistory.push(url);
        browserHistoryIndex++;
    }
}

function goBrowserBack() {
    if (browserHistoryIndex > 0) {
        browserHistoryIndex--;
        const prevUrl = browserHistory[browserHistoryIndex];
        if (prevUrl === 'local-homepage') {
            navigateBrowser('local-homepage');
        } else {
            const addressInput = document.getElementById('browser-address-input');
            const iframe = document.getElementById('browser-iframe');
            addressInput.value = prevUrl;
            iframe.src = prevUrl;
            document.getElementById('browser-homepage').classList.add('hidden');
            document.getElementById('browser-iframe-container').classList.remove('hidden');
        }
    }
}

function goBrowserForward() {
    if (browserHistoryIndex < browserHistory.length - 1) {
        browserHistoryIndex++;
        const nextUrl = browserHistory[browserHistoryIndex];
        if (nextUrl === 'local-homepage') {
            navigateBrowser('local-homepage');
        } else {
            const addressInput = document.getElementById('browser-address-input');
            const iframe = document.getElementById('browser-iframe');
            addressInput.value = nextUrl;
            iframe.src = nextUrl;
            document.getElementById('browser-homepage').classList.add('hidden');
            document.getElementById('browser-iframe-container').classList.remove('hidden');
        }
    }
}

function reloadBrowser() {
    const iframe = document.getElementById('browser-iframe');
    const homepageView = document.getElementById('browser-homepage');
    if (!homepageView.classList.contains('hidden') && iframe.src === '') {
        // Re-initialize homepage
        document.getElementById('browser-search-input').value = '';
    } else {
        document.getElementById('browser-loading').classList.remove('hidden');
        iframe.src = iframe.src; // Reload
    }
}

// Initialize history stack
addBrowserHistory('homepage');

function goBrowserHome() {
    const addressInput = document.getElementById('browser-address-input');
    const homepageView = document.getElementById('browser-homepage');
    const localDoc = document.getElementById('local-browser-doc');
    const iframeContainer = document.getElementById('browser-iframe-container');
    const iframe = document.getElementById('browser-iframe');
    
    addressInput.value = 'https://sonali.dev';
    homepageView.classList.remove('hidden');
    localDoc.classList.add('hidden');
    iframeContainer.classList.add('hidden');
    iframe.src = '';
    
    addBrowserHistory('local-homepage');
}

function dismissIframeBar() {
    document.getElementById('browser-iframe-bar').classList.add('hidden');
}
