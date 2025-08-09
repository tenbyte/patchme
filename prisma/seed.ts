import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo-Daten direkt im Seed-Skript definiert
const users = [
  { id: "1", name: "Admin", email: "admin@example.com", password: "admin", role: "admin" },
  { id: "2", name: "User", email: "user@example.com", password: "user", role: "user" },
];

const demoTags = [
  { id: "t1", name: "Tag 1" },
  { id: "t2", name: "Tag 2" },
];

const demoBaselines = [
  { id: "b1", name: "Baseline 1", variable: "PHP", minVersion: "8.1" },
  { id: "b2", name: "Baseline 2", variable: "Node", minVersion: "18" },
];

const demoSystems = [
  { id: "s1", name: "System 1", hostname: "srv01", apiKey: "key1", lastSeen: null, tags: ["t1"], baselines: ["b1"] },
  { id: "s2", name: "System 2", hostname: "srv02", apiKey: "key2", lastSeen: null, tags: ["t2"], baselines: ["b2"] },
];

const demoActivity = [
  { systemId: "s1", createdAt: new Date().toISOString(), meta: { foo: "bar" } },
  { systemId: "s2", createdAt: new Date().toISOString(), meta: { foo: "baz" } },
];

const demoSystemBaselineValues = [
  { systemId: "s1", baselineId: "b1", value: "8.1" },
  { systemId: "s2", baselineId: "b2", value: "18" },
];

async function main() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        },
      });
    }
    console.log("Benutzer wurden erstellt");
  } else {
    console.log("Benutzertabelle enthält bereits Daten. Überspringe User-Seed.");
  }

  const tagCount = await prisma.tag.count();
  if (tagCount === 0) {
    for (const tag of demoTags) {
      await prisma.tag.create({ data: { id: tag.id, name: tag.name } });
    }
    console.log("Demo-Tags wurden erstellt");
  } else {
    console.log("Tag-Tabelle enthält bereits Daten. Überspringe Tag-Seed.");
  }

  const baselineCount = await prisma.baseline.count();
  if (baselineCount === 0) {
    for (const baseline of demoBaselines) {
      await prisma.baseline.create({
        data: {
          id: baseline.id,
          name: baseline.name,
          variable: baseline.variable,
          minVersion: baseline.minVersion,
        },
      });
    }
    console.log("Demo-Baselines wurden erstellt");
  }

  const systemCount = await prisma.system.count();
  if (systemCount === 0) {
    for (const system of demoSystems) {
      await prisma.system.create({
        data: {
          id: system.id,
          name: system.name,
          hostname: system.hostname,
          apiKey: system.apiKey,
          lastSeen: system.lastSeen ? new Date(system.lastSeen) : null,
          tags: {
            connect: system.tags.map(id => ({ id })),
          },
          baselines: {
            connect: system.baselines.map(id => ({ id })),
          },
        },
      });
    }
    console.log("Demo-Systeme wurden erstellt");
  }

  const activityCount = await prisma.activityLog.count();
  if (activityCount === 0 && typeof demoActivity !== "undefined") {
    for (const activity of demoActivity) {
      await prisma.activityLog.create({
        data: {
          systemId: activity.systemId,
          action: "demo",
          createdAt: new Date(activity.createdAt),
          meta: JSON.stringify(activity.meta),
        },
      });
    }
    console.log("Demo-Aktivitätsprotokolle wurden erstellt");
  }

  const systemBaselineValueCount = await prisma.systemBaselineValue.count();
  if (systemBaselineValueCount === 0 && typeof demoSystemBaselineValues !== "undefined"
  ) {
    for (const systemBaselineValue of demoSystemBaselineValues) {
      await prisma.systemBaselineValue.create({
        data: {
          system: { connect: { id: systemBaselineValue.systemId } },
          baseline: { connect: { id: systemBaselineValue.baselineId } },
          value: systemBaselineValue.value,
        },
      });
    }
    console.log("Demo-System-Baseline-Werte wurden erstellt");
  }

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });