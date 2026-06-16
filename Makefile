API_DIR := apps/api

# Détection de l'IP LAN de l'hôte (macOS: ipconfig ; Linux: route puis hostname).
# Utilisée par les reverse proxies au runtime (LAN_IP, cert tls internal).
# Les images web/pwa sont IP-agnostiques : pas besoin de rebuild si l'IP change.
LAN_IP := $(shell ipconfig getifaddr en0 2>/dev/null || ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I 2>/dev/null | awk '{print $$1}')
# Exporté aux invocations docker compose (priorité sur le .env).
COMPOSE_ENV := LAN_IP=$(LAN_IP)

# Variables pour MinIO (évite la répétition et facilite la maintenance)
MINIO_CONTAINER := lootopia_minio
MINIO_BUCKET := lootopia-public
MINIO_URL := http://localhost:9000
MINIO_USER := minioadmin
MINIO_PASS := minioadmin
MAILPIT_URL := http://localhost:8025

# Reset de l'environnement Azure déployé (secrets sourcés depuis un fichier non commité)
AZURE_ENV := $(API_DIR)/.env.azure
AZURE_RG := rg-lootopia
AZURE_MINIO_APP := lootopia-minio

.PHONY: setup build start stop reset reset-db reset-bucket reset-mailpit seed help check-ip reset-azure reset-azure-db reset-azure-bucket check-azure-env

## Échoue tôt si l'IP LAN n'a pas pu être détectée (VPN, interface non en0, etc.)
check-ip:
	@test -n "$(LAN_IP)" || { echo "❌ IP LAN introuvable. Renseigne-la : make start LAN_IP=192.168.x.x"; exit 1; }

## Initialise l'environnement complet
setup: build start reset

## Construit les images Docker
build: check-ip
	@echo "🌐 IP LAN détectée : $(LAN_IP)"
	$(COMPOSE_ENV) docker compose build

## Lance les conteneurs
start: check-ip
	@echo "🌐 IP LAN détectée : $(LAN_IP)"
	$(COMPOSE_ENV) docker compose --profile init up -d --build minio-init
	$(COMPOSE_ENV) docker compose up -d --build --wait
	@echo ""
	@echo "✅ Lootopia prêt — accès HTTPS (accepter l'avertissement cert au 1er accès) :"
	@echo "   web → https://$(LAN_IP):3000  (ou https://localhost:3000)"
	@echo "   pwa → https://$(LAN_IP):3001  (ou https://localhost:3001)"

## Arrête et nettoie tout
stop:
	docker compose --profile init down -v
	docker compose down -v

## --- COMMANDES DE RESET ---

## Réinitialise TOUT (DB + Bucket + Mailpit)
reset: reset-db reset-bucket reset-mailpit

## Réinitialise uniquement la base de données Prisma
reset-db:
	@echo "🔄 Reset de la base de données..."
	cd $(API_DIR) && npx prisma db push --force-reset
	cd $(API_DIR) && npx prisma generate
	npm run build --workspace=packages/types
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

## Vide tous les emails de Mailpit
reset-mailpit:
	@echo "📬 Reset de Mailpit..."
	-curl -s -X DELETE $(MAILPIT_URL)/api/v1/messages

## --- RESET ENVIRONNEMENT AZURE DÉPLOYÉ (DESTRUCTIF, prod) ---

## Échoue tôt si le fichier de secrets Azure est absent
check-azure-env:
	@test -f $(AZURE_ENV) || { echo "❌ $(AZURE_ENV) manquant — copier $(API_DIR)/.env.azure.example et le remplir"; exit 1; }

## Réinitialise l'environnement Azure déployé (DB + storage)
reset-azure: reset-azure-db reset-azure-bucket

## Réinitialise la base de données Azure (force-reset + seed)
reset-azure-db: check-azure-env
	@echo "🔄 Reset DB Azure (force-reset + seed)..."
	@set -a; . ./$(AZURE_ENV); set +a; \
	cd $(API_DIR) && \
	DATABASE_URL="$$AZURE_DATABASE_URL" npx prisma db push --force-reset && \
	npx prisma generate && \
	cd .. && npm run build --workspace=packages/types && \
	cd $(API_DIR) && DATABASE_URL="$$AZURE_DATABASE_URL" npx prisma db seed

## Vide le bucket MinIO Azure (exposition externe temporaire + revert interne)
reset-azure-bucket: check-azure-env
	@echo "🪣 Reset bucket MinIO Azure (exposition temporaire)..."
	@set -a; . ./$(AZURE_ENV); set +a; \
	trap 'echo "↩️  re-bascule MinIO en interne"; az containerapp ingress update -g $(AZURE_RG) -n $(AZURE_MINIO_APP) --type internal >/dev/null' EXIT; \
	az containerapp ingress update -g $(AZURE_RG) -n $(AZURE_MINIO_APP) --type external >/dev/null; \
	FQDN=$$(az containerapp show -g $(AZURE_RG) -n $(AZURE_MINIO_APP) --query properties.configuration.ingress.fqdn -o tsv); \
	echo "MinIO exposé sur https://$$FQDN"; \
	docker run --rm minio/mc sh -c "\
	  mc alias set azure https://$$FQDN $$AZURE_MINIO_USER $$AZURE_MINIO_PASS && \
	  mc rm --recursive --force azure/$$AZURE_MINIO_BUCKET/ || true; \
	  mc anonymous set download azure/$$AZURE_MINIO_BUCKET"

## --- ------------------- ---

## Injecte uniquement les données
seed:
	cd $(API_DIR) && npx prisma db seed

help:
	@echo ""
	@echo "  make setup        — build + démarrage + reset complet"
	@echo "  make reset        — reset-db + reset-bucket + reset-mailpit"
	@echo "  make reset-db     — réinitialise Prisma et relance le seed"
	@echo "  make reset-bucket  — réinitialise les droits publics sur MinIO"
	@echo "  make reset-mailpit — vide tous les emails de Mailpit"
	@echo "  make seed         — injecte uniquement les données de seed"
	@echo ""
	@echo "  --- Azure (prod déployé, DESTRUCTIF) ---"
	@echo "  make reset-azure        — reset-azure-db + reset-azure-bucket"
	@echo "  make reset-azure-db     — force-reset + seed de la DB Azure"
	@echo "  make reset-azure-bucket — vide le bucket MinIO Azure (expose puis re-interne)"
	@echo ""