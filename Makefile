API_DIR := apps/api
# Variables pour MinIO (évite la répétition et facilite la maintenance)
MINIO_CONTAINER := lootopia_minio
MINIO_BUCKET := lootopia-public
MINIO_URL := http://localhost:9000
MINIO_USER := minioadmin
MINIO_PASS := minioadmin

.PHONY: setup build start stop reset reset-db reset-bucket seed help

## Initialise l'environnement complet
setup: build start reset

## Construit les images Docker
build:
	docker compose build

## Lance les conteneurs
start:
	docker compose --profile init up -d --build minio-init
	docker compose up -d --build --wait

## Arrête et nettoie tout
stop:
	docker compose --profile init down -v
	docker compose down -v

## --- COMMANDES DE RESET ---

## Réinitialise TOUT (DB + Bucket)
reset: reset-db reset-bucket

## Réinitialise uniquement la base de données Prisma
reset-db:
	@echo "🔄 Reset de la base de données..."
	cd $(API_DIR) && npx prisma db push --force-reset
	cd $(API_DIR) && npx prisma db seed

## Réinitialise uniquement les accès du bucket MinIO
reset-bucket:
	@echo "🪣 Reset complet du bucket MinIO (vidage + permissions)..."
	# 1. On définit l'alias pour que mc sache à qui parler
	-docker exec $(MINIO_CONTAINER) mc alias set self $(MINIO_URL) $(MINIO_USER) $(MINIO_PASS)
	# 2. On vide récursivement tout le contenu du bucket
	-docker exec $(MINIO_CONTAINER) mc rm --recursive --force self/$(MINIO_BUCKET)/
	# 3. On s'assure que le bucket est bien accessible en lecture seule pour le Web/PWA
	-docker exec $(MINIO_CONTAINER) mc anonymous set download self/$(MINIO_BUCKET)

## --- ------------------- ---

## Injecte uniquement les données
seed:
	cd $(API_DIR) && npx prisma db seed

help:
	@echo ""
	@echo "  make setup        — build + démarrage + reset complet"
	@echo "  make reset        — reset-db + reset-bucket"
	@echo "  make reset-db     — réinitialise Prisma et relance le seed"
	@echo "  make reset-bucket — réinitialise les droits publics sur MinIO"
	@echo "  make seed         — injecte uniquement les données de seed"
	@echo ""