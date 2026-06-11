function serverKey(server) {
    return server.name || `${server.ip}:${server.port}`;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const CONFIG = {
    baseUrl: 'https://fastdl.clan-rmg.com/launcher/news/',
    configUrl: 'https://fastdl.clan-rmg.com/launcher/config.json',
    updateInterval: 30000,
    loadingDelay: 300,
    servers: {},
    tabs: []
};

class GameLauncher {
    constructor() {
        this.currentTab = null;
        this.loadingTasks = {
            fontAwesome: false,
            news: false,
            config: false
        };
        this.newsUrls = new Map();
        this.isInitializing = true;
        this.serverCheckInProgress = false;
        this._statusInterval = null;
        this._serverResults = {};

        document.body.classList.add('initializing');

        this.initializeUI();
        this.initializeApp();
    }

    async fetchConfig() {
        try {
            const response = await window.electronAPI.fetchNews(CONFIG.configUrl);
            if (response.success) {
                const config = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

                CONFIG.tabs = config.tabs;
                CONFIG.servers = {};

                config.tabs.forEach(tab => {
                    if (tab.servers && tab.servers.length > 0) {
                        CONFIG.servers[tab.id] = tab.servers;
                    }
                    this.newsUrls.set(tab.id, `${CONFIG.baseUrl}${tab.id}.json`);
                });

                this.currentTab = config.tabs.find(tab => tab.isDefault)?.id || config.tabs[0]?.id;

                await this.createTabsUI(config.tabs);

                this.loadingTasks.config = true;
                return true;
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            this.createOfflineFallback();
            this.loadingTasks.config = true;
            return true;
        }
        return false;
    }

    createOfflineFallback() {
        console.warn('Using offline fallback configuration');

        const offlineConfig = {
            tabs: [
                {
                    id: 'offline',
                    name: 'Launcher Hors Ligne',
                    icon: 'wifi',
                    servers: [],
                    isDefault: true
                }
            ]
        };

        CONFIG.tabs = offlineConfig.tabs;
        CONFIG.servers = {};

        this.newsUrls.set('offline', `${CONFIG.baseUrl}offline.json`);

        this.currentTab = 'offline';

        this.createTabsUI(offlineConfig.tabs);
    }

    async createTabsUI(tabs) {
        const navFragment = document.createDocumentFragment();
        const contentFragment = document.createDocumentFragment();

        tabs.forEach(tab => {
            const li = document.createElement('li');
            li.setAttribute('data-tab', tab.id);
            if (tab.id === this.currentTab) li.classList.add('active');
            li.innerHTML = `
                <i class="fas fa-${escapeHtml(tab.icon)}"></i>
                <span>${escapeHtml(tab.name)}</span>
            `;
            navFragment.appendChild(li);

            const content = document.createElement('div');
            content.className = `tab-content${tab.id === this.currentTab ? ' active' : ''}`;
            content.id = tab.id;
            content.innerHTML = `
                <header class="content-header">
                    <h1>${escapeHtml(tab.name)}</h1>
                    ${tab.servers && tab.servers.length > 0 ? `
                        <div class="server-status">
                            <span class="players-online">
                                <i class="fas fa-users"></i>
                                <span class="count">0</span> joueurs en ligne
                            </span>
                        </div>
                    ` : ''}
                </header>
                ${tab.servers && tab.servers.length > 0 ? `
                    <div class="server-status-container">
                        ${tab.servers.map(s => `
                            <div class="server-item checking" data-server-key="${escapeHtml(serverKey(s))}">
                                <div class="server-info">
                                    <h3 class="server-name">${escapeHtml(s.name || `${s.ip}:${s.port}`)}</h3>
                                    <div class="server-details">
                                        <span class="server-status checking">⏳ Vérification...</span>
                                    </div>
                                </div>
                                <button class="btn-play disabled" disabled>
                                    <i class="fas fa-spinner fa-spin"></i> Vérification...
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="news-grid"></div>
            `;
            contentFragment.appendChild(content);
        });

        return new Promise(resolve => {
            requestAnimationFrame(() => {
                const navLinks = document.querySelector('.nav-links');
                const mainContent = document.querySelector('main.content');

                navLinks.innerHTML = '';
                mainContent.innerHTML = '';

                navLinks.appendChild(navFragment);
                mainContent.appendChild(contentFragment);

                this.setupEventListeners();

                resolve();
            });
        });
    }

    async initializeApp() {
        const loadingTimeout = setTimeout(() => {
            console.warn('Loading timeout reached, forcing completion');
            this.isInitializing = false;
            this.initialServerCheckComplete = true;
            Object.keys(this.loadingTasks).forEach(k => { this.loadingTasks[k] = true; });
            this.hideLoadingOverlay();
        }, 15000);

        try {
            await this.waitForElectronAPI();

            const configLoaded = await this.fetchConfig();
            if (!configLoaded) {
                throw new Error('Failed to load configuration');
            }

            // Start parallel initialization tasks (server check runs in background)
            const initTasks = [
                this.waitForFontAwesome().then(() => {
                    this.loadingTasks.fontAwesome = true;
                    this.checkLoadingComplete();
                }),
                this.updateNews().then(() => {
                    this.loadingTasks.news = true;
                    this.checkLoadingComplete();
                })
            ];

            await Promise.all(initTasks);

            // Server checks run in background after overlay is hidden
            this.initializeGameDig();
        } catch (error) {
            console.error('Initialization error:', error);
            const loadingSpinner = document.querySelector('.loading-spinner');
            if (loadingSpinner) {
                loadingSpinner.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <div style="margin-top: 10px; font-size: 14px;">
                        Erreur de chargement. Veuillez redémarrer l'application.
                    </div>
                `;
            }
        } finally {
            clearTimeout(loadingTimeout);
        }
    }

    waitForElectronAPI() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('electronAPI not available after 10s')), 10000);
            const check = () => {
                if (window.electronAPI) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }

    async waitForFontAwesome() {
        return new Promise(resolve => {
            const fallback = setTimeout(resolve, 3000);
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    const testElement = document.createElement('i');
                    testElement.className = 'fas fa-home';
                    testElement.style.position = 'absolute';
                    testElement.style.left = '-9999px';
                    document.body.appendChild(testElement);

                    const checkFont = () => {
                        const computedStyle = window.getComputedStyle(testElement, ':before');
                        if (computedStyle.content && computedStyle.content !== 'none') {
                            clearTimeout(fallback);
                            document.body.removeChild(testElement);
                            resolve();
                        } else {
                            setTimeout(checkFont, 50);
                        }
                    };

                    setTimeout(checkFont, 100);
                });
            }
        });
    }

    checkLoadingComplete() {
        const allTasksComplete = Object.values(this.loadingTasks).every(task => task === true);

        if (allTasksComplete) {
            console.log('All loading tasks complete, hiding overlay...');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.hideLoadingOverlay();
                });
            });
        }
    }

    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const body = document.body;

        if (loadingOverlay) {
            this.isInitializing = false;

            body.style.transform = 'translateZ(0)';
            void body.offsetHeight;

            loadingOverlay.classList.add('hidden');
            body.classList.add('loaded');
            body.classList.remove('initializing');

            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
                body.style.transform = '';

                console.log('Application initialization complete - visual flashing eliminated');
            }, 500);
        }
    }

    initializeUI() {
        document.getElementById('minimize-btn').addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });

        document.getElementById('maximize-btn').addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });

        document.getElementById('close-btn').addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });

        document.querySelectorAll('[data-url]').forEach(element => {
            element.addEventListener('click', () => {
                const url = element.getAttribute('data-url');
                window.electronAPI.openExternal(url);
            });
        });

        const yearEl = document.getElementById('current-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-links li').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        this.setupPlayButtons();
    }

    switchTab(tabId) {
        document.querySelectorAll('.nav-links li').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;
    }

    async initializeGameDig() {
        try {
            console.log('Starting background server status check...');
            await this.updateServerStatus(true);

            console.log('Initial server status check complete');

            // Set up periodic updates
            if (this._statusInterval) clearInterval(this._statusInterval);
            this._statusInterval = setInterval(() => this.updateServerStatus(false), 30000);
        } catch (error) {
            console.error('Error initializing GameDig:', error);
            // Retry after delay
            setTimeout(() => this.initializeGameDig(), 5000);
        }
    }

    updateServerStatus(isInitialCheck = false) {
        if (this.serverCheckInProgress) {
            console.log('Server check already in progress, skipping...');
            return;
        }

        const gameTypes = Object.keys(CONFIG.servers);
        if (gameTypes.length === 0) {
            console.log('No servers configured, skipping status check');
            return;
        }

        this.serverCheckInProgress = true;
        console.log(`[FRONTEND] Starting streaming server check${isInitialCheck ? ' (initial)' : ''}...`);

        // Retire les anciens listeners avant d'en ajouter de nouveaux
        window.electronAPI.offServerListeners();

        window.electronAPI.onServerUpdate(({ gameType, server }) => {
            console.log(`[FRONTEND] Received result for ${server.name || server.ip} (${gameType})`);
            this.updateSingleServerUI(gameType, server);
        });

        window.electronAPI.onServerCheckDone(() => {
            console.log('[FRONTEND] All server checks complete');
            this.serverCheckInProgress = false;
        });

        window.electronAPI.startServerCheck(CONFIG.servers, isInitialCheck);
    }

    updateSingleServerUI(gameType, server) {
        const tabContent = document.getElementById(gameType);
        if (!tabContent) return;

        // Utilise _configKey (clé stable depuis la config) pour retrouver la ligne
        const key = escapeHtml(server._configKey || serverKey(server));
        const row = tabContent.querySelector(`[data-server-key="${key}"]`);
        if (!row) return;

        row.className = `server-item ${server.online ? 'online' : 'offline'}`;
        row.innerHTML = `
            <div class="server-info">
                <h3 class="server-name">${escapeHtml(server.name)}</h3>
                <div class="server-details">
                    <span class="server-status ${server.online ? 'online' : 'offline'}">
                        ${server.online ? '🟢' : '🔴'} ${server.online ? 'En ligne' : 'Hors ligne'}
                    </span>
                    <span class="server-players">
                        👥 ${parseInt(server.players) || 0}/${parseInt(server.maxPlayers) || 0}
                    </span>
                    ${server.map && server.map !== 'N/A' ? `<span class="server-map">🗺️ ${escapeHtml(server.map)}</span>` : ''}
                    ${server.ping > 0 ? `<span class="server-ping">📡 ${parseInt(server.ping) || 0}ms</span>` : ''}
                </div>
            </div>
            <button class="btn-play ${server.online ? '' : 'disabled'}"
                    data-ip="${escapeHtml(server.ip || '')}"
                    data-port="${escapeHtml(String(server.port || ''))}"
                    data-protocol="${escapeHtml(server.protocol || '')}"
                    ${!server.online ? 'disabled' : ''}>
                <i class="fas fa-play"></i>
                ${server.online ? 'Rejoindre' : 'Hors ligne'}
            </button>
        `;

        // Setup bouton uniquement si serveur en ligne
        if (server.online) {
            const btn = row.querySelector('.btn-play');
            if (btn) this._setupPlayButton(btn);
        }

        // Mise à jour du compteur total de joueurs
        this._updatePlayerCount(gameType);
    }

    _updatePlayerCount(gameType) {
        const tabContent = document.getElementById(gameType);
        if (!tabContent) return;
        let total = 0;
        tabContent.querySelectorAll('.server-item:not(.checking)').forEach(row => {
            const playersText = row.querySelector('.server-players')?.textContent || '';
            const match = playersText.match(/(\d+)\s*\//);
            if (match) total += parseInt(match[1]) || 0;
        });
        const counter = tabContent.querySelector('.players-online .count');
        if (counter) counter.textContent = total;
    }

    setupPlayButtons() {
        document.querySelectorAll('.btn-play:not(.disabled)').forEach(btn => this._setupPlayButton(btn));
    }

    _setupPlayButton(button) {
        // onclick remplace automatiquement tout handler précédent — pas de doublons
        button.onclick = async () => {
            const ip = button.getAttribute('data-ip');
            const port = button.getAttribute('data-port');
            const protocol = button.getAttribute('data-protocol');

            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

            const result = await window.electronAPI.connectToServer({ ip, port, protocol });

            if (result && result.success) {
                button.innerHTML = '<i class="fas fa-check"></i> Connecté !';
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-play"></i> Rejoindre';
                }, 3000);
            } else {
                button.innerHTML = '<i class="fas fa-times"></i> Erreur';
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-play"></i> Rejoindre';
                }, 2000);
            }
        };
    }

    async updateNews() {
        await Promise.all([...this.newsUrls.entries()].map(async ([category, url]) => {
            try {
                const result = await window.electronAPI.fetchNews(url);

                if (result.success) {
                    let newsData;
                    try {
                        if (typeof result.data === 'string') {
                            newsData = JSON.parse(result.data);
                        } else {
                            newsData = result.data;
                        }

                        if (newsData.title && newsData.body) {
                            newsData = {
                                articles: [{
                                    title: newsData.title,
                                    content: newsData.body,
                                    date: new Date().toISOString(),
                                    author: 'Admin'
                                }]
                            };
                        }

                        if (newsData.articles && newsData.articles.length > 0 && newsData.articles[0].date !== undefined) {
                            newsData.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
                        }

                        this.updateNewsUI(category, newsData);
                    } catch (parseError) {
                        console.warn(`Failed to parse news for ${category}:`, parseError);
                        this.showFallbackNews(category);
                    }
                } else {
                    console.warn(`Failed to load news for ${category}:`, result.error);
                    this.showFallbackNews(category);
                }
            } catch (error) {
                console.error(`Error loading news for ${category}:`, error);
                this.showFallbackNews(category);
            }
        }));
    }

    updateNewsUI(category, newsData) {
        const tabContent = document.getElementById(category);
        if (!tabContent) return;

        let newsContainer = tabContent.querySelector('.news-grid');
        if (!newsContainer) {
            newsContainer = document.createElement('div');
            newsContainer.className = 'news-grid';
            tabContent.appendChild(newsContainer);
        }

        newsContainer.innerHTML = '';

        if (newsData.articles && newsData.articles.length > 0) {
            newsData.articles.forEach((article, index) => {
                const newsItem = document.createElement('div');
                newsItem.className = `news-item ${index === 0 ? 'featured' : ''}`;

                const date = new Date(article.date).toLocaleDateString('fr-FR');
                const safeImage = article.image && typeof article.image === 'string' && article.image.startsWith('https://')
                    ? escapeHtml(article.image) : null;

                newsItem.innerHTML = `
                    ${safeImage ? `<img src="${safeImage}" alt="${escapeHtml(article.title)}">` : ''}
                    <div class="news-content">
                        <h${index === 0 ? '2' : '3'}>${escapeHtml(article.title)}</h${index === 0 ? '2' : '3'}>
                        <p>${escapeHtml(article.content || article.description || '')}</p>
                        <span class="date">${escapeHtml(date)}</span>
                        ${article.author ? `<span class="author">Par ${escapeHtml(article.author)}</span>` : ''}
                    </div>
                `;

                newsContainer.appendChild(newsItem);
            });
        } else {
            this.showFallbackNews(category);
        }
    }

    showFallbackNews(category) {
        const tabContent = document.getElementById(category);
        if (!tabContent) return;

        let newsContainer = tabContent.querySelector('.news-grid');
        if (!newsContainer) {
            newsContainer = document.createElement('div');
            newsContainer.className = 'news-grid';
            tabContent.appendChild(newsContainer);
        }

        const fallbackNews = {
            offline: [
                {
                    title: 'Erreur de connexion',
                    content: 'Impossible de charger les actualités. Veuillez vérifier votre connexion internet et réessayer.',
                    date: new Date().toISOString(),
                    author: 'Système'
                }
            ],
            association: [
                {
                    title: 'Bienvenue sur le launcher RMG !',
                    content: 'Découvrez notre nouvelle interface pour accéder à tous vos serveurs de jeux favoris. Le launcher utilise gamedig pour vérifier le statut des serveurs en temps réel.',
                    date: new Date().toISOString(),
                    author: 'Équipe RMG'
                },
                {
                    title: 'Rejoignez notre Discord',
                    content: 'Connectez-vous avec la communauté RMG sur notre serveur Discord officiel. Cliquez sur le bouton Discord pour nous rejoindre !',
                    date: new Date().toISOString(),
                    author: 'Community Manager'
                }
            ],
            css: [
                {
                    title: 'Serveurs Counter-Strike Source disponibles',
                    content: 'Nos serveurs CSS sont maintenant disponibles ! Poolparty DeathMatch, Antiroxx et AimDeathMatch vous attendent pour des parties épiques.',
                    date: new Date().toISOString(),
                    author: 'Admin CSS'
                }
            ],
            cs2: [
                {
                    title: 'Serveur CS2 PoolParty actif',
                    content: 'Le serveur Counter-Strike: Global Offensive PooLparty DeathMatch est en ligne. Venez montrer vos compétences !',
                    date: new Date().toISOString(),
                    author: 'Admin CS2'
                }
            ],
            eco: [
                {
                    title: 'Serveur ECO Nexus Life disponible',
                    content: 'Découvrez ECO sur notre serveur Nexus Life. Construisez une civilisation durable dans ce jeu de simulation écologique !',
                    date: new Date().toISOString(),
                    author: 'Admin ECO'
                }
            ],
            battlebit: [
                {
                    title: 'Serveur BattleBit RMG disponible !',
                    content: 'Notre serveur BattleBit Remastered est maintenant disponible ! Rejoignez "[FR]Clan-RmG.com | ALL GAMEMODES" pour des batailles épiques avec la communauté RMG.',
                    date: new Date().toISOString(),
                    author: 'Admin BattleBit'
                }
            ],
            rust: [
                {
                    title: 'Serveur Rust Nexus disponible',
                    content: 'Découvrez Rust sur notre serveur Nexus. Construisez et survivre !',
                    date: new Date().toISOString(),
                    author: 'Admin Rust'
                }
            ]
        };

        const articles = fallbackNews[category] || fallbackNews.association;
        this.updateNewsUI(category, { articles });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameLauncher = new GameLauncher();
});
