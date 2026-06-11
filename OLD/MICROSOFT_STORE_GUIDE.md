# Guide de Publication sur Microsoft Store

## Configuration Complète pour Microsoft Store

### 1. Modifications Apportées

#### package.json
- **Configuration APPX** : Ajout de la configuration spécifique pour les packages Microsoft Store
- **Gestion des Dépendances** : Configuration pour inclure automatiquement toutes les dépendances Node.js
- **Scripts de Build** : Nouveaux scripts `build-msix` et `build-store` pour générer les packages MSIX
- **Métadonnées** : Ajout des informations requises (publisher, copyright, etc.)

#### Nouveaux Fichiers
- **build/installer.nsh** : Script NSIS personnalisé pour l'installateur Windows
- **appxmanifest.xml** : Manifeste pour le package MSIX
- **build-store.bat** : Script automatisé pour construire le package Microsoft Store

### 2. Installation Automatique des Dépendances

Les dépendances sont maintenant automatiquement incluses grâce à :

```json
"extraResources": [
  {
    "from": "node_modules",
    "to": "node_modules",
    "filter": ["**/*"]
  }
]
```

Cette configuration garantit que :
- Toutes les dépendances Node.js sont empaquetées
- Les modules natifs (comme GameDig) sont inclus
- L'application fonctionne sans installation séparée de Node.js

### 3. Étapes de Publication

#### Étape 1 : Préparation
```bash
# Installer les dépendances
npm install

# Tester l'application
npm start
```

#### Étape 2 : Construction du Package MSIX
```bash
# Option 1 : Script automatique
build-store.bat

# Option 2 : Commande manuelle
npm run build-store
```

#### Étape 3 : Vérification du Package
Le package MSIX sera généré dans `dist/` avec le nom :
`Royal Multi Gamers Launcher-1.0.0-x64.appx`

#### Étape 4 : Publication sur Microsoft Store

1. **Créer un Compte Développeur**
   - Inscrivez-vous sur [Partner Center](https://partner.microsoft.com)
   - Payez les frais d'inscription (99$ pour les particuliers)

2. **Créer une Nouvelle Application**
   - Cliquez sur "Créer une nouvelle application"
   - Réservez le nom "Royal Multi Gamers Launcher"

3. **Télécharger le Package**
   - Dans la section "Packages", téléchargez le fichier `.appx`
   - Le système vérifiera automatiquement la compatibilité

4. **Compléter les Informations**
   - **Description** : Description détaillée de l'application
   - **Captures d'écran** : Au moins 1 capture d'écran (1920x1080 recommandé)
   - **Icônes** : Logo de l'application (déjà configuré)
   - **Catégorie** : "Jeux" ou "Utilitaires"

5. **Configuration des Prix**
   - Gratuit ou payant selon votre choix
   - Disponibilité géographique

6. **Soumission pour Certification**
   - Microsoft examine l'application (1-7 jours)
   - Correction des éventuels problèmes
   - Publication automatique après approbation

### 4. Avantages de cette Configuration

#### Installation Automatique
- **Aucune dépendance externe** : Node.js et npm ne sont pas requis
- **Installation en un clic** : Via Microsoft Store
- **Mises à jour automatiques** : Gérées par le Store
- **Sécurité renforcée** : Sandbox et vérifications Microsoft

#### Compatibilité
- **Windows 10/11** : Support natif
- **Architecture x64** : Optimisé pour les processeurs modernes
- **Permissions minimales** : Accès Internet uniquement

### 5. Dépannage

#### Erreur de Build
```bash
# Nettoyer et reconstruire
rmdir /s /q dist
rmdir /s /q node_modules
npm install
npm run build-store
```

#### Problème de Certificat
Pour les tests locaux, vous pouvez créer un certificat auto-signé :
```bash
# Générer un certificat de test
makecert -r -pe -n "CN=Royal Multi Gamers Launcher" -ss my -sr CurrentUser
```

#### Validation du Package
Utilisez l'outil Windows App Certification Kit :
```bash
# Télécharger depuis Microsoft Store
# Tester le package avant soumission
```

### 6. Maintenance Post-Publication

#### Mises à Jour
1. Modifier le numéro de version dans `package.json`
2. Reconstruire le package MSIX
3. Télécharger la nouvelle version sur Partner Center
4. Les utilisateurs recevront la mise à jour automatiquement

#### Métriques
- Consultez les statistiques dans Partner Center
- Analysez les téléchargements et l'utilisation
- Répondez aux avis des utilisateurs

### 7. Coûts

- **Inscription développeur** : 99$ (une fois)
- **Publication** : Gratuite
- **Commission Microsoft** : 30% sur les ventes (si payant)

### 8. Alternatives

Si Microsoft Store n'est pas souhaité :
- **Distribution directe** : Utilisez `npm run build-win` pour créer un installateur NSIS
- **GitHub Releases** : Distribution via GitHub
- **Site web** : Téléchargement direct

Cette configuration garantit une installation fluide et automatique de toutes les dépendances, offrant une expérience utilisateur optimale sur Microsoft Store.
