-- =============================================
-- FIXTURES - Données de test
-- =============================================
-- Mots de passe en clair (dev uniquement, ne jamais committer en prod) :
-- admin_john     : Admin1234!
-- partner_alice  : Alice1234!
-- partner_bob    : Bob1234!
-- player_charlie : Charlie1234!
-- player_diana   : Diana1234!
-- player_eve     : Eve1234!
-- Hash bcrypt généré avec saltRounds=10
-- =============================================

-- Users
INSERT INTO users (username, email, password_hash, role, profile_picture) VALUES
('admin_john',     'john@admin.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN',   'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
('partner_alice',  'alice@partner.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARTNER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
('partner_bob',    'bob@partner.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARTNER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
('player_charlie', 'charlie@player.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER',  'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'),
('player_diana',   'diana@player.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER',  'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'),
('player_eve',     'eve@player.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER',  NULL);

-- Hunts
-- location_center : ST_MakePoint(longitude, latitude)
INSERT INTO hunts (title, description, start_date, end_date, location_center, radius, status, ref_user) VALUES
(
    'Chasse au trésor de Paris',
    'Explorez les monuments emblématiques de Paris à travers cette chasse palpitante.',
    '2025-03-01 09:00:00',
    '2025-03-31 18:00:00',
    ST_MakePoint(2.3522, 48.8566)::geography,
    5000,
    'ACTIVE',
    2
),
(
    'Mystères de Lyon',
    'Partez à la découverte des traboules et secrets de la ville de Lyon.',
    '2025-04-01 09:00:00',
    '2025-04-30 18:00:00',
    ST_MakePoint(4.8357, 45.7640)::geography,
    3500,
    'DRAFT',
    3
),
(
    'Aventure à Marseille',
    'Une chasse au trésor le long du Vieux-Port et de la cité phocéenne.',
    '2025-01-01 09:00:00',
    '2025-01-31 18:00:00',
    ST_MakePoint(5.3698, 43.2965)::geography,
    4000,
    'FINISHED',
    2
);

-- Steps pour Hunt 1 (Paris)
INSERT INTO steps (order_number, title, clue, location, action_type, ar_marker_url, ar_content, points_reward, ref_hunt) VALUES
(1, 'La Tour Eiffel',  'Trouvez le symbole de fer de la capitale.',          ST_MakePoint(2.2945, 48.8584)::geography, 'GPS',    NULL, NULL, 100, 1),
(2, 'Le Louvre',       'Scannez la pyramide pour révéler le prochain indice.',ST_MakePoint(2.3376, 48.8606)::geography, 'QR_CODE',NULL, NULL, 150, 1),
(3, 'Notre-Dame',      'Un marqueur AR vous attend près de la cathédrale.',   ST_MakePoint(2.3499, 48.8530)::geography, 'AR',     'https://assets.example.com/markers/notre-dame.png', 'Félicitations, vous avez trouvé le trésor !', 200, 1),
(4, 'Sacré-Cœur',      'Résolvez l''énigme pour gravir la butte.',            ST_MakePoint(2.3431, 48.8867)::geography, 'RIDDLE', NULL, NULL, 175, 1);

-- Steps pour Hunt 2 (Lyon)
INSERT INTO steps (order_number, title, clue, location, action_type, ar_marker_url, ar_content, points_reward, ref_hunt) VALUES
(1, 'Place Bellecour', 'Le cheval de bronze cache votre premier indice.',              ST_MakePoint(4.8320, 45.7579)::geography, 'QR_CODE', NULL, NULL, 100, 2),
(2, 'Vieux Lyon',      'Trouvez la traboule secrète du quartier Saint-Jean.',          ST_MakePoint(4.8270, 45.7620)::geography, 'GPS',     NULL, NULL, 150, 2),
(3, 'Fourvière',       'Un marqueur AR illumine la basilique.',                        ST_MakePoint(4.8220, 45.7622)::geography, 'AR',      'https://assets.example.com/markers/fourviere.png', 'Le trésor de Lyon est à vous !', 250, 2);

-- Steps pour Hunt 3 (Marseille)
INSERT INTO steps (order_number, title, clue, location, action_type, ar_marker_url, ar_content, points_reward, ref_hunt) VALUES
(1, 'Vieux-Port',              'Scannez le QR code sur le quai des Belges.',          ST_MakePoint(5.3746, 43.2951)::geography, 'QR_CODE', NULL, NULL, 100, 3),
(2, 'Fort Saint-Jean',         'Résolvez l''énigme du fort pour continuer.',           ST_MakePoint(5.3621, 43.2963)::geography, 'RIDDLE',  NULL, NULL, 150, 3),
(3, 'Notre-Dame de la Garde',  'La Bonne Mère veille sur le dernier indice.',          ST_MakePoint(5.3714, 43.2840)::geography, 'GPS',     NULL, NULL, 200, 3);

-- Participations
INSERT INTO participations (start_time, end_time, current_step, total_point, status, ref_user, ref_hunt) VALUES
('2025-03-05 10:00:00', NULL,                    2,    100, 'IN_PROGRESS', 4, 1), -- Charlie en cours sur Paris
('2025-03-03 09:30:00', '2025-03-03 12:45:00',   NULL, 625, 'COMPLETED',   5, 1), -- Diana a terminé Paris
('2025-03-04 14:00:00', '2025-03-04 15:00:00',   1,    0,   'ABANDONED',   6, 1), -- Eve a abandonné Paris
('2025-01-10 10:00:00', '2025-01-10 14:30:00',   NULL, 450, 'COMPLETED',   4, 3), -- Charlie a terminé Marseille
('2025-04-02 09:00:00', NULL,                    1,    0,   'IN_PROGRESS', 5, 2); -- Diana en cours sur Lyon