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
};

async function setHuntLocationCenter(huntId: number, lon: number, lat: number) {
  await prisma.$executeRaw`
    UPDATE "Hunt"
    SET "locationCenter" = ST_MakePoint(${lon}, ${lat})::geography
    WHERE id = ${huntId}
  `;
}

async function setStepLocation(stepId: number, lon: number, lat: number) {
  await prisma.$executeRaw`
    UPDATE "Step"
    SET "location" = ST_MakePoint(${lon}, ${lat})::geography
    WHERE id = ${stepId}
  `;
}

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = '$2b$10$kfG7lYzqx1jFZpfnR4rBX.3bZDX10SsNoVRNFrkmJU3vDRx//me7i'; // mot de passe : lol

  const admin = await prisma.user.upsert({
    where: { email: 'john@admin.com' },
    update: {},
    create: {
      username: 'admin_john',
      firstname: 'John',
      lastname: 'Admin',
      email: 'john@admin.com',
      passwordHash: hash,
      role: 'ADMIN',
      country: 'FR',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@partner.com' },
    update: {},
    create: {
      username: 'partner_alice',
      firstname: 'Alice',
      lastname: 'Partner',
      email: 'alice@partner.com',
      passwordHash: hash,
      role: 'PARTNER',
      country: 'FR',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@partner.com' },
    update: {},
    create: {
      username: 'partner_bob',
      firstname: 'Bob',
      lastname: 'Partner',
      email: 'bob@partner.com',
      passwordHash: hash,
      role: 'PARTNER',
      country: 'FR',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@player.com' },
    update: {},
    create: {
      username: 'player_charlie',
      firstname: 'Charlie',
      lastname: 'Player',
      email: 'charlie@player.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: 'diana@player.com' },
    update: {},
    create: {
      username: 'player_diana',
      firstname: 'Diana',
      lastname: 'Player',
      email: 'diana@player.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john.doe@gmail.com' },
    update: {},
    create: {
      username: 'Johnny',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@gmail.com',
      passwordHash: hash,
      role: 'PLAYER',
      country: 'FR',
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
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-31'),
      radius: 5000,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'PARIS2025-PROMO10',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntParis.id, ...HUNT_COORDS[1]!);

  // 2 — Lyon (Bob, DRAFT)
  const huntLyon = await prisma.hunt.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Mystères de Lyon',
      shortDescription: 'Partez à la découverte des traboules lyonnaises.',
      description:
        'Explorez les passages secrets de la vieille ville de Lyon et résolvez des énigmes historiques.',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-04-30'),
      radius: 3500,
      status: 'DRAFT',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'LYON2025-PROMO15',
      coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
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
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-31'),
      radius: 4000,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Dégustation offerte au Château Margaux',
      coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
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
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-24'),
      radius: 2500,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Explorateur Alsacien',
      coverImage: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntStrasbourg.id, ...HUNT_COORDS[4]!);

  // 5 — Marseille (Alice, FINISHED)
  const huntMarseille = await prisma.hunt.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Les Calanques de Marseille',
      shortDescription: 'Une aventure nature sur les côtes méditerranéennes.',
      description:
        'Explorez les calanques sauvages de Marseille et résolvez des énigmes liées à la géologie et à la faune méditerranéenne.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      radius: 8000,
      status: 'FINISHED',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'MER2025-PROMO20',
      coverImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
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
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-08-15'),
      radius: 1500,
      status: 'ACTIVE',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Visite guidée nocturne exclusive',
      coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntMSM.id, ...HUNT_COORDS[6]!);

  // 7 — Toulouse (Alice, DRAFT)
  const huntToulouse = await prisma.hunt.upsert({
    where: { id: 7 },
    update: {},
    create: {
      title: 'La Ville Rose',
      shortDescription: 'Découvrez Toulouse entre art et sciences.',
      description:
        "Une chasse mêlant l'histoire de la ville rose, ses capitouls et ses grandes institutions scientifiques comme la Cité de l'Espace.",
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-30'),
      radius: 3000,
      status: 'DRAFT',
      rewardType: 'BADGE',
      rewardValue: 'Badge Astronaute Toulousain',
      coverImage: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800',
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
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-31'),
      radius: 3500,
      status: 'ACTIVE',
      rewardType: 'DISCOUNT_CODE',
      rewardValue: 'COTE2025-PROMO10',
      coverImage: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      refUser: bob.id,
    },
  });
  await setHuntLocationCenter(huntNice.id, ...HUNT_COORDS[8]!);

  // 9 — Versailles (Alice, FINISHED)
  const huntVersailles = await prisma.hunt.upsert({
    where: { id: 9 },
    update: {},
    create: {
      title: 'Secrets du Château de Versailles',
      shortDescription: 'Explorez les jardins et galeries royales.',
      description:
        'Une chasse au cœur du domaine royal de Versailles, entre la Galerie des Glaces et les bosquets secrets des jardins à la française.',
      startDate: new Date('2025-04-15'),
      endDate: new Date('2025-05-15'),
      radius: 6000,
      status: 'FINISHED',
      rewardType: 'FREE_ITEM',
      rewardValue: 'Accès privatif aux appartements du roi',
      coverImage: 'https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntVersailles.id, ...HUNT_COORDS[9]!);

  // 10 — Nantes (Bob, DRAFT)
  const huntNantes = await prisma.hunt.upsert({
    where: { id: 10 },
    update: {},
    create: {
      title: "L'Éléphant de Nantes",
      shortDescription: "Suivez les machines de l'île dans Nantes.",
      description:
        "Une aventure steampunk à travers l'île de Nantes, guidée par les créatures mécaniques des Machines de l'île.",
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      radius: 4000,
      status: 'DRAFT',
      rewardType: 'BADGE',
      rewardValue: 'Badge Mécanicien des Machines',
      coverImage: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=800',
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
        'Partez à la découverte du Valibout en trois étapes : l\'entrée, le plat et le dessert. Une chasse en réalité augmentée pour les fins gourmets explorateurs.',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-12-31'),
      radius: 500,
      status: 'ACTIVE',
      rewardType: 'BADGE',
      rewardValue: 'Badge Gourmet du Valibout',
      coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      refUser: alice.id,
    },
  });
  await setHuntLocationCenter(huntValibout.id, ...HUNT_COORDS[11]!);

  // ── Steps ──────────────────────────────────────────────────────────────────

  type StepSeed = {
    orderNumber: number;
    title: string;
    radius: number;
    actionType: 'GPS' | 'QR_CODE' | 'AR' | 'RIDDLE';
    qrCodeValue?: string;
    points: number;
    refHunt: number;
    lat: number;
    lon: number;
  };

  const stepSeeds: StepSeed[] = [
    // Paris
    {
      orderNumber: 1,
      title: 'La Tour Eiffel',
      lat: 48.8584,
      lon: 2.2945,
      radius: 200,
      actionType: 'GPS',
      points: 100,
      refHunt: huntParis.id,
    },
    {
      orderNumber: 2,
      title: 'Le Louvre',
      lat: 48.8606,
      lon: 2.3376,
      radius: 100,
      actionType: 'QR_CODE',
      points: 150,
      refHunt: huntParis.id,
      qrCodeValue: 'louvre-qr-2025',
    },
    {
      orderNumber: 3,
      title: 'Notre-Dame',
      lat: 48.853,
      lon: 2.3499,
      radius: 50,
      actionType: 'AR',
      points: 200,
      refHunt: huntParis.id,
    },
    {
      orderNumber: 4,
      title: 'Sacré-Cœur',
      lat: 48.8867,
      lon: 2.3431,
      radius: 30,
      actionType: 'RIDDLE',
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
      actionType: 'QR_CODE',
      points: 120,
      refHunt: huntLyon.id,
      qrCodeValue: 'vieux-lyon-qr-2025',
    },
    {
      orderNumber: 2,
      title: 'Fourvière',
      lat: 45.7623,
      lon: 4.822,
      radius: 50,
      actionType: 'AR',
      points: 180,
      refHunt: huntLyon.id,
    },
    {
      orderNumber: 3,
      title: 'Place Bellecour',
      lat: 45.7578,
      lon: 4.832,
      radius: 80,
      actionType: 'QR_CODE',
      points: 140,
      refHunt: huntLyon.id,
      qrCodeValue: 'bellecour-qr-2025',
    },

    // Bordeaux
    {
      orderNumber: 1,
      title: 'Place de la Bourse',
      lat: 44.8412,
      lon: -0.5697,
      radius: 100,
      actionType: 'GPS',
      points: 80,
      refHunt: huntBordeaux.id,
    },
    {
      orderNumber: 2,
      title: 'Cathédrale Saint-André',
      lat: 44.8378,
      lon: -0.578,
      radius: 50,
      actionType: 'QR_CODE',
      points: 120,
      refHunt: huntBordeaux.id,
      qrCodeValue: 'saint-andre-qr-2025',
    },

    // Strasbourg
    {
      orderNumber: 1,
      title: 'Cathédrale de Strasbourg',
      lat: 48.5818,
      lon: 7.7507,
      radius: 60,
      actionType: 'AR',
      points: 150,
      refHunt: huntStrasbourg.id,
    },
    {
      orderNumber: 2,
      title: 'Petite France',
      lat: 48.579,
      lon: 7.7385,
      radius: 40,
      actionType: 'QR_CODE',
      points: 100,
      refHunt: huntStrasbourg.id,
      qrCodeValue: 'petite-france-qr-2025',
    },

    // Marseille
    {
      orderNumber: 1,
      title: 'Vieux-Port',
      lat: 43.2951,
      lon: 5.3745,
      radius: 150,
      actionType: 'GPS',
      points: 90,
      refHunt: huntMarseille.id,
    },
    {
      orderNumber: 2,
      title: 'Calanque de Morgiou',
      lat: 43.2141,
      lon: 5.4264,
      radius: 80,
      actionType: 'RIDDLE',
      points: 200,
      refHunt: huntMarseille.id,
    },
    {
      orderNumber: 3,
      title: 'Notre-Dame de la Garde',
      lat: 43.2845,
      lon: 5.3708,
      radius: 60,
      actionType: 'AR',
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
      actionType: 'QR_CODE',
      points: 120,
      refHunt: huntMSM.id,
      qrCodeValue: 'msm-porte-qr-2025',
    },
    {
      orderNumber: 2,
      title: 'Abbaye',
      lat: 48.6361,
      lon: -1.5107,
      radius: 25,
      actionType: 'AR',
      points: 250,
      refHunt: huntMSM.id,
    },
    {
      orderNumber: 3,
      title: 'Remparts',
      lat: 48.6359,
      lon: -1.512,
      radius: 40,
      actionType: 'RIDDLE',
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
      actionType: 'GPS',
      points: 100,
      refHunt: huntToulouse.id,
    },
    {
      orderNumber: 2,
      title: "Cité de l'Espace",
      lat: 43.5852,
      lon: 1.4894,
      radius: 80,
      actionType: 'QR_CODE',
      points: 150,
      refHunt: huntToulouse.id,
      qrCodeValue: 'cite-espace-qr-2025',
    },

    // Nice
    {
      orderNumber: 1,
      title: 'Promenade des Anglais',
      lat: 43.695,
      lon: 7.265,
      radius: 100,
      actionType: 'GPS',
      points: 80,
      refHunt: huntNice.id,
    },
    {
      orderNumber: 2,
      title: 'Vieux-Nice',
      lat: 43.6963,
      lon: 7.2769,
      radius: 50,
      actionType: 'QR_CODE',
      points: 110,
      refHunt: huntNice.id,
      qrCodeValue: 'vieux-nice-qr-2025',
    },
    {
      orderNumber: 3,
      title: 'Castle Hill',
      lat: 43.6969,
      lon: 7.2821,
      radius: 70,
      actionType: 'RIDDLE',
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
      actionType: 'AR',
      points: 200,
      refHunt: huntVersailles.id,
    },
    {
      orderNumber: 2,
      title: 'Jardins de Versailles',
      lat: 48.804,
      lon: 2.114,
      radius: 60,
      actionType: 'QR_CODE',
      points: 150,
      refHunt: huntVersailles.id,
      qrCodeValue: 'jardins-versailles-qr-2025',
    },
    {
      orderNumber: 3,
      title: 'Grand Trianon',
      lat: 48.809,
      lon: 2.104,
      radius: 50,
      actionType: 'RIDDLE',
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
      actionType: 'AR',
      points: 100,
      refHunt: huntValibout.id,
    },
    {
      orderNumber: 2,
      title: 'Le plat',
      lat: 48.820215,
      lon: 1.951237,
      radius: 30,
      actionType: 'AR',
      points: 150,
      refHunt: huntValibout.id,
    },
    {
      orderNumber: 3,
      title: 'Le dessert',
      lat: 48.819153,
      lon: 1.950267,
      radius: 30,
      actionType: 'AR',
      points: 200,
      refHunt: huntValibout.id,
    },

    // Nantes
    {
      orderNumber: 1,
      title: "L'Éléphant",
      lat: 47.2082,
      lon: -1.5649,
      radius: 80,
      actionType: 'GPS',
      points: 100,
      refHunt: huntNantes.id,
    },
    {
      orderNumber: 2,
      title: 'Le Carrousel des Mondes Marins',
      lat: 47.2078,
      lon: -1.5641,
      radius: 50,
      actionType: 'QR_CODE',
      points: 130,
      refHunt: huntNantes.id,
      qrCodeValue: 'carrousel-nantes-qr-2025',
    },
    {
      orderNumber: 3,
      title: 'Château des Ducs',
      lat: 47.216,
      lon: -1.5497,
      radius: 60,
      actionType: 'RIDDLE',
      points: 175,
      refHunt: huntNantes.id,
    },
  ];

  // Crée les étapes sans coordonnées géographiques (insérées via $executeRaw ensuite)
  await prisma.step.createMany({
    skipDuplicates: true,
    data: stepSeeds.map(({ lat: _lat, lon: _lon, ...s }) => ({
      orderNumber: s.orderNumber,
      title: s.title,
      radius: s.radius,
      actionType: s.actionType,
      qrCodeValue: s.qrCodeValue ?? null,
      points: s.points,
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

  // Récupère quelques étapes pour y attacher des indices
  const [stepParis1, stepParis4, stepLyon2, stepMSM3, stepVersailles3] =
    await Promise.all([
      prisma.step.findFirst({
        where: { refHunt: huntParis.id, orderNumber: 1 },
      }),
      prisma.step.findFirst({
        where: { refHunt: huntParis.id, orderNumber: 4 },
      }),
      prisma.step.findFirst({
        where: { refHunt: huntLyon.id, orderNumber: 2 },
      }),
      prisma.step.findFirst({ where: { refHunt: huntMSM.id, orderNumber: 3 } }),
      prisma.step.findFirst({
        where: { refHunt: huntVersailles.id, orderNumber: 3 },
      }),
    ]);

  const clueData = [
    ...(stepParis1
      ? [
          {
            refStep: stepParis1.id,
            orderNumber: 1,
            message: 'Regarde vers le sud depuis le Champ-de-Mars.',
            penaltyCost: 10,
          },
          {
            refStep: stepParis1.id,
            orderNumber: 2,
            message: 'La dame de fer a les pieds dans le gazon.',
            penaltyCost: 20,
          },
        ]
      : []),
    ...(stepParis4
      ? [
          {
            refStep: stepParis4.id,
            orderNumber: 1,
            message: "Compte les marches blanches jusqu'au sommet.",
            penaltyCost: 15,
          },
        ]
      : []),
    ...(stepLyon2
      ? [
          {
            refStep: stepLyon2.id,
            orderNumber: 1,
            message: 'La basilique brille en or sur la colline.',
            penaltyCost: 10,
          },
          {
            refStep: stepLyon2.id,
            orderNumber: 2,
            message: 'Cherche la mosaïque côté est du parvis.',
            penaltyCost: 25,
          },
        ]
      : []),
    ...(stepMSM3
      ? [
          {
            refStep: stepMSM3.id,
            orderNumber: 1,
            message: 'Les marées montent deux fois par jour ici.',
            penaltyCost: 20,
          },
          {
            refStep: stepMSM3.id,
            orderNumber: 2,
            message: 'La réponse est gravée sur le rempart nord.',
            penaltyCost: 40,
          },
        ]
      : []),
    ...(stepVersailles3
      ? [
          {
            refStep: stepVersailles3.id,
            orderNumber: 1,
            message: 'Louis XIV aimait le rose dans ses appartements privés.',
            penaltyCost: 15,
          },
        ]
      : []),
  ];

  await prisma.clue.createMany({ skipDuplicates: true, data: clueData });

  // ── Participations ─────────────────────────────────────────────────────────

  await prisma.participation.upsert({
    where: { refUser_refHunt: { refUser: charlie.id, refHunt: huntParis.id } },
    update: {},
    create: {
      refUser: charlie.id,
      refHunt: huntParis.id,
      totalPoints: 100,
      status: 'IN_PROGRESS',
    },
  });

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
    where: {
      refUser_refHunt: { refUser: charlie.id, refHunt: huntBordeaux.id },
    },
    update: {},
    create: {
      refUser: charlie.id,
      refHunt: huntBordeaux.id,
      totalPoints: 80,
      status: 'IN_PROGRESS',
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
