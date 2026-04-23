// ============================
//          Tabs setup
// ============================

function selectTab(id) {
    for (let tabby of document.getElementsByClassName('tab')) {
        if (!tabby.style.maxHeight) tabby.style.maxHeight = `${tabby.offsetHeight + 10}px`;
        if (tabby.id == id) {
            tabby.classList.remove('noHeight');
        } else {
            if (!tabby.classList.contains('noHeight')) {
                tabby.classList.add('noHeight');
            }
        }
    }
    for (let tabbtn of document.getElementsByClassName('examplebtn')) {
        if (tabbtn.id == `${id}b`) {
            tabbtn.classList.add('active');
        } else {
            tabbtn.classList.remove('active');
        }
    }
}
// First selection
selectTab('codesam1');

// Add button behaviour — guard against 404 and other pages that don't have these elements.
const tabButtons = {
    codesam1b: 'codesam1',
    codesam2b: 'codesam2',
    codesam3b: 'codesam3',
    codesam4b: 'codesam4',
    codesam5b: 'codesam5',
    codesam6b: 'codesam6'
};
for (const [btnId, tabId] of Object.entries(tabButtons)) {
    const btn = document.getElementById(btnId);
    if (btn) btn.onclick = function() { selectTab(tabId); };
}

// ============================
//      Code Snippet Setup
// ============================

// apply HighlightJS
let pres = document.querySelectorAll("pre>code");
for (let i = 0; i < pres.length; i++) {
    hljs.highlightBlock(pres[i]);
}
// add HighlightJS-badge
let options = { 
    onBeforeCodeCopied: function(text, codeElement) {
        // Only copy relevant code on install thingy:
        if (codeElement.classList.contains("install")) return 'npm i restnio';
        return text;
    }
};
window.highlightJsBadge(options);

// ============================
//   Frontground Animations
// ============================

AOS.init({
    duration: 800
});

// ============================
//       Backgound Animation
// ============================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
let pixelData = pixels.data;

// Create randomly seeded clouds
const clouds = new Clouds(Math.random());

// Resolution (higher is less)
const res = 4;

function resize() {
    ctx.canvas.width = window.innerWidth   / res;
    ctx.canvas.height = window.innerHeight / res;
    pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixelData = pixels.data;
    // console.log('Resising!');
}

// Current mouse position tracker.
let mouseX = 0.0;
let mouseY = 0.0;

// Target (slow move) tracker.
let targetX = 0.0;
let targetY = 0.0;

// Update current mouse position based from the window center.
function updateMouse(e) {
    mouseX = ((e.clientX * 2) / window.innerWidth) - 1;
    mouseY = ((e.clientY * 2) / window.innerHeight) - 1;
}

// Keppe: animation frame.
function keppe() {
    // Slowly move target to mouse position.
    targetX += (mouseX - targetX) / 20;
    targetY += (mouseY - targetY) / 20;

    // Calculate new cloudframe
    clouds.newFrame(targetX, targetY);

    // Put in all pixels.
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Index for pixeldata.
            let index = (y * canvas.width + x) * 4;
            // Get pixeldata at x, y
            let nval = clouds.getCloudPixel(x, y);
            // Put into pixeldata as greyshade:
            pixelData[index + 0] = nval; // Red channel)
            pixelData[index + 1] = nval; // Green channel
            pixelData[index + 2] = nval; // Blue channel
            pixelData[index + 3] = 255; // Alpha channel
        }
    }
    ctx.putImageData(pixels, 0, 0);
    window.requestAnimationFrame(keppe);
}
keppe();
resize();

window.addEventListener('mousemove', updateMouse);
window.addEventListener('resize', resize);

// ============================
//        Wiki Viewer
// ============================

const WIKI_RAW = 'https://raw.githubusercontent.com/RestNio/RestNio.js/master/docs/';

function makeNavLink(text, page) {
    const a = document.createElement('a');
    a.className = 'wikinavlink';
    a.href = '#';
    a.dataset.page = page;
    a.textContent = text;
    return a;
}

function wireNavLinks() {
    for (const link of document.querySelectorAll('.wikinavlink')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.wikiwrapper')?.classList.remove('wikiNavOpen');
            loadWikiPage(link.dataset.page);
        });
    }
}

