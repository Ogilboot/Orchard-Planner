import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { bulkVarieties } from "./data/varieties";

const db = new PrismaClient();

type VarietySeed = {
  commonName: string;
  species: string;
  chillHours: number;
  hardinessZone: string;
  pollinationGroup: string;
  harvestWindow: string;
  flavorNotes: string;
  diseaseResistanceNotes: string;
  originNotes: string;
  synonyms: string[];
  selfFertile?: boolean;
  triploid?: boolean;
  diseaseRating?: number;
  heritage?: boolean;
};

const varieties: VarietySeed[] = [
  {
    commonName: "Ashmead's Kernel",
    species: "Malus domestica",
    chillHours: 500,
    hardinessZone: "4-8",
    pollinationGroup: "3",
    harvestWindow: "Late October - January",
    flavorNotes:
      "Renowned dessert apple with intense, sweet-sharp, pear-drop flavour. Crisp and aromatic.",
    diseaseResistanceNotes: "Some scab susceptibility; good overall vigour.",
    originNotes:
      "Raised by Dr Ashmead, Gloucester, England, around 1700. A prized heritage variety.",
    synonyms: ["Ashmeads Kernel", "Ashmead's Kernel"],
    diseaseRating: 2,
    heritage: true,
  },
  {
    commonName: "Bramley's Seedling",
    species: "Malus domestica",
    chillHours: 600,
    hardinessZone: "4-8",
    pollinationGroup: "3",
    harvestWindow: "October - March",
    flavorNotes:
      "The classic British cooking apple; sharp, acidic, cooks to a fluffy puree. Triploid.",
    diseaseResistanceNotes: "Triploid; needs two pollinators but is a poor pollinator itself.",
    originNotes: "Raised from a pip by Matthew Bramley, Southwell, England, 1809.",
    synonyms: ["Bramley"],
    triploid: true,
    heritage: true,
  },
  {
    commonName: "Egremont Russet",
    species: "Malus domestica",
    chillHours: 500,
    hardinessZone: "4-8",
    pollinationGroup: "2",
    harvestWindow: "October - December",
    flavorNotes: "Dry, nutty, sweet russet apple; excellent dessert and cider fruit.",
    diseaseResistanceNotes: "Good disease resistance.",
    originNotes: "First recorded 1872, Petworth, England.",
    synonyms: ["Egremont"],
  },
  {
    commonName: "Cox's Orange Pippin",
    species: "Malus domestica",
    chillHours: 600,
    hardinessZone: "4-8",
    pollinationGroup: "3",
    harvestWindow: "October - December",
    flavorNotes: "Sweet, aromatic dessert apple with a rich, complex flavour.",
    diseaseResistanceNotes: "Susceptible to scab and canker; needs good husbandry.",
    originNotes: "Raised by Richard Cox, Colnbrook, England, 1825.",
    synonyms: ["Cox", "Cox's Orange"],
  },
  {
    commonName: "Discovery",
    species: "Malus domestica",
    chillHours: 600,
    hardinessZone: "4-8",
    pollinationGroup: "3",
    harvestWindow: "August - September",
    flavorNotes: "Early dessert apple with a distinct strawberry flavour.",
    diseaseResistanceNotes: "Good general health; reliable cropper.",
    originNotes: "Raised in Langham, Essex, England, 1949.",
    synonyms: [],
  },
  {
    commonName: "Dabinett",
    species: "Malus domestica",
    chillHours: 600,
    hardinessZone: "4-8",
    pollinationGroup: "6",
    harvestWindow: "November",
    flavorNotes: "Bittersweet cider apple producing soft, full-bodied cider.",
    diseaseResistanceNotes: "Good resistance; reliable cropper.",
    originNotes: "Somerset, England, early 1900s. A leading cider variety.",
    synonyms: [],
  },
  {
    commonName: "Conference",
    species: "Pyrus communis",
    chillHours: 600,
    hardinessZone: "5-8",
    pollinationGroup: "3",
    harvestWindow: "October - November",
    flavorNotes: "Reliable dessert pear; sweet and juicy, partially self-fertile.",
    diseaseResistanceNotes: "Generally hardy and disease resistant.",
    originNotes: "Raised by Rivers Nursery, 1884, Sawbridgeworth, England.",
    synonyms: [],
  },
  {
    commonName: "Williams' Bon Chrétien",
    species: "Pyrus communis",
    chillHours: 600,
    hardinessZone: "5-8",
    pollinationGroup: "3",
    harvestWindow: "September",
    flavorNotes: "Sweet, perfumed dessert pear; excellent for bottling and poaching.",
    diseaseResistanceNotes: "Reliable and vigorous.",
    originNotes: "An old English pear, widely known as 'Bartlett' overseas.",
    synonyms: ["Bartlett", "Williams"],
  },
  {
    commonName: "Victoria",
    species: "Prunus domestica",
    chillHours: 700,
    hardinessZone: "5-8",
    pollinationGroup: "3",
    harvestWindow: "Late August - September",
    flavorNotes: "The most widely grown English plum; sweet dessert and cooking plum.",
    diseaseResistanceNotes: "Self-fertile and reliable.",
    originNotes: "Named after Queen Victoria; found in Sussex, England, c.1840.",
    synonyms: [],
    selfFertile: true,
    diseaseRating: 5,
  },
  {
    commonName: "Farleigh Damson",
    species: "Prunus domestica subsp. insititia",
    chillHours: 700,
    hardinessZone: "5-8",
    pollinationGroup: "4",
    harvestWindow: "September",
    flavorNotes: "Rich, astringent damson; classic for jams, cheese and damson gin.",
    diseaseResistanceNotes: "Hardy and dependable.",
    originNotes: "An old English damson, grown for centuries.",
    synonyms: ["Farleigh"],
  },
  {
    commonName: "Stella",
    species: "Prunus avium",
    chillHours: 700,
    hardinessZone: "5-8",
    pollinationGroup: "4",
    harvestWindow: "July",
    flavorNotes: "Sweet, dark dessert cherry; self-fertile and reliable.",
    diseaseResistanceNotes: "Good all-round health.",
    originNotes: "Raised in Summerland, Canada, 1968.",
    synonyms: [],
    selfFertile: true,
  },
  {
    commonName: "Kentish Cob",
    species: "Corylus avellana",
    chillHours: 800,
    hardinessZone: "4-8",
    pollinationGroup: "N/A",
    harvestWindow: "Late August - September",
    flavorNotes: "Large, sweet cobnut with good flavour; the classic British cobnut.",
    diseaseResistanceNotes: "Reliable and vigorous.",
    originNotes: "The traditional English cobnut; grown in Kent since the 19th century.",
    synonyms: ["Lambert's Filbert", "Kent Cob"],
  },
  {
    commonName: "Bluecrop",
    species: "Vaccinium corymbosum",
    chillHours: 800,
    hardinessZone: "4-7",
    pollinationGroup: "N/A",
    harvestWindow: "Mid - Late August",
    flavorNotes: "Highbush blueberry; sweet, slightly tart, very reliable cropper.",
    diseaseResistanceNotes: "Disease resistant; tolerant of a range of soils.",
    originNotes: "Raised in New Jersey, USA, 1952. One of the most planted cultivars.",
    synonyms: [],
    selfFertile: true,
    diseaseRating: 5,
  },
  {
    commonName: "Brown Turkey",
    species: "Ficus carica",
    chillHours: 100,
    hardinessZone: "7-10",
    pollinationGroup: "N/A",
    harvestWindow: "August - October",
    flavorNotes: "Sweet, reliable fig; crops well outdoors in sheltered spots.",
    diseaseResistanceNotes: "Generally trouble-free.",
    originNotes: "A widely grown hardy fig of uncertain Mediterranean origin.",
    synonyms: [],
  },
  {
    commonName: "Nottingham Medlar",
    species: "Mespilus germanica",
    chillHours: 700,
    hardinessZone: "5-8",
    pollinationGroup: "N/A",
    harvestWindow: "November (bletted)",
    flavorNotes: "Sweet, date-like flavour after bletting; a fine heritage fruit.",
    diseaseResistanceNotes: "Hardy and pest-free.",
    originNotes: "A traditional English medlar of great antiquity.",
    synonyms: ["Nottingham"],
  },
  {
    commonName: "Quince Vranja",
    species: "Cydonia oblonga",
    chillHours: 500,
    hardinessZone: "5-9",
    pollinationGroup: "N/A",
    harvestWindow: "October",
    flavorNotes: "Fragrant, aromatic quince; excellent for membrillo and jelly.",
    diseaseResistanceNotes: "Vigorous and healthy.",
    originNotes: "A large-fruited quince, named after Vranja, Serbia.",
    synonyms: ["Vranja"],
  },
  {
    commonName: "Ben Sarek",
    species: "Ribes nigrum",
    chillHours: 1000,
    hardinessZone: "3-8",
    pollinationGroup: "N/A",
    harvestWindow: "July",
    flavorNotes: "Compact blackcurrant with sweet, aromatic berries.",
    diseaseResistanceNotes: "Good mildew resistance.",
    originNotes: "Scottish Crop Research Institute, 1988.",
    synonyms: [],
  },
  {
    commonName: "Hinnonmäki Röd",
    species: "Ribes uva-crispa",
    chillHours: 1000,
    hardinessZone: "3-8",
    pollinationGroup: "N/A",
    harvestWindow: "July",
    flavorNotes: "Sweet red gooseberry; excellent fresh or cooked.",
    diseaseResistanceNotes: "Good resistance to mildew.",
    originNotes: "A Finnish variety, released 1970.",
    synonyms: ["Hinnonmaki Red"],
  },
];

