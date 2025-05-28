## Système de Caisse - Application Console

### 📦 Description

Cette application est un système de caisse simple pour un petit magasin avec plusieurs caissiers. Elle permet de :
- Rechercher des produits
- Enregistrer une vente
- Gérer un retour
- Consulter le stock
- S'authentifier avec un nom d'utilisateur et mot de passe

Le tout fonctionne dans une interface console (CLI) et respecte le design pattern **Clean Architecture** pour assurer une bonne séparation des responsabilités.

---

### ▶️ Exécution locale

```bash
docker compose up --build -d     # Lance l’environnement complet
npm run seed                     # Remplit la base de données avec des exemples
npm run cli                      # Démarre l’application en CLI
```

### ✅ Tests et Lint

```bash
npm run lint       # Vérifie le code avec ESLint
npm run test       # Lance les tests unitaires
```

### 🛠️ Structure

- src/cli : Interface console avec inquirer
- src/usecases : Logique métier (UC) indépendante
- src/domain : Entités métiers simples (Classes)
- src/infrastructure :
  - /models : Modèles Sequelize
  - /repositories : Accès aux données
  - /database.js : Connexion Sequelize

### 🚀 CI/CD

Une pipeline GitHub Actions :
- Lint le code
- Exécute les tests
- Build l’image Docker
- Pousse sur Docker Hub automatiquement


### 🧪 Technologies
**Client** (CLI - Node.js) :
- **commander** : pour gérer les commandes CLI (comme `vente`, `produit`, etc.).
- **inquirer** : pour poser des questions à l’utilisateur (choix, saisies...).
- **chalk** : pour colorer le texte dans le terminal.
- **ora** : pour afficher des animations (spinners) pendant un chargement (requetes asynchrones par exemple).
- **figlet** : pour ajouter un beau titre ASCII à l’application.
- **cli-table3** : pour afficher les données (comme le stock) sous forme de tableaux lisibles dans la console.
- **bcrypt** : pour hasher les mots de passe et sécuriser l’authentification des utilisateurs.

**Persistance**
- **Base** de données : PostgreSQL
- **ORM** : Sequelize