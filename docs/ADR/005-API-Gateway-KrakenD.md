# ADR-005 — Choix de KrakenD comme API Gateway

## Contexte
Dans l’évolution vers une architecture microservices, un point d’entrée unique est requis pour :

- centraliser l’accès aux différents services (stock, ventes, rapports…)
- gérer l’authentification (JWT)
- simplifier le routage client (ex: `GET /stock/1` → `stock-service`)
- documenter l’API globalement avec Swagger (à venir)

Plusieurs solutions étaient envisageables :
- Implémenter une gateway maison avec Express
- Utiliser un reverse proxy comme NGINX
- Intégrer une solution spécialisée comme **Krakend**, Kong, ou Tyk

## Décision
Nous avons choisi **Krakend** comme API Gateway pour les raisons suivantes :
- Configuration déclarative simple (`krakend.json`)
- Facile à intégrer en Docker
- Performance élevée
- Support natif de JWT, throttling, caching, transformation de réponse
- Compatible avec Swagger / OpenAPI

## Conséquences
- Toute communication client → services passera par Krakend
- L'authentification se fera au niveau de la gateway (token JWT)
- Chaque microservice n’a plus à exposer sa propre documentation publique
- Il faudra gérer proprement le mapping des routes dans la config

## Alternatives rejetées
- Express personnalisé : trop de maintenance manuelle
- Kong : trop complexe pour un projet aussi simple
