# Choix technologiques

## Client (Application console - CLI)

### Langage : Node.js
  Node.js est rapide, léger et simple à installer. Il permet d'écrire du JavaScript côté serveur. Il est parfait pour créer une application en ligne de commande.

### Librairies
- **commander** : pour gérer les commandes CLI (comme `vente`, `produit`, etc.).
- **inquirer** : pour poser des questions à l’utilisateur (choix, saisies...).
- **chalk** : pour colorer le texte dans le terminal.
- **ora** : pour afficher des animations (spinners) pendant un chargement (requetes asynchrones par exemple).
- **figlet** : pour ajouter un beau titre ASCII à l’application.

## Serveur (Base de données et persistance)

### Base de données - SQLite
  C'est est une BD simple qui demande pas de serveur. Elle est rapide, légère et stocke les données dans un fichier donc parfaite pour un projet local.

### ORM - Sequelize
  C'est est une bibliothèque Node.js qui permet de manipuler la base de données avec du JavaScript.Elle supporte bien SQLite et facilite les requêtes en utilisant des objets au lieu de SQL brut.

## DevOps

- **Docker** : pour créer un environnement identique sur toutes les machines.
- **Docker Compose** : pour lancer l’application avec la base de données ensemble.

## Pourquoi?
- Facile à apprendre et à installer.
- Fonctionne bien sur toutes les plateformes.
- Bien adapté à un projet local.
- Bonne communauté et beaucoup de ressources.
- Facile à déployer et à maintenir.