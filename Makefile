API_DIR := apps/api

.PHONY: setup build start stop reset seed help

## Initialise l'environnement complet (build + démarrage + BDD + seed)
setup: build start reset

## Construit les images Docker (à faire une seule fois ou après modification du code)
build:
	docker compose build

## Lance les conteneurs en arrière-plan et attend que la BDD soit prête
start:
	docker compose --profile init up -d --build minio-init
	docker compose up -d --build --wait

## Arrête et supprime les conteneurs et les volumes
stop:
	docker compose --profile init down -v
	docker compose down -v

## Réinitialise le schéma et les données sans reconstruire les images
reset:
	cd $(API_DIR) && npx prisma db push --force-reset
	cd $(API_DIR) && npx prisma db seed

## Injecte uniquement les données (sans reset du schéma)
seed:
	cd $(API_DIR) && npx prisma db seed

## Affiche les commandes disponibles
help:
	@echo ""
	@echo "  make setup   — build + démarrage + reset BDD + seed (premier lancement)"
	@echo "  make build   — construit les images Docker"
	@echo "  make start   — démarre les containers sans rebuild"
	@echo "  make stop    — arrête et supprime containers et volumes"
	@echo "  make reset   — remet la BDD à zéro et injecte le seed"
	@echo "  make seed    — injecte uniquement les données de seed"
	@echo ""