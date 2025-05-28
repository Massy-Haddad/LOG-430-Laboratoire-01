
# 002 - Séparation des responsabilités

## Structure du projet

J’ai structuré le projet selon le pattern **Clean Architecture** pour assurer une séparation claire des responsabilités :

- **Présentation (src/cli)**  
  Contient uniquement l’interface console (menus, prompts, interaction utilisateur).  
  Les fichiers ici déclenchent des cas d’utilisation sans contenir de logique métier.  
  Exemples : `sellProduct.js`, `searchProduct.js`, etc.

- **Logique métier (src/usecases)**  
  Contient les vrais cas d’utilisation (vendre un produit, retourner une vente, consulter le stock, etc.).  
  Chaque usecase est construit sous forme de fonction `makeUseCase(...)` avec **injection de dépendances** (repositories).  
  Ne dépend d’aucune librairie externe ou technologie spécifique.

- **Persistance (src/infrastructure)**  
  Contient les implémentations concrètes des `repositories`, les `models Sequelize`, et la configuration de la base de données.  
  Cette couche traduit les données entre PostgreSQL et les entités métier.

- **Domaine (src/domain)**  
  Définit les entités du cœur métier (`Product`, `Sale`) et les interfaces (`IProductRepository`, `ISaleRepository`).  
  Cette couche ne connaît ni la BD, ni Sequelize, ni les prompts : elle est complètement indépendante.

---

## Pourquoi Clean Architecture ?

- Elle permet de séparer le code en couches claires et indépendantes.
- Elle rend le projet plus testable, maintenable et évolutif.
- Elle me prépare bien aux prochains labos (ex. : ajout d’une API, changement d’ORM, etc.).
- J’ai aussi choisi ce modèle pour apprendre une alternative au classique MVC et apprendre à m'adapter à différentes architectures.

---

## Persistance

- J’utilise **Sequelize** comme ORM pour interagir plus facilement avec PostgreSQL.
- Les **repositories** convertissent les `models Sequelize` en entités du domaine (`Product`, `Sale`) à l’aide de `new Product(...)`, etc.
- Si un jour on change d’ORM ou de base de données, **seule la couche `infrastructure` serait impactée**, les autres resteraient inchangées.