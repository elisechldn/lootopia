import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '@repo/types';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Coordonnées GPS (centre de la zone de départ) pour chaque chasse.
// Format : [longitude, latitude] — convention PostGIS ST_MakePoint(lon, lat).
const HUNT_COORDS: Record<number, [number, number]> = {
  1: [2.3522, 48.8566], // Paris
  2: [4.8357, 45.764], // Lyon
  3: [-0.5792, 44.8378], // Bordeaux
  4: [7.7521, 48.5734], // Strasbourg
  5: [5.3698, 43.2965], // Marseille
  6: [-1.5115, 48.636], // Mont-Saint-Michel
  7: [1.4442, 43.6047], // Toulouse
  8: [7.262, 43.7102], // Nice
  9: [2.1301, 48.8014], // Versailles
  10: [-1.5536, 47.2184], // Nantes
  11: [1.950804, 48.819725], // Valibout
  12: [2.238728, 48.893536], // Sup De Vinci — Paris
  13: [2.7022, 48.4042], // Fontainebleau
  14: [2.0944, 48.8993], // Saint-Germain-en-Laye
  15: [2.4347, 48.8434], // Vincennes
  16: [2.7808, 48.8722], // Disneyland Paris
  17: [1.5339, 49.0758], // Giverny
  18: [2.4869, 49.1936], // Chantilly
  19: [3.2998, 48.5598], // Provins
  20: [2.1717, 49.0728], // Auvers-sur-Oise
  21: [2.2347, 48.8133], // Meudon
  22: [2.3601, 48.9357], // Saint-Denis
  23: [1.8307, 48.6444], // Rambouillet
  24: [2.2913, 48.7784], // Sceaux
};

async function setHuntLocationCenter(huntId: number, lon: number, lat: number) {
  await prisma.$executeRaw`
    UPDATE "hunts"
    SET "location_center" = ST_MakePoint(${lon}, ${lat})::geography
    WHERE id = ${huntId}
  `;
}

async function setStepLocation(stepId: number, lon: number, lat: number) {
  await prisma.$executeRaw`
    UPDATE "steps"
    SET "location" = ST_MakePoint(${lon}, ${lat})::geography
    WHERE id = ${stepId}
  `;
}

