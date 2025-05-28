# 002 - Séparation des responsabilités

## Structure du projet

J’ai choisi de suivre le pattern **Clean Architecture** pour bien séparer les responsabilités :

- **Présentation (src/cli)**  
  Contient uniquement l’interface console : menus, prompts, interaction avec l’utilisateur.  
  Exemples : `sellProduct.js`, `searchProduct.js`, etc.

- **Logique métier (src/usecases)**  
  Contient les vrais cas d’utilisations (rechercher, vendre, retour, stock).  
  Utilise les repositories et les entités du domaine.  
  Ne dépend d’aucune lib externe.

- **Persistance (src/infrastructure)**  
  Contient les `repositories`, les `models Sequelize` et la config DB.  
  Ici on interagit avec PostgreSQL via Sequelize.

- **Domaine (src/domain)**  
  Définit les entités (`Product`, `Sale`, `User`) sans aucune logique DB ou interface.

---

## Pourquoi Clean Architecture ?

- Permet de **séparer le code** par responsabilités.
- Rend le projet **plus clair, testable et maintenable**.
- Prépare bien les prochains labos (ex : ajout d’API ou changement de DB).
- J’ai choisi ce modèle pour apprendre autre chose que le classique MVC et structurer mon projet de façon plus pro.

---

## Persistance

- J’utilise **Sequelize** comme ORM pour manipuler la base plus facilement.
- Les repositories traduisent les données entre les `models Sequelize` et les entités du domaine.
- Si on change un jour d’ORM ou de base, seule la couche `infrastructure` sera à modifier.
