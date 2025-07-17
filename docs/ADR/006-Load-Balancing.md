# ADR-006 — Mise en place d’un Load Balancing

## Contexte
Dans un environnement de microservices, certaines routes (ex: `/stock`, `/checkout`) peuvent être fortement sollicitées.  
Pour garantir la scalabilité, il est nécessaire de prévoir un mécanisme de **load balancing** simple.

Les solutions envisagées étaient :
- Intégrer un orchestrateur complet (Kubernetes, Traefik)
- Utiliser le reverse proxy intégré de Docker (Compose)
- Ajouter des instances manuelles derrière NGINX ou Krakend

## Décision
Nous avons décidé d’utiliser le **réplica des services dans Docker Compose** combiné avec un **load balancing via Krakend** ou NGINX si nécessaire.

- Exemple : `stock-service` peut être répliqué (scale 2) dans Compose
- Krakend répartira les appels automatiquement via son `backend.hosts`

## Conséquences
- Le projet reste léger (pas besoin de Kubernetes)
- Chaque service peut être mis à l’échelle horizontalement si besoin
- Le comportement reste prédictible et simple à tester

## Limitations
- Pas de gestion automatique de montée en charge
- Nécessite de bons réglages dans les timeouts et le TTL cache

## Alternatives rejetées
- Kubernetes : trop complexe pour le scope de ce laboratoire
