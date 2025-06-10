# LOG430 - Système de Caisse (POS)

Ce projet consiste à concevoir un système de caisse scalable et modulaire, évoluant d’une architecture simple (2-tier) vers une architecture orientée domaines (DDD léger) en suivant les principes de la Clean Architecture.

## 📘 Contexte

Ce projet s’inscrit dans le cadre des laboratoires 0, 1 et 2 du cours LOG430 :

- **Laboratoire 0** [(lien)](https://github.com/Massy-Haddad/LOG-430-Laboratoire-0/releases/tag/Lab-0) : mise en place de l’infrastructure technique (Docker, CI/CD, versioning).
- **Laboratoire 1** [(lien)](https://github.com/Massy-Haddad/LOG-430-Laboratoire-01/releases/tag/Labo-01) : conception d’une application client/serveur à deux tiers avec persistance locale.
- **Laboratoire 2** [(lien)](https://github.com/Massy-Haddad/LOG-430-Laboratoire-01/releases/tag/Labo-02) : refonte vers une architecture multi-magasins orientée domaine, avec vue consolidée HQ, logistique centralisée et CI/CD avancée.

---

## Résumé des ADRs

`001-choix-plateforme.md`  
- Justifie l’adoption de **Node.js**, **PostgreSQL**, et **Docker** pour une solution légère, portable et bien supportée.  
- L’écosystème JS permet une intégration fluide du CLI et des outils de persistance via Sequelize.

`002-separation-responsabilites.md`  
- Découpe clair entre présentation (CLI), logique métier (usecases), domaine (entités pures) et infrastructure (accès BD).  
- Application des principes SOLID et de la Clean Architecture.

`003-architecture.md`  
- Présente l’évolution vers une architecture orientée domaines (DDD) avec une vision par sous-domaines (Retail, Logistique, HQ).  
- Transition d’un modèle monolithique à une architecture modulaire, favorisant la scalabilité et la maintenabilité.

---

## Diagrammes UML (`docs/UML/`)

| Diagramme                              | Description |
|----------------------------------------|-------------|
| `vue_cas_utilisation.puml`          | Cas d’utilisation majeurs du système : vente, retour, consultation, rapports |
| `vue_logique.puml`                  | Diagramme de classes métier : produits, ventes, utilisateurs |
| `vue_processus_retail_domain.puml`  | Interactions séquentielles pour la vente en magasin |
| `vue_processus_logistics_domain.puml`| Réapprovisionnement et communication centre logistique ↔ magasins |
| `vue_processus_hq_domain.puml`      | Génération de rapports consolidés par la maison mère |
| `vue_implementation.puml`           | Organisation des modules (CLI, usecases, infrastructure...) |
| `vue_deploiement.puml`             | Architecture conteneurisée multi-composants (CLI, DB, etc.) |

---

## ▶️ Exécution locale

```bash
git clone <repo>
cd <repo>

docker compose up --build -d     # Démarre les conteneurs (PostgreSQL, CLI)
npm run seed                     # Injecte les données d'exemple
npm run cli                      # Lance le client console
```

---

## 🧪 Exécution des tests

```bash
npm run lint       # Vérification du style (ESLint)
npm run test       # Tests unitaires (Jest)
```

Les tests couvrent la logique métier et la persistance (mockée via Sequelize). La CI valide automatiquement chaque push.

---

## 🛠️ Technologies utilisées

| Couche          | Technologies |
|-----------------|--------------|
| **Client CLI**  | Node.js, Inquirer, Commander, Chalk, Figlet |
| **Domaine**     | Classes JS pures (ES6), Clean Architecture |
| **Persistance** | PostgreSQL, Sequelize ORM |
| **CI/CD**       | GitHub Actions (Lint + Test + Build + Docker Push) |
| **Infrastructure** | Docker, Docker Compose |

---

## 🎓 Objectifs pédagogiques atteints

- ✅ Mise en place d’une infrastructure Docker/CI/CD reproductible (Lab 0)
- ✅ Application de la Clean Architecture et séparation stricte des responsabilités (Lab 1)
- ✅ Persistance via ORM avec PostgreSQL + tests automatisés
- ✅ Structuration et documentation technique (ADR, 4+1 UML)
- ✅ Évolution vers une architecture multi-domaine avec DDD simplifié (Lab 2)

## Références

- [Clean Architecture](https://bitloops.com/docs/bitloops-language/learning/software-architecture/clean-architecture)
- [Domain-Driven Design](https://www.oreilly.com/library/view/domain-driven-design-tackling/9780134434421/)
- [Building a CLI App with Node.js](https://egmz.medium.com/building-a-cli-with-node-js-in-2024-c278802a3ef5)
- [Sequelize Documentation](https://sequelize.org/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contributeurs

Ce projet a été réalisé par :
- **Massy Haddad** - [GitHub](https://github.com/Massy-Haddad)