async function main() {
  // Dates dynamiques pour hunts
  const startDateHunt = new Date();
  const endDateHunt = new Date(
    startDateHunt.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = '$2b$10$kfG7lYzqx1jFZpfnR4rBX.3bZDX10SsNoVRNFrkmJU3vDRx//me7i'; // mot de passe : lol

  const admin = await prisma.user.upsert({
    where: { email: 'john@admin.com' },
    update: { emailVerified: true },
    create: {
      username: 'admin_john',
      firstname: 'John',
      lastname: 'Admin',
      email: 'john@admin.com',
      passwordHash: hash,
      role: 'ADMIN',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@partner.com' },
    update: { emailVerified: true },
    create: {
      username: 'partner_alice',
      firstname: 'Alice',
      lastname: 'Partner',
      email: 'alice@partner.com',
      passwordHash: hash,
      role: 'PARTNER',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@partner.com' },
    update: { emailVerified: true },
    create: {
      username: 'partner_bob',
      firstname: 'Bob',
      lastname: 'Partner',
      email: 'bob@partner.com',
      passwordHash: hash,
      role: 'PARTNER',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@player.com' },
    update: { emailVerified: true },
    create: {
      username: 'player_charlie',
      firstname: 'Charlie',
      lastname: 'Player',
      email: 'charlie@player.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: 'diana@player.com' },
    update: { emailVerified: true },
    create: {
      username: 'player_diana',
      firstname: 'Diana',
      lastname: 'Player',
      email: 'diana@player.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john.doe@gmail.com' },
    update: { emailVerified: true },
    create: {
      username: 'Johnny',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@gmail.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
      emailVerified: true,
      profilePicture: 'https://thispersondoesnotexist.com/',
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
      description:
        'Partez à la découverte des lieux les plus iconiques de Paris, de la Tour Eiffel au Sacré-Cœur en passant par le Louvre.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 5000,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'PARIS2025-PROMO10',
      coverImage:
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntParis.id, ...HUNT_COORDS[1]!);

  // 2 — Lyon (Bob, ACTIVE)
  const huntLyon = await prisma.hunt.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Mystères de Lyon',
      shortDescription: 'Partez à la découverte des traboules lyonnaises.',
      description:
        'Explorez les passages secrets de la vieille ville de Lyon et résolvez des énigmes historiques.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3500,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'LYON2025-PROMO15',
      coverImage:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntLyon.id, ...HUNT_COORDS[2]!);

  // 3 — Bordeaux (Alice, ACTIVE)
  const huntBordeaux = await prisma.hunt.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Vignes et Châteaux de Bordeaux',
      shortDescription:
        'Une aventure entre vignobles et architecture bordelaise.',
      description:
        'Découvrez le patrimoine viticole et architectural de Bordeaux à travers une chasse alliant histoire et dégustation.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 4000,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Dégustation offerte au Château Margaux',
      coverImage:
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntBordeaux.id, ...HUNT_COORDS[3]!);

  // 4 — Strasbourg (Bob, ACTIVE)
  const huntStrasbourg = await prisma.hunt.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Noël en Alsace',
      shortDescription:
        'Plongez dans la magie du marché de Noël strasbourgeois.',
      description:
        'Une chasse festive au cœur de Strasbourg, entre la cathédrale gothique et les marchés de Noël enchanteurs.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 2500,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Explorateur Alsacien',
      coverImage:
        'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntStrasbourg.id, ...HUNT_COORDS[4]!);

  // 5 — Marseille (Alice, ACTIVE)
  const huntMarseille = await prisma.hunt.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Les Calanques de Marseille',
      shortDescription: 'Une aventure nature sur les côtes méditerranéennes.',
      description:
        'Explorez les calanques sauvages de Marseille et résolvez des énigmes liées à la géologie et à la faune méditerranéenne.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 8000,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'MER2025-PROMO20',
      coverImage:
        'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntMarseille.id, ...HUNT_COORDS[5]!);

  // 6 — Mont-Saint-Michel (Bob, ACTIVE)
  const huntMSM = await prisma.hunt.upsert({
    where: { id: 6 },
    update: {},
    create: {
      title: "L'Île Mystérieuse du Mont-Saint-Michel",
      shortDescription: 'Percez les secrets du rocher normand.',
      description:
        'Entre les marées et les ruelles médiévales du Mont-Saint-Michel, une chasse au trésor unique vous attend.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Visite guidée nocturne exclusive',
      coverImage:
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntMSM.id, ...HUNT_COORDS[6]!);

  // 7 — Toulouse (Alice, ACTIVE)
  const huntToulouse = await prisma.hunt.upsert({
    where: { id: 7 },
    update: {},
    create: {
      title: 'La Ville Rose',
      shortDescription: 'Découvrez Toulouse entre art et sciences.',
      description:
        "Une chasse mêlant l'histoire de la ville rose, ses capitouls et ses grandes institutions scientifiques comme la Cité de l'Espace.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Astronaute Toulousain',
      coverImage:
        'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntToulouse.id, ...HUNT_COORDS[7]!);

  // 8 — Nice (Bob, ACTIVE)
  const huntNice = await prisma.hunt.upsert({
    where: { id: 8 },
    update: {},
    create: {
      title: 'Azur & Couleurs — Nice',
      shortDescription: "Une chasse ensoleillée sur la Côte d'Azur.",
      description:
        "Promenez-vous sur la Promenade des Anglais et dans le Vieux-Nice à la recherche d'indices colorés cachés dans les ruelles baroques.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3500,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'COTE2025-PROMO10',
      coverImage:
        'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntNice.id, ...HUNT_COORDS[8]!);

  // 9 — Versailles (Alice, ACTIVE)
  const huntVersailles = await prisma.hunt.upsert({
    where: { id: 9 },
    update: {},
    create: {
      title: 'Secrets du Château de Versailles',
      shortDescription: 'Explorez les jardins et galeries royales.',
      description:
        'Une chasse au cœur du domaine royal de Versailles, entre la Galerie des Glaces et les bosquets secrets des jardins à la française.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 6000,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Accès privatif aux appartements du roi',
      coverImage:
        'https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntVersailles.id, ...HUNT_COORDS[9]!);

  // 10 — Nantes (Bob, ACTIVE)
  const huntNantes = await prisma.hunt.upsert({
    where: { id: 10 },
    update: {},
    create: {
      title: "L'Éléphant de Nantes",
      shortDescription: "Suivez les machines de l'île dans Nantes.",
      description:
        "Une aventure steampunk à travers l'île de Nantes, guidée par les créatures mécaniques des Machines de l'île.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 4000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Mécanicien des Machines',
      coverImage:
        'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntNantes.id, ...HUNT_COORDS[10]!);

  // 11 — Valibout (Alice, ACTIVE)
  const huntValibout = await prisma.hunt.upsert({
    where: { id: 11 },
    update: {},
    create: {
      title: 'Le Plaisir du Valibout',
      shortDescription: 'Une expérience AR en trois actes gastronomiques.',
      description:
        "Partez à la découverte du Valibout en trois étapes : l'entrée, le plat et le dessert. Une chasse en réalité augmentée pour les fins gourmets explorateurs.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 500,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Gourmet du Valibout',
      coverImage:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntValibout.id, ...HUNT_COORDS[11]!);

  // 12 — Sup De Vinci (Alice, ACTIVE)
  const huntSupDeVinci = await prisma.hunt.upsert({
    where: { id: 12 },
    update: {},
    create: {
      title: 'Portes ouvertes de Sup De Vinci',
      shortDescription:
        "Découvrez les formations et labs de l'école en explorant le campus.",
      description:
        "Partez à la découverte du campus parisien de Sup De Vinci, école d'informatique et du numérique. Résolvez des énigmes liées au développement, à l'IA et au cybersécurité pour décrocher votre badge Futur Étudiant.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 300,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Futur Étudiant Sup De Vinci',
      coverImage:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntSupDeVinci.id, ...HUNT_COORDS[12]!);

  // 13 — Fontainebleau (Alice, ACTIVE)
  const huntFontainebleau = await prisma.hunt.upsert({
    where: { id: 13 },
    update: {},
    create: {
      title: 'Le Trésor de Fontainebleau',
      shortDescription: 'Une chasse royale au cœur de la forêt et du château.',
      description:
        'Explorez le château de Fontainebleau et sa forêt mythique, repaire des rois de France et terrain de jeu des grimpeurs.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 4000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Courtisan de Fontainebleau',
      coverImage:
        'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntFontainebleau.id, ...HUNT_COORDS[13]!);

  // 14 — Saint-Germain-en-Laye (Alice, ACTIVE)
  const huntSaintGermain = await prisma.hunt.upsert({
    where: { id: 14 },
    update: {},
    create: {
      title: 'Énigmes de Saint-Germain-en-Laye',
      shortDescription: 'Sur les pas de Louis XIV, entre château et forêt.',
      description:
        'Une chasse au trésor dans la ville natale du Roi-Soleil, entre la grande terrasse et le château royal.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 2500,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'GERMAIN2026-PROMO10',
      coverImage:
        'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntSaintGermain.id, ...HUNT_COORDS[14]!);

  // 15 — Vincennes (Alice, ACTIVE)
  const huntVincennes = await prisma.hunt.upsert({
    where: { id: 15 },
    update: {},
    create: {
      title: 'Le Donjon de Vincennes',
      shortDescription:
        "Percez les secrets de la plus haute forteresse médiévale d'Europe.",
      description:
        'Explorez le château de Vincennes et son bois, aux portes de Paris, à la recherche de trésors médiévaux.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 2000,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Visite guidée du donjon offerte',
      coverImage:
        'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntVincennes.id, ...HUNT_COORDS[15]!);

  // 16 — Disneyland Paris (Alice, ACTIVE)
  const huntDisneyland = await prisma.hunt.upsert({
    where: { id: 16 },
    update: {},
    create: {
      title: 'La Quête Magique de Marne-la-Vallée',
      shortDescription: 'Une aventure féerique aux portes du parc enchanté.',
      description:
        "Pars à la recherche d'objets magiques disséminés autour du parc le plus visité d'Europe.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Explorateur Enchanté',
      coverImage:
        'https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntDisneyland.id, ...HUNT_COORDS[16]!);

  // 17 — Giverny (Alice, ACTIVE)
  const huntGiverny = await prisma.hunt.upsert({
    where: { id: 17 },
    update: {},
    create: {
      title: 'Les Couleurs de Giverny',
      shortDescription:
        'Sur les traces de Monet, dans ses jardins impressionnistes.',
      description:
        'Une chasse artistique dans le village de Giverny, entre les nymphéas et le pont japonais de Claude Monet.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Carte postale signée — édition limitée',
      coverImage:
        'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntGiverny.id, ...HUNT_COORDS[17]!);

  // 18 — Chantilly (Alice, ACTIVE)
  const huntChantilly = await prisma.hunt.upsert({
    where: { id: 18 },
    update: {},
    create: {
      title: 'Le Mystère du Château de Chantilly',
      shortDescription: 'Entre chevaux, dentelle et crème fouettée.',
      description:
        'Découvre le domaine de Chantilly, son château, ses grandes écuries et son célèbre potager-jardin.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Gourmet de Chantilly',
      coverImage:
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntChantilly.id, ...HUNT_COORDS[18]!);

  // 19 — Provins (Alice, ACTIVE)
  const huntProvins = await prisma.hunt.upsert({
    where: { id: 19 },
    update: {},
    create: {
      title: 'Les Remparts de Provins',
      shortDescription: 'Voyage au temps des foires de Champagne.',
      description:
        "Une chasse médiévale dans la cité fortifiée de Provins, classée au patrimoine mondial de l'UNESCO.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 2000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Chevalier de Provins',
      coverImage:
        'https://images.unsplash.com/photo-1520637736862-4d197d17c93a?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntProvins.id, ...HUNT_COORDS[19]!);

  // 20 — Auvers-sur-Oise (Alice, ACTIVE)
  const huntAuvers = await prisma.hunt.upsert({
    where: { id: 20 },
    update: {},
    create: {
      title: 'Sur les Pas de Van Gogh',
      shortDescription: 'Un parcours artistique dans le village du peintre.',
      description:
        "Suis les traces de Vincent Van Gogh à Auvers-sur-Oise, entre l'église, les champs de blé et son dernier atelier.",
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Reproduction encadrée offerte',
      coverImage:
        'https://images.unsplash.com/photo-1577083552431-6e5fd75a9160?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntAuvers.id, ...HUNT_COORDS[20]!);

  // 21 — Meudon (Alice, ACTIVE)
  const huntMeudon = await prisma.hunt.upsert({
    where: { id: 21 },
    update: {},
    create: {
      title: 'La Forêt de Meudon',
      shortDescription: 'Aventure nature aux portes de Paris.',
      description:
        'Explore la forêt domaniale de Meudon et son observatoire, entre balades et énigmes scientifiques.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 2500,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Astronome de Meudon',
      coverImage:
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntMeudon.id, ...HUNT_COORDS[21]!);

  // 22 — Saint-Denis (Alice, ACTIVE)
  const huntSaintDenis = await prisma.hunt.upsert({
    where: { id: 22 },
    update: {},
    create: {
      title: 'La Nécropole Royale de Saint-Denis',
      shortDescription: 'Une chasse historique au cœur de la basilique.',
      description:
        'Découvre la basilique de Saint-Denis, dernière demeure des rois de France, et son riche passé.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'DENIS2026-PROMO10',
      coverImage:
        'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntSaintDenis.id, ...HUNT_COORDS[22]!);

  // 23 — Rambouillet (Alice, ACTIVE)
  const huntRambouillet = await prisma.hunt.upsert({
    where: { id: 23 },
    update: {},
    create: {
      title: 'La Bergerie Nationale de Rambouillet',
      shortDescription: 'Une chasse champêtre au château présidentiel.',
      description:
        'Une aventure dans le parc et le château de Rambouillet, résidence de chasse des présidents français.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 3000,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Berger de Rambouillet',
      coverImage:
        'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntRambouillet.id, ...HUNT_COORDS[23]!);

  // 24 — Sceaux (Alice, ACTIVE)
  const huntSceaux = await prisma.hunt.upsert({
    where: { id: 24 },
    update: {},
    create: {
      title: 'Les Jardins de Sceaux',
      shortDescription: 'Une chasse élégante dans le parc à la française.',
      description:
        'Explore le parc de Sceaux, son château et ses grandes cascades dessinées par Le Nôtre.',
      startDate: startDateHunt,
      endDate: endDateHunt,
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Pique-nique offert dans le parc',
      coverImage:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntSceaux.id, ...HUNT_COORDS[24]!);

  // ── Steps ──────────────────────────────────────────────────────────────────

  type StepSeed = {
    orderNumber: number;
    title: string;
    radius: number;
    points: number;
    refHunt: number;
    lat: number;
    lon: number;
    /** Durée estimée de l'étape en minutes (défaut 10 si non précisé). */
    estimatedDuration?: number;
  };

  const stepSeeds: StepSeed[] = [
    // Paris
    {
      orderNumber: 1,
      title: 'La Tour Eiffel',
      lat: 48.8584,
      lon: 2.2945,
      radius: 200,
      points: 100,
      refHunt: huntParis.id,
    },
    {
      orderNumber: 2,
      title: 'Le Louvre',
      lat: 48.8606,
      lon: 2.3376,
      radius: 100,
      points: 150,
      refHunt: huntParis.id,
    },
    {
      orderNumber: 3,
      title: 'Notre-Dame',
      lat: 48.853,
      lon: 2.3499,
      radius: 50,
      points: 200,
      refHunt: huntParis.id,
    },
    {
      orderNumber: 4,
      title: 'Sacré-Cœur',
      lat: 48.8867,
      lon: 2.3431,
      radius: 30,
      points: 175,
      refHunt: huntParis.id,
    },

    // Lyon
    {
      orderNumber: 1,
      title: 'Vieux-Lyon',
      lat: 45.76,
      lon: 4.827,
      radius: 30,
      points: 120,
      refHunt: huntLyon.id,
    },
    {
      orderNumber: 2,
      title: 'Fourvière',
      lat: 45.7623,
      lon: 4.822,
      radius: 50,
      points: 180,
      refHunt: huntLyon.id,
    },
    {
      orderNumber: 3,
      title: 'Place Bellecour',
      lat: 45.7578,
      lon: 4.832,
      radius: 80,
      points: 140,
      refHunt: huntLyon.id,
    },

    // Bordeaux
    {
      orderNumber: 1,
      title: 'Place de la Bourse',
      lat: 44.8412,
      lon: -0.5697,
      radius: 100,
      points: 80,
      refHunt: huntBordeaux.id,
    },
    {
      orderNumber: 2,
      title: 'Cathédrale Saint-André',
      lat: 44.8378,
      lon: -0.578,
      radius: 50,
      points: 120,
      refHunt: huntBordeaux.id,
    },

    // Strasbourg
    {
      orderNumber: 1,
      title: 'Cathédrale de Strasbourg',
      lat: 48.5818,
      lon: 7.7507,
      radius: 60,
      points: 150,
      refHunt: huntStrasbourg.id,
    },
    {
      orderNumber: 2,
      title: 'Petite France',
      lat: 48.579,
      lon: 7.7385,
      radius: 40,
      points: 100,
      refHunt: huntStrasbourg.id,
    },

    // Marseille
    {
      orderNumber: 1,
      title: 'Vieux-Port',
      lat: 43.2951,
      lon: 5.3745,
      radius: 150,
      points: 90,
      refHunt: huntMarseille.id,
    },
    {
      orderNumber: 2,
      title: 'Calanque de Morgiou',
      lat: 43.2141,
      lon: 5.4264,
      radius: 80,
      points: 200,
      refHunt: huntMarseille.id,
    },
    {
      orderNumber: 3,
      title: 'Notre-Dame de la Garde',
      lat: 43.2845,
      lon: 5.3708,
      radius: 60,
      points: 180,
      refHunt: huntMarseille.id,
    },

    // Mont-Saint-Michel
    {
      orderNumber: 1,
      title: 'Entrée du Mont',
      lat: 48.636,
      lon: -1.5115,
      radius: 30,
      points: 120,
      refHunt: huntMSM.id,
    },
    {
      orderNumber: 2,
      title: 'Abbaye',
      lat: 48.6361,
      lon: -1.5107,
      radius: 25,
      points: 250,
      refHunt: huntMSM.id,
    },
    {
      orderNumber: 3,
      title: 'Remparts',
      lat: 48.6359,
      lon: -1.512,
      radius: 40,
      points: 300,
      refHunt: huntMSM.id,
    },

    // Toulouse
    {
      orderNumber: 1,
      title: 'Capitole',
      lat: 43.6047,
      lon: 1.4442,
      radius: 60,
      points: 100,
      refHunt: huntToulouse.id,
    },
    {
      orderNumber: 2,
      title: "Cité de l'Espace",
      lat: 43.5852,
      lon: 1.4894,
      radius: 80,
      points: 150,
      refHunt: huntToulouse.id,
    },

    // Nice
    {
      orderNumber: 1,
      title: 'Promenade des Anglais',
      lat: 43.695,
      lon: 7.265,
      radius: 100,
      points: 80,
      refHunt: huntNice.id,
    },
    {
      orderNumber: 2,
      title: 'Vieux-Nice',
      lat: 43.6963,
      lon: 7.2769,
      radius: 50,
      points: 110,
      refHunt: huntNice.id,
    },
    {
      orderNumber: 3,
      title: 'Castle Hill',
      lat: 43.6969,
      lon: 7.2821,
      radius: 70,
      points: 160,
      refHunt: huntNice.id,
    },

    // Versailles
    {
      orderNumber: 1,
      title: 'Galerie des Glaces',
      lat: 48.8048,
      lon: 2.1203,
      radius: 30,
      points: 200,
      refHunt: huntVersailles.id,
    },
    {
      orderNumber: 2,
      title: 'Jardins de Versailles',
      lat: 48.804,
      lon: 2.114,
      radius: 60,
      points: 150,
      refHunt: huntVersailles.id,
    },
    {
      orderNumber: 3,
      title: 'Grand Trianon',
      lat: 48.809,
      lon: 2.104,
      radius: 50,
      points: 250,
      refHunt: huntVersailles.id,
    },

    // Valibout
    {
      orderNumber: 1,
      title: "L'entrée",
      lat: 48.819807,
      lon: 1.950907,
      radius: 30,
      points: 100,
      refHunt: huntValibout.id,
    },
    {
      orderNumber: 2,
      title: 'Le plat',
      // lat: 48.820215,
      // lon: 1.951237,
      lat: 48.819807, // IDEM QUE L'ENTREE
      lon: 1.950907, // IDEM QUE L'ENTREE
      radius: 30,
      points: 150,
      refHunt: huntValibout.id,
    },
    {
      orderNumber: 3,
      title: 'Le dessert',
      // lat: 48.819153,
      // lon: 1.950267,
      lat: 48.819807, // IDEM QUE L'ENTREE
      lon: 1.950907, // IDEM QUE L'ENTREE
      radius: 30,
      points: 200,
      refHunt: huntValibout.id,
    },

    // Sup De Vinci
    {
      orderNumber: 1,
      title: 'Accueil & Inscription',
      lat: 48.893536,
      lon: 2.238728,
      radius: 30,
      points: 100,
      refHunt: huntSupDeVinci.id,
    },
    {
      orderNumber: 2,
      title: 'Atelier Développement Web',
      lat: 48.893494,
      lon: 2.238763,
      radius: 25,
      points: 150,
      refHunt: huntSupDeVinci.id,
    },
    {
      orderNumber: 3,
      title: 'Lab Intelligence Artificielle',
      lat: 48.893363,
      lon: 2.238465,
      radius: 25,
      points: 200,
      refHunt: huntSupDeVinci.id,
    },

    // Nantes
    {
      orderNumber: 1,
      title: "L'Éléphant",
      lat: 47.2082,
      lon: -1.5649,
      radius: 80,
      points: 100,
      refHunt: huntNantes.id,
    },
    {
      orderNumber: 2,
      title: 'Le Carrousel des Mondes Marins',
      lat: 47.2078,
      lon: -1.5641,
      radius: 50,
      points: 130,
      refHunt: huntNantes.id,
    },
    {
      orderNumber: 3,
      title: 'Château des Ducs',
      lat: 47.216,
      lon: -1.5497,
      radius: 60,
      points: 175,
      refHunt: huntNantes.id,
    },

    // Fontainebleau
    {
      orderNumber: 1,
      title: 'Château de Fontainebleau',
      lat: 48.4021,
      lon: 2.7,
      radius: 80,
      points: 120,
      refHunt: huntFontainebleau.id,
    },

    // Saint-Germain-en-Laye
    {
      orderNumber: 1,
      title: 'Château de Saint-Germain-en-Laye',
      lat: 48.8983,
      lon: 2.0944,
      radius: 60,
      points: 120,
      refHunt: huntSaintGermain.id,
    },

    // Vincennes
    {
      orderNumber: 1,
      title: 'Donjon de Vincennes',
      lat: 48.8434,
      lon: 2.4347,
      radius: 50,
      points: 130,
      refHunt: huntVincennes.id,
    },

    // Disneyland Paris
    {
      orderNumber: 1,
      title: 'Esplanade du parc',
      lat: 48.8722,
      lon: 2.7808,
      radius: 80,
      points: 100,
      refHunt: huntDisneyland.id,
    },

    // Giverny
    {
      orderNumber: 1,
      title: 'Jardins de Monet',
      lat: 49.0758,
      lon: 1.5339,
      radius: 40,
      points: 110,
      refHunt: huntGiverny.id,
    },

    // Chantilly
    {
      orderNumber: 1,
      title: 'Château de Chantilly',
      lat: 49.1936,
      lon: 2.4869,
      radius: 70,
      points: 120,
      refHunt: huntChantilly.id,
    },

    // Provins
    {
      orderNumber: 1,
      title: 'Tour César',
      lat: 48.5598,
      lon: 3.2998,
      radius: 50,
      points: 130,
      refHunt: huntProvins.id,
    },

    // Auvers-sur-Oise
    {
      orderNumber: 1,
      title: "Église d'Auvers",
      lat: 49.0728,
      lon: 2.1717,
      radius: 40,
      points: 110,
      refHunt: huntAuvers.id,
    },

    // Meudon
    {
      orderNumber: 1,
      title: 'Observatoire de Meudon',
      lat: 48.8133,
      lon: 2.2347,
      radius: 60,
      points: 120,
      refHunt: huntMeudon.id,
    },

    // Saint-Denis
    {
      orderNumber: 1,
      title: 'Basilique de Saint-Denis',
      lat: 48.9357,
      lon: 2.3601,
      radius: 50,
      points: 120,
      refHunt: huntSaintDenis.id,
    },

    // Rambouillet
    {
      orderNumber: 1,
      title: 'Château de Rambouillet',
      lat: 48.6444,
      lon: 1.8307,
      radius: 70,
      points: 120,
      refHunt: huntRambouillet.id,
    },

    // Sceaux
    {
      orderNumber: 1,
      title: 'Parc de Sceaux',
      lat: 48.7784,
      lon: 2.2913,
      radius: 60,
      points: 110,
      refHunt: huntSceaux.id,
    },
  ];

  // Crée les étapes sans coordonnées géographiques (insérées via $executeRaw ensuite)
  await prisma.step.createMany({
    skipDuplicates: true,
    data: stepSeeds.map(({ lat: _lat, lon: _lon, ...s }) => ({
      orderNumber: s.orderNumber,
      title: s.title,
      radius: s.radius,
      points: s.points,
      estimatedDuration: s.estimatedDuration ?? 10,
      refHunt: s.refHunt,
    })),
  });

  // Injecte les coordonnées géographiques pour chaque étape
  for (const s of stepSeeds) {
    const step = await prisma.step.findFirst({
      where: { refHunt: s.refHunt, orderNumber: s.orderNumber },
    });
    if (step) {
      await setStepLocation(step.id, s.lon, s.lat);
    }
  }

  // ── Clues ──────────────────────────────────────────────────────────────────

  type ClueSeed = { orderNumber: number; message: string; penaltyCost: number };
  type StepClueSeed = { refHunt: number; stepOrder: number; clues: ClueSeed[] };

  const stepClueSeeds: StepClueSeed[] = [
    // Paris
    {
      refHunt: huntParis.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: 'Regarde vers le sud depuis le Champ-de-Mars.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'La dame de fer a les pieds dans le gazon.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntParis.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message: 'Le plus grand musée du monde borde ce jardin royal.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "La pyramide de verre marque l'entrée principale.",
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntParis.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message: "Elle se dresse sur l'île de la Cité, au cœur de la Seine.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Ses deux tours gothiques veillent sur Paris depuis 850 ans.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntParis.id,
      stepOrder: 4,
      clues: [
        {
          orderNumber: 1,
          message: "Compte les marches blanches jusqu'au sommet.",
          penaltyCost: 15,
        },
        {
          orderNumber: 2,
          message: 'Son dôme blanc domine la butte depuis Montmartre.',
          penaltyCost: 25,
        },
      ],
    },

    // Lyon
    {
      refHunt: huntLyon.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message:
            'Les traboules percent les immeubles Renaissance de part en part.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Ce quartier médiéval borde la rive droite de la Saône.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntLyon.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message: 'La basilique brille en or sur la colline.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Cherche la mosaïque côté est du parvis.',
          penaltyCost: 25,
        },
      ],
    },
    {
      refHunt: huntLyon.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message:
            "La plus grande place piétonne de France accueille la statue d'un roi.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Louis XIV trône au centre, regarde vers le nord.',
          penaltyCost: 15,
        },
      ],
    },

    // Bordeaux
    {
      refHunt: huntBordeaux.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message:
            "Son reflet se lit dans le miroir d'eau, le plus grand du monde.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Trois pavillons symétriques face à la Garonne.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntBordeaux.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message: "Son clocher isolé s'appelle la tour Pey-Berland.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Napoléon y a épousé Marie-Louise par procuration.',
          penaltyCost: 20,
        },
      ],
    },

    // Strasbourg
    {
      refHunt: huntStrasbourg.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message:
            "Sa flèche unique culmine à 142 mètres, dominant toute l'Alsace.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "L'horloge astronomique sonne à 12h30 précises.",
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntStrasbourg.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            'Les canaux encerclent ce quartier de maisons à colombages colorées.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Les tanneurs séchaient leurs peaux aux fenêtres de ces maisons.',
          penaltyCost: 15,
        },
      ],
    },

    // Marseille
    {
      refHunt: huntMarseille.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: 'Le ferry-boat traverse ce port depuis 1880.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Les pointus sont ces barques traditionnelles peintes aux couleurs vives.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntMarseille.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            "L'eau turquoise est accessible uniquement à pied ou en bateau.",
          penaltyCost: 15,
        },
        {
          orderNumber: 2,
          message:
            'Les falaises calcaires plongent directement dans la Méditerranée.',
          penaltyCost: 25,
        },
      ],
    },
    {
      refHunt: huntMarseille.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message:
            'La Bonne Mère veille sur tous les marins depuis son promontoire.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Son intérieur est entièrement revêtu de marbres colorés.',
          penaltyCost: 20,
        },
      ],
    },

    // Mont-Saint-Michel
    {
      refHunt: huntMSM.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: "La digue-route permet d'accéder au rocher à marée basse.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "La Grande Rue mène directement jusqu'à l'abbaye.",
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntMSM.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message: 'Saint Michel terrasse le dragon au sommet de la flèche.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Le cloître suspend ses colonnes entre ciel et mer.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntMSM.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message: 'Les marées montent deux fois par jour ici.',
          penaltyCost: 20,
        },
        {
          orderNumber: 2,
          message: 'La réponse est gravée sur le rempart nord.',
          penaltyCost: 40,
        },
      ],
    },

    // Toulouse
    {
      refHunt: huntToulouse.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: 'Sa façade rose en brique chauffe au soleil du Midi.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Les capitouls gouvernaient la ville depuis ce bâtiment.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntToulouse.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            'Une réplique de la station spatiale internationale y est exposée.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "Ariane 5 se dresse fièrement à l'entrée du parc.",
          penaltyCost: 15,
        },
      ],
    },

    // Nice
    {
      refHunt: huntNice.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: 'Les galets remplacent le sable sur cette célèbre plage.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Les palmiers longent 7 kilomètres de bord de mer.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntNice.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            'Les façades baroques ocre et rose colorent les ruelles étroites.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Le marché du Cours Saleya embaume de fleurs et de socca.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntNice.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message:
            'La cascade artificielle dévale les falaises au-dessus de la mer.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "Du sommet, le port Lympia s'étend à l'est.",
          penaltyCost: 20,
        },
      ],
    },

    // Versailles
    {
      refHunt: huntVersailles.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: 'Dix-sept miroirs reflètent la lumière venant des jardins.',
          penaltyCost: 15,
        },
        {
          orderNumber: 2,
          message:
            'Le traité de 1919 y fut signé, mettant fin à la Grande Guerre.',
          penaltyCost: 25,
        },
      ],
    },
    {
      refHunt: huntVersailles.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            'Le Nôtre a dessiné ces perspectives à la règle et au compas.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: "Le Grand Canal s'étend sur 1 500 mètres vers l'ouest.",
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntVersailles.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message: 'Louis XIV aimait le rose dans ses appartements privés.',
          penaltyCost: 15,
        },
        {
          orderNumber: 2,
          message: 'Ce petit palais fut offert à Marie de Maintenon.',
          penaltyCost: 25,
        },
      ],
    },

    // Valibout
    {
      refHunt: huntValibout.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message: "L'amuse-bouche se cache près du portail en bois.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Cherche la table dressée sous le grand chêne.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntValibout.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            "Le plat de résistance attend à l'ombre du bâtiment principal.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Regarde sous la cloche argentée posée sur la pierre.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntValibout.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message: 'Le dessert se déguste au bord du petit étang.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'Le marqueur AR est collé sous le banc en fer forgé.',
          penaltyCost: 20,
        },
      ],
    },

    // Sup De Vinci
    {
      refHunt: huntSupDeVinci.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message:
            "Le premier contact avec l'école se fait derrière la grande porte vitrée à l'entrée du bâtiment.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Cherche le panneau "Bienvenue" portant le logo de l\'école — il indique le bureau des inscriptions.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntSupDeVinci.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message:
            'Dans cette salle, les étudiants apprennent à bâtir des sites web. Cherche la machine affichant un éditeur de code.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Le tableau blanc mentionne HTML, CSS et JavaScript — tu es au bon endroit.',
          penaltyCost: 20,
        },
      ],
    },
    {
      refHunt: huntSupDeVinci.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message:
            'Dans ce laboratoire, les machines entraînent des modèles de machine learning. Repère les GPUs sous les bureaux.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            "Le poster sur le mur montre un réseau de neurones artificiels — l'indice final est collé derrière lui.",
          penaltyCost: 25,
        },
      ],
    },

    // Nantes
    {
      refHunt: huntNantes.id,
      stepOrder: 1,
      clues: [
        {
          orderNumber: 1,
          message:
            'La grande créature mécanique souffle de la vapeur toutes les heures.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            "Son billet se prend à la billetterie des Machines de l'île.",
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntNantes.id,
      stepOrder: 2,
      clues: [
        {
          orderNumber: 1,
          message: 'Trois niveaux de créatures marines tournent sur eux-mêmes.',
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message: 'La pieuvre géante occupe le niveau supérieur.',
          penaltyCost: 15,
        },
      ],
    },
    {
      refHunt: huntNantes.id,
      stepOrder: 3,
      clues: [
        {
          orderNumber: 1,
          message:
            "Les ducs de Bretagne y résidaient avant l'union à la France.",
          penaltyCost: 10,
        },
        {
          orderNumber: 2,
          message:
            'Le puits de la cathédrale gothique se trouve dans la cour intérieure.',
          penaltyCost: 20,
        },
      ],
    },
  ];

  for (const { refHunt, stepOrder, clues } of stepClueSeeds) {
    const step = await prisma.step.findFirst({
      where: { refHunt, orderNumber: stepOrder },
    });
    if (!step) continue;
    await prisma.clue.createMany({
      skipDuplicates: true,
      data: clues.map((c) => ({ ...c, refStep: step.id })),
    });
  }

  // ── Participations ─────────────────────────────────────────────────────────

  await prisma.participation.upsert({
    where: { refUser_refHunt: { refUser: diana.id, refHunt: huntParis.id } },
    update: {},
    create: {
      refUser: diana.id,
      refHunt: huntParis.id,
      totalPoints: 625,
      status: 'COMPLETED',
      endTime: new Date('2025-03-03T12:45:00'),
    },
  });

  await prisma.participation.upsert({
    where: { refUser_refHunt: { refUser: diana.id, refHunt: huntNice.id } },
    update: {},
    create: {
      refUser: diana.id,
      refHunt: huntNice.id,
      totalPoints: 350,
      status: 'COMPLETED',
      endTime: new Date('2025-08-15T16:30:00'),
    },
  });

  await prisma.participation.upsert({
    where: {
      refUser_refHunt: { refUser: charlie.id, refHunt: huntMarseille.id },
    },
    update: {},
    create: {
      refUser: charlie.id,
      refHunt: huntMarseille.id,
      totalPoints: 470,
      status: 'COMPLETED',
      endTime: new Date('2025-06-20T11:00:00'),
    },
  });

  // ── Progress pour les participations complétées ────────────────────────────

  const [partDianaParis, partDianaNice, partCharlieMarseille] =
    await Promise.all([
      prisma.participation.findUnique({
        where: {
          refUser_refHunt: { refUser: diana.id, refHunt: huntParis.id },
        },
      }),
      prisma.participation.findUnique({
        where: { refUser_refHunt: { refUser: diana.id, refHunt: huntNice.id } },
      }),
      prisma.participation.findUnique({
        where: {
          refUser_refHunt: { refUser: charlie.id, refHunt: huntMarseille.id },
        },
      }),
    ]);

  // Diana a complété Paris (4 étapes)
  if (partDianaParis) {
    const stepsP = await prisma.step.findMany({
      where: { refHunt: huntParis.id },
      orderBy: { orderNumber: 'asc' },
    });
    const pointsP = [100, 150, 200, 175];
    await prisma.progress.createMany({
      skipDuplicates: true,
      data: stepsP.map((s, i) => ({
        refParticipation: partDianaParis.id,
        refStep: s.id,
        statut: 'COMPLETED' as const,
        totalPoints: pointsP[i] ?? 0,
        completedAt: new Date('2025-03-03T12:45:00'),
      })),
    });
  }

  // Diana a complété Nice (3 étapes)
  if (partDianaNice) {
    const stepsN = await prisma.step.findMany({
      where: { refHunt: huntNice.id },
      orderBy: { orderNumber: 'asc' },
    });
    const pointsN = [80, 110, 160];
    await prisma.progress.createMany({
      skipDuplicates: true,
      data: stepsN.map((s, i) => ({
        refParticipation: partDianaNice.id,
        refStep: s.id,
        statut: 'COMPLETED' as const,
        totalPoints: pointsN[i] ?? 0,
        completedAt: new Date('2025-08-15T16:30:00'),
      })),
    });
  }

  // Charlie a complété Marseille (3 étapes)
  if (partCharlieMarseille) {
    const stepsM = await prisma.step.findMany({
      where: { refHunt: huntMarseille.id },
      orderBy: { orderNumber: 'asc' },
    });
    const pointsM = [90, 200, 180];
    await prisma.progress.createMany({
      skipDuplicates: true,
      data: stepsM.map((s, i) => ({
        refParticipation: partCharlieMarseille.id,
        refStep: s.id,
        statut: 'COMPLETED' as const,
        totalPoints: pointsM[i] ?? 0,
        completedAt: new Date('2025-06-20T11:00:00'),
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
