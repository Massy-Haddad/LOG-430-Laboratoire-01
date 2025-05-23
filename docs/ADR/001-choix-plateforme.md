# ADR 001 – Choix de la plateforme
## Décision
Node.js (version LTS 20.x) comme plateforme principale pour le développement de l’application console.

## Raisons
1. **Écosystème CLI puissant** : Node.js a une grande bibliothèque d’outils conçus spécifiquement pour les CLI, comme `commander`, `inquirer`, `chalk`, qui permettent de construire rapidement un UI en ligne de commande.

2. **Simplicité d’installation** : Node.js est multiplateforme (Windows, Linux, macOS) et facile à installer. Il est également compatible avec les environnements Docker, ce qui simplifie le déploiement.

3. **Asynchrone et rapide** : Node.js est bien adapté pour des opérations d’I/O fréquentes, comme l’accès aux fichiers ou aux bases de données.

4. **Bonne intégration avec les ORMs** : Des ORM solides comme Sequelize existent pour Node.js, offrant une abstraction efficace de la persistance.

5. **Communauté active** : Node.js a une communauté très active et d’un bon écosystème, ce qui facilite la recherche d'outils et de bibliothèques.

## Bénéfices

- L’ensemble de l’application pourra être écrit en JavaScript, facilitant la maintenance.
- La stack pourra facilement évoluer vers une architecture plus complexe (REST API ou microservices) si besoin.
- Nécessite une attention à la gestion des erreurs et au typage (JavaScript étant dynamiquement typé).