const rootstocks = [
  { name: "M27", species: "Malus", vigour: "Very dwarfing", dwarfingClass: "Dwarf", chillHours: 800, soilNotes: "Needs fertile soil and staking; good for pots.", diseaseResistanceNotes: "Susceptible to woolly aphid." },
  { name: "M9", species: "Malus", vigour: "Dwarfing", dwarfingClass: "Dwarf", chillHours: 800, soilNotes: "The most widely planted dwarfing stock.", diseaseResistanceNotes: "Good; some fire blight susceptibility." },
  { name: "M26", species: "Malus", vigour: "Semi-dwarfing", dwarfingClass: "Semi-dwarf", chillHours: 800, soilNotes: "Reliable; needs staking in early years.", diseaseResistanceNotes: "Good all-round." },
  { name: "MM106", species: "Malus", vigour: "Semi-vigorous", dwarfingClass: "Semi-dwarf", chillHours: 800, soilNotes: "Tolerant of a wide range of soils, including heavier clay.", diseaseResistanceNotes: "Resistant to woolly aphid." },
  { name: "MM111", species: "Malus", vigour: "Vigorous", dwarfingClass: "Standard", chillHours: 800, soilNotes: "Good for standards and poor soils.", diseaseResistanceNotes: "Very hardy." },
  { name: "M25", species: "Malus", vigour: "Very vigorous", dwarfingClass: "Standard", chillHours: 800, soilNotes: "For large traditional standards.", diseaseResistanceNotes: "Hardy; long-lived." },
  { name: "Quince A", species: "Cydonia", vigour: "Semi-vigorous", dwarfingClass: "Semi-dwarf", chillHours: 700, soilNotes: "The standard pear rootstock.", diseaseResistanceNotes: "Good." },
  { name: "Quince C", species: "Cydonia", vigour: "Dwarfing", dwarfingClass: "Dwarf", chillHours: 700, soilNotes: "Dwarfing pear stock; needs fertile soil.", diseaseResistanceNotes: "Good." },
  { name: "St. Julien A", species: "Prunus", vigour: "Semi-vigorous", dwarfingClass: "Semi-dwarf", chillHours: 700, soilNotes: "The standard plum rootstock.", diseaseResistanceNotes: "Good." },
  { name: "Gisela 5", species: "Prunus", vigour: "Dwarfing", dwarfingClass: "Dwarf", chillHours: 700, soilNotes: "Dwarfing cherry stock; needs good soil and irrigation.", diseaseResistanceNotes: "Good." },
  { name: "Colt", species: "Prunus", vigour: "Semi-vigorous", dwarfingClass: "Standard", chillHours: 700, soilNotes: "Vigorous cherry stock for poor soils.", diseaseResistanceNotes: "Hardy." },
  { name: "Hazel (Corylus colurna)", species: "Corylus", vigour: "Standard", dwarfingClass: "Standard", chillHours: 900, soilNotes: "Used as a non-suckering rootstock for filberts.", diseaseResistanceNotes: "Good." },
];

