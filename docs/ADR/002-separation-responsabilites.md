# 002 - Séparation des responsabilités

## Structure du projet

J’ai structuré le projet selon le pattern **Clean Architecture** pour assurer une séparation claire des responsabilités :

- **Présentation (src/cli)**  
  Contient uniquement l’interface console (menus, prompts, interaction utilisateur).  
  Les fichiers ici déclenchent des cas d’utilisation sans contenir de logique métier.  
  Exemples : `sellProduct.js`, `searchProduct.js`, `dashboard.js`, etc.

- **Logique métier (src/usecases)**  
  Contient les vrais cas d’utilisation (vendre un produit, retourner une vente, consulter le stock, réapprovisionner, générer un tableau de bord, etc.).  
  Chaque usecase est construit sous forme de fonction `makeUseCase(...)` avec **injection de dépendances** (repositories).  
  Ne dépend d’aucune librairie externe ou technologie spécifique.  
  Séparé en sous-dossiers par sous-domaine fonctionnel :
  - `retail` → opérations en magasin
  - `logistics` → gestion des stocks logistiques
  - `admin` → analyse et supervision

- **Persistance (src/infrastructure)**  
  - Contient les implémentations concrètes des `repositories`, les `models Sequelize`, et la configuration de la base de données.  
  - Cette couche traduit les données entre PostgreSQL et les entités métier.  
  - Chaque repository retourne des objets du domaine (`Product`, `Sale`, etc.), pas des `Model Sequelize`.

- **Domaine (src/domain)**  
  - Définit les entités du cœur métier (`Product`, `Sale`, `Inventory`, etc.) et les objets utilisés en logique pure.  
  - Cette couche ne connaît ni la BD, ni Sequelize, ni les prompts : elle est complètement indépendante.  
  - Elle contient aussi les méthodes métiers comme `decrementStock()`, `isLowStock()`, `getTotal()`, etc.  
  - Le domaine est également organisé par sous-domaine (`shared`, `retail`, `logistics`).

---

## Pourquoi Clean Architecture ?

- Elle permet de séparer le code en couches claires et indépendantes.
- Elle rend le projet plus testable, maintenable et évolutif.
- Elle respecte l’**inversion de dépendance** : les usecases dépendent d’abstractions (repositories) et non d’implémentations concrètes.
- Elle rend possible l’ajout futur d’interfaces supplémentaires (API Web, UI, etc.) sans toucher à la logique métier.
- Elle me prépare bien aux prochains labos (ex. : ajout d’une API, distribution, microservices, etc.).
- J’ai aussi choisi ce modèle pour apprendre une alternative au classique MVC et me rapprocher des architectures modernes utilisées en entreprise.

---

## Persistance

- J’utilise **Sequelize** comme ORM pour interagir plus facilement avec PostgreSQL.
- Les **repositories** convertissent les `models Sequelize` en entités du domaine (`Product`, `Sale`, `Inventory`) à l’aide de `new Product(...)`, etc.
- La logique métier n’a **aucune dépendance directe** vers Sequelize.
- Si un jour on change d’ORM ou de base de données, **seule la couche `infrastructure` serait impactée**, les autres resteraient inchangées.

---

## Évolution dans le Labo 2

- L’architecture a évolué pour supporter plusieurs **magasins**, un **centre logistique**, et une **maison mère**.
- Chaque magasin fonctionne indépendamment via `storeId`, et les ventes, retours, stocks sont rattachés à ce contexte.
- Le domaine `logistics` a été ajouté pour supporter la gestion d’un stock central (`storeId = 0`) et le **réapprovisionnement automatique**.
- Le domaine `admin` permet à un utilisateur de type `admin` d'accéder à un **tableau de bord**, sans modifier la logique magasin.
- La logique a été strictement regroupée par **sous-domaine fonctionnel**, rendant l’ensemble plus clair et modulaire.

---

### Référence 

[Clean Architecture](https://bitloops.com/docs/bitloops-language/learning/software-architecture/clean-architecture)