async function loadNavFromSidebar() {
    const nav = document.querySelector('.wikinav');
    if (!nav) return;
    try {
        const resp = await fetch(WIKI_RAW + '_Sidebar.md');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const md = await resp.text();

        nav.innerHTML = '';
        for (const line of md.split('\n')) {
            const t = line.trim();
            if (!t || t === '---') continue;

            // - [Text](Page) list link
            const listLink = t.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)/);
            if (listLink) { nav.appendChild(makeNavLink(listLink[1], listLink[2])); continue; }

            // **[Text](Page)** bold standalone link
            const boldLink = t.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
            if (boldLink) { nav.appendChild(makeNavLink(boldLink[1], boldLink[2])); continue; }

            // **Section Header** (no link)
            const section = t.match(/^\*\*([^[*]+)\*\*/);
            if (section) {
                const span = document.createElement('span');
                span.className = 'wikinavsection';
                span.textContent = section[1];
                nav.appendChild(span);
            }
        }
    } catch (err) {
        // Sidebar fetch failed — fall back to any hardcoded links already in the nav.
        console.warn('Could not load wiki sidebar:', err);
    }
    wireNavLinks();
}

async function loadWikiPage(page) {
    const content = document.getElementById('wikicontent');
    if (!content) return;
    const githubLink = document.getElementById('wikigithublink');

    // Fade out. Height stays the same while content is invisible, so
    // when new content loads the instant height change is never seen.
    content.style.opacity = '0';

    for (const link of document.querySelectorAll('.wikinavlink')) {
        link.classList.toggle('active', link.dataset.page === page);
    }
    // Update mobile toggle label to current page name.
    const navToggle = document.getElementById('wikinavtoggle');
    if (navToggle) {
        const activeLink = document.querySelector('.wikinavlink.active');
        const toggleLabel = navToggle.querySelector('.wikinavtoggleLabel');
        if (toggleLabel && activeLink) toggleLabel.textContent = activeLink.textContent.trim();
    }
    if (githubLink) githubLink.href = 'https://github.com/RestNio/RestNio.js/wiki/' + page;

    try {
        const resp = await fetch(WIKI_RAW + page + '.md');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const md = await resp.text();

        content.innerHTML = marked.parse(md);

        // Syntax-highlight code blocks in the rendered markdown.
        for (const block of content.querySelectorAll('pre>code')) {
            hljs.highlightBlock(block);
        }

        // Add copy buttons to each code block.
        for (const pre of content.querySelectorAll('pre')) {
            pre.style.position = 'relative';
            const btn = document.createElement('button');
            btn.className = 'wikiCopyBtn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', () => {
                const code = pre.querySelector('code');
                navigator.clipboard.writeText(code ? code.textContent : '').then(() => {
                    btn.textContent = '\u2713 Copied';
                    btn.classList.add('copied');
                    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
                });
            });
            pre.appendChild(btn);
        }

        // Intercept internal wiki links so they navigate inside the viewer.
        for (const a of content.querySelectorAll('a[href]')) {
            const href = a.getAttribute('href');
            if (href && !href.includes('://') && !href.startsWith('/') &&
                !href.startsWith('#') && !href.startsWith('mailto:')) {
                const target = href.replace(/\.md$/, '');
                a.href = '#';
                a.addEventListener('click', (e) => { e.preventDefault(); loadWikiPage(target); });
            } else if (href && href.includes('://')) {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noreferrer');
            }
        }

        content.scrollTop = 0;
    } catch (err) {
        content.innerHTML = '<span class="wikierror"><i class="fas fa-exclamation-triangle"></i> Could not load page. ' +
            '<a href="https://github.com/RestNio/RestNio.js/wiki/' + page + '" target="_blank" rel="noreferrer">View on GitHub</a></span>';
    }

    // Fade back in whether content loaded or errored.
    content.style.opacity = '1';
}

if (document.getElementById('wikicontent')) {
    // Wire mobile nav toggle button.
    document.getElementById('wikinavtoggle')?.addEventListener('click', () => {
        document.querySelector('.wikiwrapper')?.classList.toggle('wikiNavOpen');
    });

    // Load nav from _Sidebar.md then open the default page.
    loadNavFromSidebar().then(() => loadWikiPage('Routing'));
}
