
# ADR 004 – Intégration d'une API RESTful dans l'architecture existante

## Contexte
À la suite des laboratoires 0 à 2, le système logiciel repose sur une architecture Clean Architecture avec Domain-Driven Design (DDD) léger, divisée en sous-domaines (`hq`, `retail`, `shared`). Les interactions actuelles avec le système se font via une interface CLI. 

Dans le laboratoire 3 on a un nouveau besoin : exposer les fonctionnalités du système via une API RESTful, afin de :

- Permettre l’interopérabilité avec des clients web ou mobiles.
- Séparer les couches d’interface (front-end) et de logique métier.
- Préparer une évolution future vers une architecture microservices.

---

## Décision
Nous allons ajouter une interface RESTful dans un nouveau dossier `src/interfaces/api/`, en suivant les principes de Clean Architecture. Cette interface sera organisée comme suit :

```
src/interfaces/api/
├── controllers/     # Adaptateurs HTTP → Usecases
├── routes/          # Définition des routes REST (Express)
├── dtos/            # Data Transfer Objects (entrée/sortie REST)
├── middlewares/     # CORS, Auth, Error handler
└── docs/            # swagger.yaml pour OpenAPI
```

🧩 UC1 – Générer un rapport consolidé des ventes

| Élément               | Détail                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **Domaine**           | `hq`                                                                                                 |
| **Usecase**           | `usecases/hq/generateSalesReport.js`                                                                 |
| **Méthode HTTP**      | `GET`                                                                                                |
| **URI**               | `/api/v1/reports/sales?from=2025-06-01&to=2025-06-07`                                                |
| **Paramètres**        | `from` et `to` (date ISO 8601, en `query`)                                                           |
| **Réponse HTTP**      | `200 OK` avec un objet JSON contenant : par magasin : ventes totales, produits les plus vendus, date |
| **Statuts possibles** | `200 OK`, `400 Bad Request` (dates invalides), `500`                                                 |


🧩 UC2 – Consulter le stock d’un magasin spécifique

| Élément               | Détail                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| **Domaine**           | `retail`                                                                 |
| **Usecase**           | `usecases/retail/checkStock.js`                                          |
| **Méthode HTTP**      | `GET`                                                                    |
| **URI**               | `/api/v1/stores/:storeId/stock`                                          |
| **Paramètres**        | `storeId` (dans l’URL)                                                   |
| **Réponse HTTP**      | `200 OK` avec la liste des produits (`id`, `name`, `stock`, `threshold`) |
| **Statuts possibles** | `200`, `404 Not Found`, `400 Bad Request`                                |

🧩 UC3 – Visualiser les performances globales des magasins

| Élément               | Détail                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| **Domaine**           | `hq`                                                                       |
| **Usecase**           | `usecases/hq/dashboard.js`                                                 |
| **Méthode HTTP**      | `GET`                                                                      |
| **URI**               | `/api/v1/dashboard`                                                        |
| **Paramètres**        | Aucun (optionnel : `from`, `to` pour filtrer dans le temps)                |
| **Réponse HTTP**      | `200 OK` avec liste des indicateurs par magasin : CA, stock dispo, alertes |
| **Statuts possibles** | `200`, `500`                                                               |

🧩 UC4 – Mettre à jour les informations d’un produit

| Élément               | Détail                                              |
| --------------------- | --------------------------------------------------- |
| **Domaine**           | `retail`                                            |
| **Usecase**           | *(à créer ou réutiliser si existant)*               |
| **Méthode HTTP**      | `PUT`                                               |
| **URI**               | `/api/v1/products/:productId`                       |
| **Body**              | JSON : `{ name, price, stock, description }`        |
| **Réponse HTTP**      | `200 OK` ou `204 No Content` si succès sans réponse |
| **Statuts possibles** | `200`, `204`, `400`, `404`, `500`                   |

### Justification
Chaque contrôleur REST sera responsable de :
- Extraire les paramètres HTTP (query, params, body).
- Mapper ces données vers un DTO métier.
- Appeler un usecase depuis `src/usecases`.
- Formater la réponse HTTP avec un code de statut approprié.

Les usecases **ne seront pas modifiés** pour rester découplés de toute technologie (Express, HTTP, etc.). L’infrastructure (ORM Sequelize, PostgreSQL) reste inchangée.

### Conséquences
- Le système respecte toujours la Clean Architecture :
  - Entrée REST (interfaces/api/controllers) dépend des usecases
  - Les usecases dépendent du domaine abstrait (entités, interfaces)
  - L’infrastructure reste une implémentation concrète

- Le découplage technologique est maintenu :
  - Possibilité de réutiliser les usecases pour une autre interface (ex : GraphQL ou tâche cron)
  - Facilité de test unitaire et d’intégration

- L’exposition REST respecte les bonnes pratiques du Labo 3 :
  - URI cohérentes (ex: `/api/v1/products`)
  - Méthodes HTTP standardisées (GET, POST, PUT, etc.)
  - Documentation Swagger (OpenAPI 3.0)
  - Sécurité via CORS + auth légère (token ou Basic)
  - Intégration dans le pipeline CI/CD

- La complexité du code est maîtrisée car chaque couche conserve une responsabilité claire :
  - Contrôleur : adaptation HTTP
  - Usecase : logique métier
  - Domaine : règles métier pures
  - Infrastructure : implémentation ORM/postgreSQL

---

## Alternatives envisagées
- **Appeler les usecases directement dans les routes :** rejeté. Cela violerait le principe d’isolation des responsabilités et l’indépendance du framework HTTP.
- **Fusionner API REST et CLI :** rejeté. L’API REST répond à d’autres cas d’utilisation et à d'autres besoins techniques (interopérabilité, microservices, etc.).

## Conclusion
Cette stratégie d’exposition REST permet une extension naturelle et conforme de notre architecture existante, en respectant les principes de Clean Architecture, le découplage DDD, et les objectifs du Labo 3. Elle constitue la première étape vers une architecture distribuée moderne et maintenable.