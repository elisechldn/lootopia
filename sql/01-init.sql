-- Script d'initialisation de la base de données Lootopia
-- Ce fichier est exécuté automatiquement lors de la première création du conteneur PostgreSQL

-- Création des extensions PostgreSQL si nécessaire
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Exemple de table (à adapter selon vos besoins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemple d'index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Exemple de données de test (optionnel)
INSERT INTO users (username, email, password_hash) VALUES
    ('admin', 'admin@lootopia.com', '$2b$10$example'),
    ('user1', 'user1@lootopia.com', '$2b$10$example')
ON CONFLICT (email) DO NOTHING;
