# 003 – Architecture logicielle du projet POS (Clean Architecture + DDD)

## Introduction

Ce projet a été conçu dès le départ autour du **Clean Architecture Design Pattern**, enrichi par une structuration par **sous-domaines fonctionnels (DDD léger)**.  
L’objectif est de rendre le système modulaire, testable, et adaptable à des évolutions futures comme l’ajout d’une API, d’un front-end ou d’un système distribué.

---

## Vue générale

L’architecture est divisée en quatre grandes couches :

1. **Domaine** – logique métier pure, indépendante de toute technologie
2. **Cas d’utilisation** – logique applicative, organisée par domaine fonctionnel
3. **Infrastructure** – implémentation technique des interfaces (ex: PostgreSQL)
4. **Présentation** – interface CLI qui orchestre les usecases

Cette organisation permet de respecter l’**inversion de dépendance** : la logique métier ne dépend d’aucune technologie ni outil externe.

---

## 1. Couche Domaine (`src/domain/`)

La couche `domain` contient les **entités métier fondamentales** comme :

- `Product`, `Sale`, `Inventory`, `User`, `Store`

Ces entités sont de simples classes, avec leurs **attributs** et **méthodes métier** (ex. : `decrementStock()`, `isLowStock()`, `getTotal()`...).

Elles ne dépendent d’aucun framework, base de données ou I/O.

Le domaine est aussi organisé par sous-dossier :
- `retail/entities`, `logistics/entities`, `shared/entities`

---

## 2. Cas d'utilisation (`src/usecases/`)

La logique applicative est regroupée par sous-domaine :
- `retail` (vente, retour, consultation)
- `logistics` (réapprovisionnement)
- `admin` (rapports, tableau de bord)

Chaque fichier exporte une fonction de type `makeXxxUseCase({ repository })` qui injecte les dépendances requises.  
Ces usecases orchestrent les appels aux entités et repositories, sans rien connaître de la couche technique.

Cette approche permet de :
- garantir la **testabilité**
- éviter le couplage avec l’implémentation
- respecter les règles métier définies dans le domaine

---

## 3. Infrastructure (`src/infrastructure/`)

Cette couche fournit l’**implémentation concrète des interfaces du domaine**. Elle contient :

- les modèles Sequelize (`models/`)
- les repositories (`repositories/`) qui traduisent les `Model` en entités métiers
- la configuration de la base de données

Les fichiers comme `productRepository.js`, `saleRepository.js` sont responsables de :
- lire/écrire dans PostgreSQL via Sequelize
- retourner des objets de domaine (`new Product(...)`, etc.)

La logique métier est absente ici. L’infrastructure est donc **complètement interchangeable**.

---

## 4. Présentation (`src/cli/`)

La couche `cli` contient l’interface utilisateur en ligne de commande :

- Affichage des menus (`menuPrompt.js`)
- Exécution des cas d’utilisation (ex. : `sellProduct.js`, `returnSale.js`, etc.)

Chaque commande importe un usecase et lui injecte les bons `repositories`.

Aucune règle métier n’est implémentée ici. La CLI se limite aux interactions avec l’utilisateur et à l’appel des cas d’utilisation.

---

## 5. Règles d’architecture

L’architecture respecte les règles suivantes :

- **Dépendance unidirectionnelle** (CLI → Usecases → Interfaces → Implémentations)
- Aucun usecase ne connaît Sequelize ou la BD
- Les entités du domaine ne connaissent rien de l’extérieur
- La CLI ne fait que déclencher les actions, sans logique métier

---

## Application du Domain-Driven Design

Même si ce projet reste à échelle réduite, nous avons appliqué certains principes du DDD :

- Séparation explicite des sous-domaines (`retail`, `logistics`, `admin`)
- Responsabilités métier centrées autour des entités et de leurs comportements
- Utilisation d’un vocabulaire commun entre les fichiers, les noms de usecases et les entités

Cette séparation par sous-contexte facilite l’évolution vers des modules distribués dans les futurs labos.

---

## Conclusion

Cette architecture rend le système :

- Facilement maintenable
- Facile à faire évoluer ou tester
- Robuste à des changements technologiques (ex. : switch d’ORM)
- Prêt à accueillir une API ou un front-end sans modifier le cœur métier

En combinant Clean Architecture et principes DDD, nous avons structuré un système **clairement découplé, modulaire et scalable**.