async function wipe() {
  await db.plantNote.deleteMany();
  await db.plantRecord.deleteMany();
  await db.plotElement.deleteMany();
  await db.plot.deleteMany();
  await db.notification.deleteMany();
  await db.message.deleteMany();
  await db.review.deleteMany();
  await db.transaction.deleteMany();
  await db.wantListEntry.deleteMany();
  await db.listingPhoto.deleteMany();
  await db.listing.deleteMany();
  await db.synonym.deleteMany();
  await db.variety.deleteMany();
  await db.follow.deleteMany();
  await db.savedSearch.deleteMany();
  await db.report.deleteMany();
  await db.rootstock.deleteMany();
  await db.user.deleteMany();
}

async function main() {
  console.log("Wiping existing data…");
  await wipe();

  console.log("Seeding varieties…");
  const varietyMap = new Map<string, string>();
  for (const v of varieties) {
    const created = await db.variety.create({
      data: {
        commonName: v.commonName,
        species: v.species,
        chillHours: v.chillHours,
        hardinessZone: v.hardinessZone,
        pollinationGroup: v.pollinationGroup,
        harvestWindow: v.harvestWindow,
        flavorNotes: v.flavorNotes,
        diseaseResistanceNotes: v.diseaseResistanceNotes,
        originNotes: v.originNotes,
        selfFertile: v.selfFertile ?? null,
        triploid: v.triploid ?? null,
        diseaseRating: v.diseaseRating ?? null,
        heritage: v.heritage ?? false,
        synonyms: { create: v.synonyms.map((name) => ({ name })) },
      },
    });
    varietyMap.set(v.commonName, created.id);
  }

  console.log("Seeding bulk varieties…");
  let bulkCount = 0;
  for (const b of bulkVarieties) {
    if (varietyMap.has(b.commonName)) continue;
    const created = await db.variety.create({
      data: {
        commonName: b.commonName,
        species: b.species,
        chillHours: b.chillHours ?? null,
        hardinessZone: b.hardinessZone ?? null,
        pollinationGroup: b.pollinationGroup ?? null,
        harvestWindow: b.harvestWindow ?? null,
        flavorNotes: b.flavorNotes ?? null,
        diseaseResistanceNotes: b.diseaseResistanceNotes ?? null,
        originNotes: b.originNotes ?? null,
        selfFertile: b.selfFertile ?? null,
        triploid: b.triploid ?? null,
        diseaseRating: b.diseaseRating ?? null,
        heritage: b.heritage ?? false,
        synonyms: b.synonyms?.length
          ? { create: b.synonyms.map((name) => ({ name })) }
          : undefined,
      },
    });
    varietyMap.set(b.commonName, created.id);
    bulkCount++;
  }

  console.log("Building full-text search index…");
  await db.$executeRawUnsafe(`
    CREATE VIRTUAL TABLE IF NOT EXISTS variety_fts USING fts5(
      id UNINDEXED,
      commonName,
      species,
      synonyms,
      notes,
      tokenize = 'unicode61'
    );
  `);
  await db.$executeRawUnsafe("DELETE FROM variety_fts");
  const allVarieties = await db.variety.findMany({ include: { synonyms: true } });
  for (const v of allVarieties) {
    const synonyms = v.synonyms.map((s) => s.name).join(" ");
    const notes = [
      v.harvestWindow,
      v.flavorNotes,
      v.originNotes,
      v.diseaseResistanceNotes,
    ]
      .filter(Boolean)
      .join(" ");
    await db.$executeRawUnsafe(
      "INSERT INTO variety_fts(id, commonName, species, synonyms, notes) VALUES (?, ?, ?, ?, ?)",
      v.id,
      v.commonName,
      v.species ?? "",
      synonyms,
      notes,
    );
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Seeding rootstocks…");
  for (const r of rootstocks) {
    await db.rootstock.create({ data: r });
  }

  console.log("Seeding users…");
  const demo = await db.user.create({
    data: {
      name: "Demo Nursery",
      email: "demo@example.com",
      passwordHash,
      location: "South Wales, UK",
      bio: "Small independent nursery growing apples, pears, cobnuts and soft fruit. All scion wood cut to order during dormancy.",
      isVerifiedNursery: true,
      yearsActive: 8,
    },
  });

  const buyer = await db.user.create({
    data: {
      name: "Ruth Orchard",
      email: "ruth@example.com",
      passwordHash,
      location: "Herefordshire, UK",
      bio: "Backyard fruit enthusiast restoring an old mixed orchard.",
      isVerifiedNursery: false,
      yearsActive: 4,
    },
  });

  await db.user.create({
    data: {
      name: "Site Admin",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
      location: "UK",
      bio: "Site administrator.",
    },
  });

  console.log("Seeding listings…");
  const ashmeads = varietyMap.get("Ashmead's Kernel")!;
  const kentishCob = varietyMap.get("Kentish Cob")!;
  const cox = varietyMap.get("Cox's Orange Pippin")!;
  const discovery = varietyMap.get("Discovery")!;
  const williams = varietyMap.get("Williams' Bon Chrétien")!;
  const stella = varietyMap.get("Stella")!;
  const farleigh = varietyMap.get("Farleigh Damson")!;
  const bluecrop = varietyMap.get("Bluecrop")!;

  const listingData: Prisma.ListingUncheckedCreateInput[] = [
    {
      userId: demo.id,
      varietyId: ashmeads,
      type: "SCION_WOOD",
      quantity: 20,
      pricePence: 250,
      tradeOnly: false,
      availabilityStart: new Date("2026-12-01"),
      availabilityEnd: new Date("2027-03-01"),
      location: "South Wales, UK",
      description: "Healthy one-year scion wood, cut to order during dormancy.",
    },
    {
      userId: demo.id,
      varietyId: kentishCob,
      type: "HARDWOOD_CUTTING",
      quantity: 10,
      pricePence: null,
      tradeOnly: true,
      availabilityStart: new Date("2026-11-15"),
      availabilityEnd: new Date("2027-02-15"),
      location: "South Wales, UK",
      description: "Surplus cobnut hardwood cuttings. Trade for interesting pears or plums.",
    },
    {
      userId: demo.id,
      varietyId: cox,
      type: "SCION_WOOD",
      quantity: 30,
      pricePence: 300,
      tradeOnly: false,
      availabilityStart: new Date("2026-12-15"),
      availabilityEnd: new Date("2027-03-15"),
      location: "South Wales, UK",
      description: "Dormant Cox's Orange Pippin scions from a healthy, productive tree.",
    },
    {
      userId: demo.id,
      varietyId: discovery,
      type: "POTTED_TREE",
      quantity: 5,
      pricePence: 2500,
      tradeOnly: false,
      availabilityStart: new Date("2026-11-01"),
      availabilityEnd: new Date("2027-04-01"),
      location: "South Wales, UK",
      description: "One-year maiden Discovery on MM106 rootstock, in 3L pots.",
    },
    {
      userId: buyer.id,
      varietyId: williams,
      type: "ROOTSTOCK",
      quantity: 15,
      pricePence: 180,
      tradeOnly: false,
      availabilityStart: null,
      availabilityEnd: null,
      location: "Herefordshire, UK",
      description: "Surplus quince C rootstocks, healthy and ready to bud.",
    },
    {
      userId: buyer.id,
      varietyId: stella,
      type: "SCION_WOOD",
      quantity: 12,
      pricePence: null,
      tradeOnly: true,
      availabilityStart: new Date("2027-01-01"),
      availabilityEnd: new Date("2027-03-01"),
      location: "Herefordshire, UK",
      description: "Stella cherry scions, trade for damson or gage wood.",
    },
    {
      userId: demo.id,
      varietyId: farleigh,
      type: "SEED",
      quantity: 50,
      pricePence: 400,
      tradeOnly: false,
      availabilityStart: null,
      availabilityEnd: null,
      location: "South Wales, UK",
      description: "Stratified damson stones, germination-tested.",
    },
    {
      userId: demo.id,
      varietyId: bluecrop,
      type: "ROOTED_CUTTING",
      quantity: 25,
      pricePence: 600,
      tradeOnly: false,
      availabilityStart: new Date("2027-02-01"),
      availabilityEnd: new Date("2027-05-01"),
      location: "South Wales, UK",
      description: "Rooted hardwood blueberry cuttings, one season old.",
    },
  ];

  for (const l of listingData) {
    await db.listing.create({ data: l });
  }

  const coxListing = await db.listing.findFirstOrThrow({
    where: { varietyId: cox, userId: demo.id },
  });
  const kentishListing = await db.listing.findFirstOrThrow({
    where: { varietyId: kentishCob, userId: demo.id },
  });

  console.log("Seeding want list, records and plot…");
  await db.wantListEntry.create({
    data: {
      userId: buyer.id,
      varietyId: kentishCob,
      notes: "Looking for 3 hardwood cuttings.",
    },
  });

  await db.follow.create({
    data: { followerId: buyer.id, followingId: demo.id },
  });

  await db.plantRecord.create({
    data: {
      userId: demo.id,
      varietyId: ashmeads,
      rootstock: "MM106",
      rootstockSource: "Own nursery bed",
      scionSource: "Original mother tree, planted 2010",
      graftDate: new Date("2026-03-10"),
      location: "North field, row 2",
      status: "FOR_SALE",
      notes: "Bench grafts, looking strong.",
      plantNotes: {
        create: [
          { kind: "HEALTH", note: "Bud break observed", amount: null },
          { kind: "YIELD", note: "First scion harvest", amount: 20 },
        ],
      },
    },
  });

  await db.plot.create({
    data: {
      userId: demo.id,
      name: "My orchard",
      elements: {
        create: [
          { type: "TREE", x: 10, y: 10, width: 3, height: 3, rotation: 0, label: "Cox", varietyId: cox, rootstock: "MM106" },
          { type: "TREE", x: 20, y: 10, width: 3, height: 3, rotation: 0, label: "Ashmead's", varietyId: ashmeads, rootstock: "MM106" },
          { type: "FENCE", x: 0, y: 0, width: 40, height: 1, rotation: 0, label: "North fence" },
        ],
      },
    },
  });

  console.log("Seeding transactions and reviews…");
  const completedTx = await db.transaction.create({
    data: {
      listingId: coxListing.id,
      buyerId: buyer.id,
      sellerId: demo.id,
      status: "COMPLETED",
      amountPence: 300,
    },
  });

  await db.transaction.create({
    data: {
      listingId: kentishListing.id,
      buyerId: buyer.id,
      sellerId: demo.id,
      status: "PROPOSED",
      amountPence: null,
    },
  });

  await db.review.create({
    data: {
      transactionId: completedTx.id,
      reviewerId: buyer.id,
      revieweeId: demo.id,
      rating: 5,
      comment: "Excellent scion wood, well packaged and labelled. Grafted well.",
    },
  });

  console.log("Seeding messages…");
  await db.message.createMany({
    data: [
      {
        senderId: buyer.id,
        recipientId: demo.id,
        listingId: kentishListing.id,
        body: "Hi! Do you still have the Kentish Cob cuttings for trade?",
        read: false,
      },
      {
        senderId: demo.id,
        recipientId: buyer.id,
        listingId: kentishListing.id,
        body: "Yes, plenty left. What do you have to offer?",
        read: true,
      },
      {
        senderId: buyer.id,
        recipientId: demo.id,
        listingId: kentishListing.id,
        body: "I have Stella cherry scions if that interests you.",
        read: true,
      },
    ],
  });

  console.log(
    `Seeded ${varieties.length + bulkCount} varieties, 3 users (demo@example.com, ruth@example.com, admin@example.com — password123), 8 listings, 1 plot, records, transactions and messages.`,
  );
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
