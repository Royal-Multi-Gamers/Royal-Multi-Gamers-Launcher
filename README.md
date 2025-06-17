# Game Association Launcher

Un launcher de jeux moderne inspiré de Battle.net pour une association de jeux vidéo.

## Fonctionnalités

- Interface moderne et intuitive
- Statut des serveurs en temps réel
- Système de news pour chaque jeu
- Connexion rapide aux serveurs
- Support pour Counter-Strike: Source, CS:GO et ECO
- Intégration Discord

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-organisation/game-launcher.git
cd game-launcher
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le launcher en mode développement :
```bash
npm start
```

## Construction de l'exécutable

Pour créer un exécutable Windows (.exe) :

1. Exécutez le script de build :
```bash
build-simple.bat
```

2. L'exécutable sera créé dans le dossier `dist`.

## Configuration des serveurs

Les serveurs sont configurés dans le fichier `js/app.js`. Pour ajouter ou modifier un serveur :

1. Ouvrez `js/app.js`
2. Modifiez la section `servers` avec vos informations :
```javascript
servers: {
    css: [
        {
            name: 'Nom du serveur',
            ip: 'adresse-ip',
            port: 'port',
            type: 'css',
            protocol: 'steam'
        }
    ]
}
```

## Système de news

Les news sont stockées dans des fichiers JSON dans le dossier `api-news/`. Chaque jeu a son propre fichier de news.

Format des news :
```json
{
  "articles": [
    {
      "title": "Titre de la news",
      "content": "Contenu de la news",
      "date": "2024-06-17T10:00:00Z",
      "author": "Auteur"
    }
  ]
}
```

## Développement

- `main.js` : Point d'entrée Electron
- `preload.js` : Script de préchargement pour l'API Electron
- `index.html` : Interface utilisateur principale
- `js/app.js` : Logique principale du launcher
- `styles/main.css` : Styles de l'interface

## Licence

MIT License

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
