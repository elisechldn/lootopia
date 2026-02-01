# Cahier des charges – Mastère 1

## Développement Full Stack

## Projet Lootopia – Proof of Concept Fonctionnel

---

## I. Contexte et problématique

Lootopia est une plateforme innovante de chasses au trésor numériques, mêlant interactions en ligne, géolocalisation et réalité augmentée.

Le client fictif, **Out of Cache**, est une agence digitale spécialisée dans les solutions ludiques pour l’événementiel, le tourisme et l’éducation.

Le projet vise à développer un **MVP (Minimum Viable Product)** de Lootopia, permettant à des utilisateurs de créer et de participer à des chasses au trésor interactives.

### Problèmes identifiés

- Applications de gamification trop limitées (quiz, géocaching uniquement)
- Expériences peu intuitives, surtout sur mobile
- Peu d’outils pour les partenaires (musées, villes, associations)
- Intégration de la réalité augmentée marginale et complexe

**Enjeu métier :** créer une application simple, ludique et immersive, utilisable par les joueurs et par les partenaires organisateurs.

---

## II. Objectifs du projet

- Offrir une expérience fluide et intuitive
- Permettre aux partenaires de créer et gérer leurs propres chasses
- Intégrer une première couche de gamification (scores, progression)
- Exploiter la cartographie et la réalité augmentée

---

## III. Organisation et besoins par pôle

| Pôle         | Besoins spécifiques                                 | Exemples de solutions                        |
| ------------ | --------------------------------------------------- | -------------------------------------------- |
| Utilisateurs | Créer un compte, se connecter, rejoindre une chasse | Auth JWT, formulaires simples                |
| Partenaires  | Créer des chasses, gérer étapes et indices          | Backoffice minimal, CRUD                     |
| Technique    | API fiable, gestion DB, cartographie / RA           | Node.js + PostgreSQL, Google Maps API, AR.js |
| Direction    | Produit démontrable et attractif                    | MVP, vidéo de démonstration                  |

---

## IV. Fonctionnalités attendues (M1)

1. Gestion des utilisateurs : inscription, connexion, profils, authentification sécurisée (JWT)
2. Création et gestion de chasses (CRUD)
3. Participation aux chasses :
   - Carte interactive
   - Points de passage
   - Action « Creuser »
4. Réalité augmentée basique : marqueurs AR via **AR.js** ou **A-Frame**
5. Gamification basique : progression et attribution de points
6. Interface intuitive et responsive

---

## V. Solution technique conseillée

| Domaine                 | Outils recommandés                         |
| ----------------------- | ------------------------------------------ |
| Backend                 | Node.js (Next.js)                          |
| Base de données         | PostgreSQL                                 |
| Frontend                | React (Next.js) + TailwindCSS avec ShadCn  |
| Cartographie            | Google Maps API ou Leaflet                 |
| Réalité augmentée       | A-Frame                                    |
| Sécurité                | Auth JWT, bcrypt / Argon2                  |
| Outils de développement | GitHub Student Pack, Docker, Trello / Jira |

---

## VI. Innovations attendues

- Mise en avant de la cartographie et de la réalité augmentée
- Interface **mobile first**
- Code modulaire permettant des extensions futures
- Respect des bonnes pratiques d’accessibilité et d’UX

---

## VII. Répartition des rôles entre étudiants

| Étudiant      | Rôle principal           | Missions                                 |
| ------------- | ------------------------ | ---------------------------------------- |
| 1             | Backend & API            | API, base de données, authentification   |
| 2             | Frontend & UX            | React, cartographie / RA, responsive     |
| 3             | Partenaires & Backoffice | CRUD des chasses, interfaces partenaires |
| 4 (optionnel) | Documentation & Qualité  | Tests, rapport, vidéo                    |

---

## VIII. Livrables attendus

- Analyse du besoin
- MVP fonctionnel (comptes utilisateurs, chasses, RA simple)
- Documentation technique (API, base de données, architecture)
