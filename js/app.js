class GameLauncher {
    constructor() {
        // Add loading state management
        this.loadingTasks = {
            fontAwesome: false,
            serverStatus: false,
            news: false
        };
        
        this.currentTab = 'association';
        this.servers = {
            css: [
                {
                    name: 'Serveur Poolparty DeathMatch',
                    ip: '91.121.50.47',
                    port: '27015',
                    queryPort: '27015',
                    type: 'css',
                    protocol: 'source'
                },
                {
                    name: 'Serveur Antiroxx',
                    ip: '46.105.167.16',
                    port: '27015',
                    queryPort: '27015',
                    type: 'css',
                    protocol: 'source'
                },
                {
                    name: 'Serveur AimDeathMatch',
                    ip: '46.105.167.18',
                    port: '27015',
                    queryPort: '27015',
                    type: 'css',
                    protocol: 'source'
                }
            ],
            csgo: [
                {
                    name: 'Serveur PooLparty DeathMatch',
                    ip: '46.105.167.17',
                    port: '27015',
                    queryPort: '27015',
                    type: 'csgo',
                    protocol: 'csgo'
                }
            ],
            eco: [
                {
                    name: 'Serveur Nexus Life',
                    ip: '46.105.167.16',
                    port: '3000',
                    queryPort: '3001',
                    type: 'eco',
                    protocol: 'eco'
                }
            ],
            rust: [
                {
                    name: 'Serveur Nexus Life',
                    ip: '46.105.167.17',
                    port: '27030',
                    queryPort: '27031',
                    type: 'rust',
                    protocol: 'rust'
                }
            ],
            battlebit: [
                {
                    name: '[FR]Clan-RmG.com | ALL GAMEMODES | discord.gg/tqPtgyk6yT',
                    type: 'battlebit',
                    protocol: 'battlebit'
                }
            ]
        };

        this.newsUrls = {
            association: 'https://fastdl.clan-rmg.com/launcher/news/association.json',
            css: 'https://fastdl.clan-rmg.com/launcher/news/css.json',
            csgo: 'https://fastdl.clan-rmg.com/launcher/news/csgo.json',
            eco: 'https://fastdl.clan-rmg.com/launcher/news/eco.json',
            rust: 'https://fastdl.clan-rmg.com/launcher/news/rust.json',
            battlebit: 'https://fastdl.clan-rmg.com/launcher/news/battlebit.json'
        };

        this.initializeUI();
        this.setupEventListeners();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Wait for Font Awesome to load
            await this.waitForFontAwesome();
            this.loadingTasks.fontAwesome = true;

            // Ensure electronAPI is available
            await this.waitForElectronAPI();
            
            // Start server status updates and news fetching in parallel
            await Promise.all([
                this.startServerStatusUpdates().then(() => {
                    this.loadingTasks.serverStatus = true;
                }),
                this.updateNews().then(() => {
                    this.loadingTasks.news = true;
                })
            ]);

            this.checkLoadingComplete();
        } catch (error) {
            console.error('Initialization error:', error);
            // Show error in loading overlay
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
        return new Promise((resolve) => {
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
        return new Promise((resolve) => {
            // Check if Font Awesome is already loaded
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    // Additional check for Font Awesome specifically
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
                // Fallback for older browsers
                setTimeout(resolve, 500);
            }
        });
    }

    checkLoadingComplete() {
        const allTasksComplete = Object.values(this.loadingTasks).every(task => task === true);
        
        if (allTasksComplete) {
            // Ensure all DOM updates are complete before hiding overlay
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
            // Ensure smooth transition by forcing a layout
            body.style.transform = 'translateZ(0)';
            void(body.offsetHeight); // Force reflow
            
            // Start the transition
            loadingOverlay.classList.add('hidden');
            body.classList.add('loaded');
            
            // Remove the overlay from DOM after transition completes
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
                // Clean up transform
                body.style.transform = '';
            }, 500); // Match the CSS transition duration
        }
    }

    initializeUI() {
        // Initialize window controls
        document.getElementById('minimize-btn').addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });

        document.getElementById('maximize-btn').addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });

        document.getElementById('close-btn').addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });

        // Initialize social links
        document.querySelectorAll('[data-url]').forEach(element => {
            element.addEventListener('click', () => {
                const url = element.getAttribute('data-url');
                window.electronAPI.openExternal(url);
            });
        });
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-links li').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Server connection buttons
        this.setupPlayButtons();
    }

    switchTab(tabId) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.nav-links li').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;
    }

    async startServerStatusUpdates() {
        await this.updateServerStatus();
        // Update server status every 30 seconds
        setInterval(() => this.updateServerStatus(), 30000);
    }

    async updateServerStatus() {
        try {
            const statusResults = await window.electronAPI.checkMultipleServers(this.servers);
            
            for (const [gameType, servers] of Object.entries(statusResults)) {
                this.updateServerUI(gameType, servers);
            }
        } catch (error) {
            console.error('Error updating server status:', error);
        }
    }

    updateServerUI(gameType, servers) {
        const tabContent = document.getElementById(gameType);
        if (!tabContent) return;

        // Find or create server status container
        let statusContainer = tabContent.querySelector('.server-status-container');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.className = 'server-status-container';
            
            // Insert after header
            const header = tabContent.querySelector('.content-header');
            if (header) {
                header.insertAdjacentElement('afterend', statusContainer);
            } else {
                tabContent.insertBefore(statusContainer, tabContent.firstChild);
            }
        }

        // Clear existing content
        statusContainer.innerHTML = '';

        // Add servers
        servers.forEach((server, index) => {
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
            
            statusContainer.appendChild(serverElement);
        });

        // Update total player count in header
        const totalPlayers = servers.reduce((sum, server) => sum + server.players, 0);
        const headerPlayerCount = tabContent.querySelector('.players-online .count');
        if (headerPlayerCount) {
            headerPlayerCount.textContent = totalPlayers;
        }

        // Re-setup play buttons
        this.setupPlayButtons();
    }

    setupPlayButtons() {
        document.querySelectorAll('.btn-play:not(.disabled)').forEach(button => {
            button.addEventListener('click', () => {
                const ip = button.getAttribute('data-ip');
                const port = button.getAttribute('data-port');
                const protocol = button.getAttribute('data-protocol');
                
                window.electronAPI.connectToServer({ ip, port, protocol });
                
                // Visual feedback
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-play"></i> Rejoindre';
                }, 2000);
            });
        });
    }

    async updateNews() {
        for (const [category, url] of Object.entries(this.newsUrls)) {
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
                        
                        // Transform single post to articles format if needed
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

        // Clear existing news
        newsContainer.innerHTML = '';

        // Add news articles
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
            csgo: [
                { 
                    title: 'Serveur CS:GO PooLparty actif', 
                    content: 'Le serveur Counter-Strike: Global Offensive PooLparty DeathMatch est en ligne. Venez montrer vos compétences !', 
                    date: new Date().toISOString(),
                    author: 'Admin CS:GO'
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
            ]
        };

        const articles = fallbackNews[category] || fallbackNews.association;
        this.updateNewsUI(category, { articles });
    }

    // Utility method to add news programmatically
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

// Initialize the launcher when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameLauncher = new GameLauncher();
});
