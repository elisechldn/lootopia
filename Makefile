API_DIR := apps/api

.PHONY: setup start stop reset seed

## Lance les conteneurs, initialise la BDD et injecte les données
setup: start
	cd $(API_DIR) && npx prisma db push --force-reset
	cd $(API_DIR) && npx prisma db seed

## Lance les conteneurs en arrière-plan et attend que la BDD soit prête
start:
	docker compose up -d --build --wait

## Arrête et supprime les conteneurs (les volumes sont conservés)
stop:
	docker compose down -v

## Réinitialise le schéma et les données sans reconstruire les images
reset:
	cd $(API_DIR) && npx prisma db push --force-reset
	cd $(API_DIR) && npx prisma db seed

## Injecte uniquement les données (sans reset du schéma)
seed:
	cd $(API_DIR) && npx prisma db seed
