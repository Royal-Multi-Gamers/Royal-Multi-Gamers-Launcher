# Guide d'installation - Royal Multi Gamers Launcher

## Prérequis

- Windows 10/11
- Node.js (version 16 ou supérieure)
- npm (inclus avec Node.js)

## Installation étape par étape

### 1. Installation de Node.js

1. Téléchargez Node.js depuis https://nodejs.org/
2. Installez la version LTS recommandée
3. Vérifiez l'installation en ouvrant un terminal et tapant :
```bash
node --version
npm --version
```

### 2. Installation du launcher

1. Téléchargez ou clonez le projet
2. Ouvrez un terminal dans le dossier du projet
3. Installez les dépendances :
```bash
npm install
```

### 3. Test du launcher

Lancez le launcher en mode développement :
```bash
npm start
```

### 4. Construction de l'exécutable

#### Option 1 : Script automatique
Double-cliquez sur `build-simple.bat`

#### Option 2 : Commandes manuelles
```bash
npm install --save-dev electron-builder
npm run build-win
```

### 5. Création du package MSIX (Microsoft Store)

Pour créer un package MSIX :
```bash
npm run build-msix
```

## Structure des fichiers générés

Après la construction, vous trouverez dans le dossier `dist` :
- `Royal Multi Gamers Launcher Setup.exe` : Installateur Windows
- `Royal Multi Gamers Launcher.exe` : Exécutable portable
- `Royal Multi Gamers Launcher.appx` : Package MSIX pour Microsoft Store

## Configuration personnalisée

### Modification des serveurs

Éditez le fichier `js/app.js` et modifiez la section `servers` :

```javascript
servers: {
    css: [
        {
            name: 'Votre serveur CSS',
            ip: 'votre-ip.com',
            port: '27015',
            type: 'css',
            protocol: 'steam'
        }
    ],
    // Ajoutez d'autres jeux...
}
```

### Types de serveurs supportés par GameDig

- `css` : Counter-Strike: Source
- `csgo` : Counter-Strike: Global Offensive
- `minecraft` : Minecraft
- `tf2` : Team Fortress 2
- `gmod` : Garry's Mod
- Et bien d'autres...

### Personnalisation des news

Modifiez les fichiers JSON dans le dossier `api-news/` :
- `association.json` : News de l'association
- `css.json` : News Counter-Strike: Source
- `csgo.json` : News CS:GO
- `eco.json` : News ECO

### Personnalisation de l'apparence

- Logo : Remplacez `assets/logo.png`
- Couleurs : Modifiez `styles/main.css`
- Icône de l'application : Remplacez `assets/icon.ico`

## Dépannage

### Erreur "npm not found"
- Réinstallez Node.js depuis le site officiel

### Erreur de construction
- Supprimez le dossier `node_modules`
- Exécutez `npm install` à nouveau

### Problème de connexion aux serveurs
- Vérifiez que les adresses IP et ports sont corrects
- Assurez-vous que GameDig supporte le type de serveur

### Le launcher ne se lance pas
- Vérifiez que toutes les dépendances sont installées
- Consultez la console pour les erreurs

## Support

Pour obtenir de l'aide :
1. Vérifiez ce guide d'installation
2. Consultez les logs d'erreur
3. Ouvrez une issue sur GitHub avec les détails de l'erreur
