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
            serverStatus: false,
            news: false,
            config: false,
            gameDig: false
        };
        this.newsUrls = new Map();
        this.isInitializing = true;

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
                <i class="fas fa-${tab.icon}"></i>
                <span>${tab.name}</span>
            `;
            navFragment.appendChild(li);

            const content = document.createElement('div');
            content.className = `tab-content${tab.id === this.currentTab ? ' active' : ''}`;
            content.id = tab.id;
            content.innerHTML = `
                <header class="content-header">
                    <h1>${tab.name}</h1>
                    ${tab.servers && tab.servers.length > 0 ? `
                        <div class="server-status">
                            <span class="players-online">
                                <i class="fas fa-users"></i>
                                <span class="count">0</span> joueurs en ligne
                            </span>
                        </div>
                    ` : ''}
                </header>
                ${tab.servers && tab.servers.length > 0 ? '<div class="server-status-container"></div>' : ''}
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
        try {
            await this.waitForElectronAPI();

            const configLoaded = await this.fetchConfig();
            if (!configLoaded) {
                throw new Error('Failed to load configuration');
            }

            await Promise.all([
                this.initializeGameDig(),
                this.waitForFontAwesome().then(() => {
                    this.loadingTasks.fontAwesome = true;
                    this.checkLoadingComplete();
                }),
                this.updateNews().then(() => {
                    this.loadingTasks.news = true;
                    this.checkLoadingComplete();
                })
            ]);
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
        }
    }

    waitForElectronAPI() {
        return new Promise(resolve => {
            const check = () => {
                if (window.electronAPI) {
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
                            document.body.removeChild(testElement);
                            resolve();
                        } else {
                            setTimeout(checkFont, 50);
                        }
                    };

                    setTimeout(checkFont, 100);
                });
            } else {
                setTimeout(resolve, 500);
            }
        });
    }

    checkLoadingComplete() {
        const allTasksComplete = Object.values(this.loadingTasks).every(task => task === true);

        if (allTasksComplete) {
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
            await this.updateServerStatus();
            this.loadingTasks.gameDig = true;
            this.loadingTasks.serverStatus = true;

            setInterval(() => this.updateServerStatus(), 30000);

            this.checkLoadingComplete();
        } catch (error) {
            console.error('Error initializing GameDig:', error);
            setTimeout(() => this.initializeGameDig(), 5000);
        }
    }

    async updateServerStatus() {
        try {
            const gameTypes = Object.keys(CONFIG.servers);
            for (const gameType of gameTypes) {
                try {
                    const singleServerGroup = { [gameType]: CONFIG.servers[gameType] };
                    const statusResult = await window.electronAPI.checkMultipleServers(singleServerGroup);
                    if (statusResult && statusResult[gameType]) {
                        this.updateServerUI(gameType, statusResult[gameType]);
                    }
                } catch (error) {
                    console.error(`Error updating server status for ${gameType}:`, error);
                }
            }
        } catch (error) {
            console.error('Error updating server status:', error);
        }
    }

    updateServerUI(gameType, servers) {
        const tabContent = document.getElementById(gameType);
        if (!tabContent) return;

        let statusContainer = tabContent.querySelector('.server-status-container');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.className = 'server-status-container';

            const header = tabContent.querySelector('.content-header');
            if (header) {
                header.insertAdjacentElement('afterend', statusContainer);
            } else {
                tabContent.insertBefore(statusContainer, tabContent.firstChild);
            }
        }

        const newStatusContainer = document.createElement('div');
        newStatusContainer.className = 'server-status-container';

        servers.forEach(server => {
            const serverElement = document.createElement('div');
            serverElement.className = `server-item ${server.online ? 'online' : 'offline'}`;

            serverElement.innerHTML = `
                <div class="server-info">
                    <h3 class="server-name">${server.name}</h3>
                    <div class="server-details">
                        <span class="server-status ${server.online ? 'online' : 'offline'}">
                            ${server.online ? '🟢' : '🔴'} ${server.online ? 'En ligne' : 'Hors ligne'}
                        </span>
                        <span class="server-players">
                            👥 ${server.players}/${server.maxPlayers}
                        </span>
                        ${server.map && server.map !== 'N/A' ? `<span class="server-map">🗺️ ${server.map}</span>` : ''}
                        ${server.ping > 0 ? `<span class="server-ping">📡 ${server.ping}ms</span>` : ''}
                    </div>
                </div>
                <button class="btn-play ${server.online ? '' : 'disabled'}" 
                        data-ip="${server.ip}" 
                        data-port="${server.port}" 
                        data-protocol="${server.protocol}"
                        ${!server.online ? 'disabled' : ''}>
                    <i class="fas fa-play"></i> 
                    ${server.online ? 'Rejoindre' : 'Hors ligne'}
                </button>
            `;

            newStatusContainer.appendChild(serverElement);
        });

        const totalPlayers = servers.reduce((sum, server) => sum + server.players, 0);
        const headerPlayerCount = tabContent.querySelector('.players-online .count');
        if (headerPlayerCount) {
            headerPlayerCount.textContent = totalPlayers;
        }

        requestAnimationFrame(() => {
            statusContainer.classList.add('updating');

            setTimeout(() => {
                statusContainer.innerHTML = newStatusContainer.innerHTML;
                statusContainer.classList.remove('updating');
                this.setupPlayButtons();
            }, 300);
        });
    }

    setupPlayButtons() {
        document.querySelectorAll('.btn-play:not(.disabled)').forEach(button => {
            button.addEventListener('click', () => {
                const ip = button.getAttribute('data-ip');
                const port = button.getAttribute('data-port');
                const protocol = button.getAttribute('data-protocol');

                window.electronAPI.connectToServer({ ip, port, protocol });

                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-play"></i> Rejoindre';
                }, 2000);
            });
        });
    }

    async updateNews() {
        for (const [category, url] of this.newsUrls) {
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
        }
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

                newsItem.innerHTML = `
                    ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
                    <div class="news-content">
                        <h${index === 0 ? '2' : '3'}>${article.title}</h${index === 0 ? '2' : '3'}>
                        <p>${article.content || article.description || ''}</p>
                        <span class="date">${date}</span>
                        ${article.author ? `<span class="author">Par ${article.author}</span>` : ''}
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

    addNews(category, newsItem) {
        const tabContent = document.getElementById(category);
        if (!tabContent) return;

        let newsContainer = tabContent.querySelector('.news-grid');
        if (!newsContainer) {
            newsContainer = document.createElement('div');
            newsContainer.className = 'news-grid';
            tabContent.appendChild(newsContainer);
        }

        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <div class="news-content">
                <h3>${newsItem.title}</h3>
                <p>${newsItem.content}</p>
                <span class="date">${newsItem.date}</span>
                ${newsItem.author ? `<span class="author">Par ${newsItem.author}</span>` : ''}
            </div>
        `;

        newsContainer.insertBefore(newsElement, newsContainer.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameLauncher = new GameLauncher();
});
