import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const varieties = [
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
    synonyms: [{ name: "Ashmeads Kernel" }, { name: "Ashmead's Kernel" }],
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
    synonyms: [{ name: "Bramley" }, { name: "Bramley's Seedling Apple" }],
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
    synonyms: [{ name: "Egremont" }],
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
    synonyms: [{ name: "Lambert's Filbert" }, { name: "Kent Cob" }],
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
  },
];

async function main() {
  for (const v of varieties) {
    await db.variety.create({
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
        synonyms: { create: v.synonyms },
      },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const demo = await db.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo Nursery",
      email: "demo@example.com",
      passwordHash,
      location: "South Wales, UK",
      bio: "Small independent nursery growing apples, pears, cobnuts and blueberries.",
      isVerifiedNursery: true,
      yearsActive: 8,
    },
  });

  const ashmeads = await db.variety.findFirstOrThrow({
    where: { commonName: "Ashmead's Kernel" },
  });
  const kentishCob = await db.variety.findFirstOrThrow({
    where: { commonName: "Kentish Cob" },
  });

  await db.listing.createMany({
    data: [
      {
        userId: demo.id,
        varietyId: ashmeads.id,
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
        varietyId: kentishCob.id,
        type: "HARDWOOD_CUTTING",
        quantity: 10,
        pricePence: null,
        tradeOnly: true,
        availabilityStart: new Date("2026-11-15"),
        availabilityEnd: new Date("2027-02-15"),
        location: "South Wales, UK",
        description: "Surplus cobnut hardwood cuttings. Trade for interesting pears or plums.",
      },
    ],
  });

  console.log("Seeded 8 varieties, 1 demo user, 2 listings.");
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
