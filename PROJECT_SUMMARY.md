# Résumé du Projet - Game Association Launcher

## Vue d'ensemble

Ce projet est un launcher de jeux moderne développé avec Electron, inspiré du design de Battle.net de Blizzard. Il est destiné à une association de jeux vidéo et permet de gérer facilement l'accès à plusieurs serveurs de jeux.

## Technologies utilisées

- **Electron** : Framework pour applications desktop
- **Node.js** : Runtime JavaScript
- **GameDig** : Bibliothèque pour vérifier le statut des serveurs de jeux
- **Axios** : Client HTTP pour les requêtes
- **HTML5/CSS3/JavaScript** : Interface utilisateur moderne

## Fonctionnalités principales

### 1. Interface utilisateur
- Design moderne inspiré de Battle.net
- Navigation par onglets pour différents jeux
- Contrôles de fenêtre personnalisés (minimiser, maximiser, fermer)
- Interface responsive et intuitive

### 2. Gestion des serveurs
- Vérification du statut en temps réel avec GameDig
- Affichage du nombre de joueurs connectés
- Connexion directe aux serveurs via protocoles Steam/HTTP
- Support pour CSS, CS:GO, ECO et autres jeux

### 3. Système de news
- News personnalisées pour chaque jeu
- Format JSON pour faciliter la mise à jour
- Affichage avec images, dates et auteurs
- Système de fallback en cas d'erreur

### 4. Intégration sociale
- Boutons Discord et site web
- Ouverture de liens externes
- Communauté centralisée

## Structure du projet

```
game-launcher/
├── main.js                 # Point d'entrée Electron
├── preload.js             # Script de préchargement
├── index.html             # Interface principale
├── package.json           # Configuration npm
├── build-simple.bat       # Script de build Windows
├── README.md              # Documentation
├── INSTALLATION.md        # Guide d'installation
├── js/
│   └── app.js            # Logique principale
├── styles/
│   └── main.css          # Styles CSS
├── assets/
│   ├── logo.png          # Logo de l'association
│   └── icon.ico          # Icône de l'application
└── api-news/
    ├── association.json   # News de l'association
    ├── css.json          # News Counter-Strike Source
    ├── csgo.json         # News CS:GO
    └── eco.json          # News ECO
```

## Configuration des serveurs

Les serveurs sont configurés dans `js/app.js` :

```javascript
servers: {
    css: [
        {
            name: 'Serveur Poolparty DeathMatch',
            ip: 'poolparty.clan-rmg.com',
            port: '27015',
            type: 'css',
            protocol: 'steam'
        }
        // Autres serveurs...
    ]
}
```

## Packaging et distribution

### Formats supportés
- **.exe** : Exécutable Windows standard
- **MSIX** : Package Microsoft Store
- **NSIS** : Installateur Windows avec options

### Scripts de build
- `npm start` : Lancement en mode développement
- `npm run build-win` : Construction Windows
- `npm run build-msix` : Package MSIX
- `build-simple.bat` : Script automatisé

## Sécurité et bonnes pratiques

- **Context Isolation** : Isolation du contexte pour la sécurité
- **Preload Scripts** : API sécurisée entre main et renderer
- **No Node Integration** : Désactivation de l'intégration Node dans le renderer
- **External Links** : Ouverture sécurisée des liens externes

## Personnalisation

### Ajout de nouveaux jeux
1. Ajouter la configuration serveur dans `js/app.js`
2. Créer un fichier JSON de news dans `api-news/`
3. Ajouter l'onglet dans `index.html`
4. Mettre à jour les styles si nécessaire

### Modification du design
- Couleurs : Variables CSS dans `styles/main.css`
- Logo : Remplacer `assets/logo.png`
- Icône : Remplacer `assets/icon.ico`

## Maintenance

### Mise à jour des news
- Modifier les fichiers JSON dans `api-news/`
- Les news sont rechargées automatiquement

### Mise à jour des serveurs
- Modifier la configuration dans `js/app.js`
- Redémarrer l'application

### Mise à jour des dépendances
```bash
npm update
npm audit fix
```

## Déploiement

1. **Test local** : `npm start`
2. **Build** : `npm run build-win`
3. **Distribution** : Partager les fichiers du dossier `dist/`
4. **Microsoft Store** : Soumettre le package MSIX

## Évolutions possibles

- Système d'authentification utilisateur
- Statistiques de jeu intégrées
- Chat intégré
- Mise à jour automatique
- Support multi-langues
- Thèmes personnalisables
- Intégration avec d'autres plateformes (Steam, Epic Games)

## Performance

- Démarrage rapide grâce à Electron
- Vérification serveur asynchrone
- Interface réactive
- Consommation mémoire optimisée

Ce launcher offre une solution complète et professionnelle pour gérer l'accès aux serveurs de jeux d'une association, avec un design moderne et des fonctionnalités avancées.
