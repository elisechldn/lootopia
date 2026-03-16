import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from './generated/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // ── Users ──────────────────────────────────────────────────────────────────
    const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const admin = await prisma.user.upsert({
        where: { email: 'john@admin.com' },
        update: {},
        create: {
            username: 'admin_john', firstname: 'John', lastname: 'Admin',
            email: 'john@admin.com', password: hash, role: 'ADMIN',
            country: 'FR', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        },
    });

    const alice = await prisma.user.upsert({
        where: { email: 'alice@partner.com' },
        update: {},
        create: {
            username: 'partner_alice', firstname: 'Alice', lastname: 'Partner',
            email: 'alice@partner.com', password: hash, role: 'PARTNER',
            country: 'FR', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        },
    });

    const bob = await prisma.user.upsert({
        where: { email: 'bob@partner.com' },
        update: {},
        create: {
            username: 'partner_bob', firstname: 'Bob', lastname: 'Partner',
            email: 'bob@partner.com', password: hash, role: 'PARTNER',
            country: 'FR', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        },
    });

    const charlie = await prisma.user.upsert({
        where: { email: 'charlie@player.com' },
        update: {},
        create: {
            username: 'player_charlie', firstname: 'Charlie', lastname: 'Player',
            email: 'charlie@player.com', password: hash, role: 'PLAYER',
            country: 'FR', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        },
    });

    const diana = await prisma.user.upsert({
        where: { email: 'diana@player.com' },
        update: {},
        create: {
            username: 'player_diana', firstname: 'Diana', lastname: 'Player',
            email: 'diana@player.com', password: hash, role: 'PLAYER',
            country: 'FR', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
        },
    });

    // ── Hunts ──────────────────────────────────────────────────────────────────

    // 1 — Paris (Alice, ACTIVE)
    const huntParis = await prisma.hunt.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Chasse au trésor de Paris',
            shortDescription: 'Explorez les monuments emblématiques de la capitale.',
            description: 'Partez à la découverte des lieux les plus iconiques de Paris, de la Tour Eiffel au Sacré-Cœur en passant par le Louvre.',
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-31'),
            location: 'Paris, France',
            radius: 5000,
            difficulty: 'Intermédiaire',
            status: 'ACTIVE',
            rewardType: 'DISCOUNT_CODE',
            rewardValue: 'PARIS2025-PROMO10',
            refUser: alice.id,
        },
    });

    // 2 — Lyon (Bob, DRAFT)
    const huntLyon = await prisma.hunt.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Mystères de Lyon',
            shortDescription: 'Partez à la découverte des traboules lyonnaises.',
            description: 'Explorez les passages secrets de la vieille ville de Lyon et résolvez des énigmes historiques.',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-30'),
            location: 'Lyon, France',
            radius: 3500,
            difficulty: 'Difficile',
            status: 'DRAFT',
            rewardType: 'DISCOUNT_CODE',
            rewardValue: 'LYON2025-PROMO15',
            refUser: bob.id,
        },
    });

    // 3 — Bordeaux (Alice, ACTIVE)
    const huntBordeaux = await prisma.hunt.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Vignes et Châteaux de Bordeaux',
            shortDescription: 'Une aventure entre vignobles et architecture bordelaise.',
            description: 'Découvrez le patrimoine viticole et architectural de Bordeaux à travers une chasse alliant histoire et dégustation.',
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-05-31'),
            location: 'Bordeaux, France',
            radius: 4000,
            difficulty: 'Facile',
            status: 'ACTIVE',
            rewardType: 'FREE_ITEM',
            rewardValue: 'Dégustation offerte au Château Margaux',
            refUser: alice.id,
        },
    });

    // 4 — Strasbourg (Bob, ACTIVE)
    const huntStrasbourg = await prisma.hunt.upsert({
        where: { id: 4 },
        update: {},
        create: {
            title: 'Noël en Alsace',
            shortDescription: 'Plongez dans la magie du marché de Noël strasbourgeois.',
            description: 'Une chasse festive au cœur de Strasbourg, entre la cathédrale gothique et les marchés de Noël enchanteurs.',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-24'),
            location: 'Strasbourg, France',
            radius: 2500,
            difficulty: 'Facile',
            status: 'ACTIVE',
            rewardType: 'BADGE',
            rewardValue: 'Badge Explorateur Alsacien',
            refUser: bob.id,
        },
    });

    // 5 — Marseille (Alice, FINISHED)
    const huntMarseille = await prisma.hunt.upsert({
        where: { id: 5 },
        update: {},
        create: {
            title: 'Les Calanques de Marseille',
            shortDescription: 'Une aventure nature sur les côtes méditerranéennes.',
            description: 'Explorez les calanques sauvages de Marseille et résolvez des énigmes liées à la géologie et à la faune méditerranéenne.',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-06-30'),
            location: 'Marseille, France',
            radius: 8000,
            difficulty: 'Difficile',
            status: 'FINISHED',
            rewardType: 'DISCOUNT_CODE',
            rewardValue: 'MER2025-PROMO20',
            refUser: alice.id,
        },
    });

    // 6 — Mont-Saint-Michel (Bob, ACTIVE)
    const huntMSM = await prisma.hunt.upsert({
        where: { id: 6 },
        update: {},
        create: {
            title: 'L\'Île Mystérieuse du Mont-Saint-Michel',
            shortDescription: 'Percez les secrets du rocher normand.',
            description: 'Entre les marées et les ruelles médiévales du Mont-Saint-Michel, une chasse au trésor unique vous attend.',
            startDate: new Date('2025-07-15'),
            endDate: new Date('2025-08-15'),
            location: 'Mont-Saint-Michel, France',
            radius: 1500,
            difficulty: 'Expert',
            status: 'ACTIVE',
            rewardType: 'FREE_ITEM',
            rewardValue: 'Visite guidée nocturne exclusive',
            refUser: bob.id,
        },
    });

    // 7 — Toulouse (Alice, DRAFT)
    const huntToulouse = await prisma.hunt.upsert({
        where: { id: 7 },
        update: {},
        create: {
            title: 'La Ville Rose',
            shortDescription: 'Découvrez Toulouse entre art et sciences.',
            description: 'Une chasse mêlant l\'histoire de la ville rose, ses capitouls et ses grandes institutions scientifiques comme la Cité de l\'Espace.',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-30'),
            location: 'Toulouse, France',
            radius: 3000,
            difficulty: 'Intermédiaire',
            status: 'DRAFT',
            rewardType: 'BADGE',
            rewardValue: 'Badge Astronaute Toulousain',
            refUser: alice.id,
        },
    });

    // 8 — Nice (Bob, ACTIVE)
    const huntNice = await prisma.hunt.upsert({
        where: { id: 8 },
        update: {},
        create: {
            title: 'Azur & Couleurs — Nice',
            shortDescription: 'Une chasse ensoleillée sur la Côte d\'Azur.',
            description: 'Promenez-vous sur la Promenade des Anglais et dans le Vieux-Nice à la recherche d\'indices colorés cachés dans les ruelles baroques.',
            startDate: new Date('2025-08-01'),
            endDate: new Date('2025-08-31'),
            location: 'Nice, France',
            radius: 3500,
            difficulty: 'Facile',
            status: 'ACTIVE',
            rewardType: 'DISCOUNT_CODE',
            rewardValue: 'COTE2025-PROMO10',
            refUser: bob.id,
        },
    });

    // 9 — Versailles (Alice, FINISHED)
    const huntVersailles = await prisma.hunt.upsert({
        where: { id: 9 },
        update: {},
        create: {
            title: 'Secrets du Château de Versailles',
            shortDescription: 'Explorez les jardins et galeries royales.',
            description: 'Une chasse au cœur du domaine royal de Versailles, entre la Galerie des Glaces et les bosquets secrets des jardins à la française.',
            startDate: new Date('2025-04-15'),
            endDate: new Date('2025-05-15'),
            location: 'Versailles, France',
            radius: 6000,
            difficulty: 'Expert',
            status: 'FINISHED',
            rewardType: 'FREE_ITEM',
            rewardValue: 'Accès privatif aux appartements du roi',
            refUser: alice.id,
        },
    });

    // 10 — Nantes (Bob, DRAFT)
    const huntNantes = await prisma.hunt.upsert({
        where: { id: 10 },
        update: {},
        create: {
            title: 'L\'Éléphant de Nantes',
            shortDescription: 'Suivez les machines de l\'île dans Nantes.',
            description: 'Une aventure steampunk à travers l\'île de Nantes, guidée par les créatures mécaniques des Machines de l\'île.',
            startDate: new Date('2025-10-01'),
            endDate: new Date('2025-10-31'),
            location: 'Nantes, France',
            radius: 4000,
            difficulty: 'Intermédiaire',
            status: 'DRAFT',
            rewardType: 'BADGE',
            rewardValue: 'Badge Mécanicien des Machines',
            refUser: bob.id,
        },
    });

    // ── Steps ──────────────────────────────────────────────────────────────────

    await prisma.step.createMany({
        skipDuplicates: true,
        data: [
            // Paris
            { orderNumber: 1, title: 'La Tour Eiffel',   clue: 'Trouvez le symbole de fer forgé.',          latitude: 48.8584, longitude: 2.2945, radius: 200, actionType: 'GPS',     points: 100, refHunt: huntParis.id },
            { orderNumber: 2, title: 'Le Louvre',        clue: 'Scannez la pyramide de verre.',              latitude: 48.8606, longitude: 2.3376, radius: 100, actionType: 'QR_CODE', points: 150, refHunt: huntParis.id },
            { orderNumber: 3, title: 'Notre-Dame',       clue: 'Un marqueur AR vous attend sur le parvis.',  latitude: 48.8530, longitude: 2.3499, radius: 50,  actionType: 'AR',      points: 200, refHunt: huntParis.id, arMarker: 'https://assets.example.com/markers/notre-dame.png' },
            { orderNumber: 4, title: 'Sacré-Cœur',      clue: 'Résolvez l\'énigme des 99 marches.',         latitude: 48.8867, longitude: 2.3431, radius: 30,  actionType: 'RIDDLE',  points: 175, refHunt: huntParis.id },

            // Lyon
            { orderNumber: 1, title: 'Vieux-Lyon',      clue: 'Entrez dans la première traboule.',           latitude: 45.7600, longitude: 4.8270, radius: 30,  actionType: 'QR_CODE', points: 120, refHunt: huntLyon.id },
            { orderNumber: 2, title: 'Basilique de Fourvière', clue: 'Trouvez la mosaïque dorée.',           latitude: 45.7623, longitude: 4.8220, radius: 50,  actionType: 'AR',      points: 180, refHunt: huntLyon.id, arMarker: 'https://assets.example.com/markers/fourviere.png' },
            { orderNumber: 3, title: 'Place Bellecour', clue: 'Scannez la statue équestre.',                 latitude: 45.7578, longitude: 4.8320, radius: 80,  actionType: 'QR_CODE', points: 140, refHunt: huntLyon.id },

            // Bordeaux
            { orderNumber: 1, title: 'Place de la Bourse', clue: 'Photographiez votre reflet dans le miroir d\'eau.', latitude: 44.8412, longitude: -0.5697, radius: 100, actionType: 'GPS', points: 80, refHunt: huntBordeaux.id },
            { orderNumber: 2, title: 'Cathédrale Saint-André', clue: 'Scannez le portail nord.',             latitude: 44.8378, longitude: -0.5780, radius: 50,  actionType: 'QR_CODE', points: 120, refHunt: huntBordeaux.id },

            // Strasbourg
            { orderNumber: 1, title: 'Cathédrale de Strasbourg', clue: 'Trouvez l\'horloge astronomique.',  latitude: 48.5818, longitude: 7.7507, radius: 60,  actionType: 'AR',      points: 150, refHunt: huntStrasbourg.id, arMarker: 'https://assets.example.com/markers/strasbourg.png' },
            { orderNumber: 2, title: 'Petite France',    clue: 'Scannez le pont couvert.',                   latitude: 48.5790, longitude: 7.7385, radius: 40,  actionType: 'QR_CODE', points: 100, refHunt: huntStrasbourg.id },

            // Marseille
            { orderNumber: 1, title: 'Vieux-Port',       clue: 'Repérez le bateau à fond bleu.',             latitude: 43.2951, longitude: 5.3745, radius: 150, actionType: 'GPS',     points: 90,  refHunt: huntMarseille.id },
            { orderNumber: 2, title: 'Calanque de Morgiou', clue: 'Résolvez l\'énigme géologique.',          latitude: 43.2141, longitude: 5.4264, radius: 80,  actionType: 'RIDDLE',  points: 200, refHunt: huntMarseille.id },
            { orderNumber: 3, title: 'Notre-Dame de la Garde', clue: 'Trouvez la Bonne Mère en AR.',         latitude: 43.2845, longitude: 5.3708, radius: 60,  actionType: 'AR',      points: 180, refHunt: huntMarseille.id, arMarker: 'https://assets.example.com/markers/bonne-mere.png' },

            // Mont-Saint-Michel
            { orderNumber: 1, title: 'Entrée du Mont',   clue: 'Scannez la porte du roi.',                   latitude: 48.6360, longitude: -1.5115, radius: 30, actionType: 'QR_CODE', points: 120, refHunt: huntMSM.id },
            { orderNumber: 2, title: 'Abbaye',           clue: 'Trouvez la salle des chevaliers en AR.',      latitude: 48.6361, longitude: -1.5107, radius: 25, actionType: 'AR',      points: 250, refHunt: huntMSM.id, arMarker: 'https://assets.example.com/markers/abbaye.png' },
            { orderNumber: 3, title: 'Remparts',         clue: 'Résolvez l\'énigme des marées.',              latitude: 48.6359, longitude: -1.5120, radius: 40, actionType: 'RIDDLE',  points: 300, refHunt: huntMSM.id },

            // Toulouse
            { orderNumber: 1, title: 'Capitole',         clue: 'Trouvez la croix occitane cachée.',           latitude: 43.6047, longitude: 1.4442, radius: 60,  actionType: 'GPS',     points: 100, refHunt: huntToulouse.id },
            { orderNumber: 2, title: 'Cité de l\'Espace', clue: 'Scannez la fusée Ariane.',                   latitude: 43.5852, longitude: 1.4894, radius: 80,  actionType: 'QR_CODE', points: 150, refHunt: huntToulouse.id },

            // Nice
            { orderNumber: 1, title: 'Promenade des Anglais', clue: 'Trouvez la chaise bleue numéro 47.',    latitude: 43.6950, longitude: 7.2650, radius: 100, actionType: 'GPS',     points: 80,  refHunt: huntNice.id },
            { orderNumber: 2, title: 'Vieux-Nice',       clue: 'Scannez le trompe-l\'œil du cours Saleya.',   latitude: 43.6963, longitude: 7.2769, radius: 50,  actionType: 'QR_CODE', points: 110, refHunt: huntNice.id },
            { orderNumber: 3, title: 'Castle Hill',      clue: 'Résolvez l\'énigme de la cascade.',           latitude: 43.6969, longitude: 7.2821, radius: 70,  actionType: 'RIDDLE',  points: 160, refHunt: huntNice.id },

            // Versailles
            { orderNumber: 1, title: 'Galerie des Glaces', clue: 'Trouvez le reflet du roi en AR.',           latitude: 48.8048, longitude: 2.1203, radius: 30,  actionType: 'AR',      points: 200, refHunt: huntVersailles.id, arMarker: 'https://assets.example.com/markers/versailles.png' },
            { orderNumber: 2, title: 'Jardins de Versailles', clue: 'Scannez la fontaine de Latone.',         latitude: 48.8040, longitude: 2.1140, radius: 60,  actionType: 'QR_CODE', points: 150, refHunt: huntVersailles.id },
            { orderNumber: 3, title: 'Grand Trianon',    clue: 'Résolvez l\'énigme des appartements roses.',  latitude: 48.8090, longitude: 2.1040, radius: 50,  actionType: 'RIDDLE',  points: 250, refHunt: huntVersailles.id },

            // Nantes
            { orderNumber: 1, title: 'L\'Éléphant',      clue: 'Montez sur le grand éléphant mécanique.',    latitude: 47.2082, longitude: -1.5649, radius: 80, actionType: 'GPS',     points: 100, refHunt: huntNantes.id },
            { orderNumber: 2, title: 'Le Carrousel des Mondes Marins', clue: 'Scannez la méduse lumineuse.',  latitude: 47.2078, longitude: -1.5641, radius: 50, actionType: 'QR_CODE', points: 130, refHunt: huntNantes.id },
            { orderNumber: 3, title: 'Château des Ducs', clue: 'Résolvez l\'énigme du puits central.',        latitude: 47.2160, longitude: -1.5497, radius: 60, actionType: 'RIDDLE',  points: 175, refHunt: huntNantes.id },
        ],
    });

    // ── Participations ─────────────────────────────────────────────────────────
    await prisma.participation.upsert({
        where: { refUser_refHunt: { refUser: charlie.id, refHunt: huntParis.id } },
        update: {},
        create: {
            refUser: charlie.id, refHunt: huntParis.id,
            totalPoints: 100, status: 'IN_PROGRESS',
        },
    });

    await prisma.participation.upsert({
        where: { refUser_refHunt: { refUser: diana.id, refHunt: huntParis.id } },
        update: {},
        create: {
            refUser: diana.id, refHunt: huntParis.id,
            totalPoints: 625, status: 'COMPLETED',
            endTime: new Date('2025-03-03T12:45:00'),
        },
    });

    await prisma.participation.upsert({
        where: { refUser_refHunt: { refUser: charlie.id, refHunt: huntBordeaux.id } },
        update: {},
        create: {
            refUser: charlie.id, refHunt: huntBordeaux.id,
            totalPoints: 80, status: 'IN_PROGRESS',
        },
    });

    await prisma.participation.upsert({
        where: { refUser_refHunt: { refUser: diana.id, refHunt: huntNice.id } },
        update: {},
        create: {
            refUser: diana.id, refHunt: huntNice.id,
            totalPoints: 350, status: 'COMPLETED',
            endTime: new Date('2025-08-15T16:30:00'),
        },
    });

    await prisma.participation.upsert({
        where: { refUser_refHunt: { refUser: charlie.id, refHunt: huntMarseille.id } },
        update: {},
        create: {
            refUser: charlie.id, refHunt: huntMarseille.id,
            totalPoints: 470, status: 'COMPLETED',
            endTime: new Date('2025-06-20T11:00:00'),
        },
    });

    console.log('✅ Seed terminé — 10 chasses, 5 utilisateurs, participations créées');
}

main()
    .then(async () => { await prisma.$disconnect(); await pool.end(); })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); await pool.end(); process.exit(1); });