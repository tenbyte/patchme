import { PrismaClient } from "../lib/generated/prisma";
import { 
  users, 
  demoTags, 
  demoBaselines, 
  demoSystems, 
  demoActivity, 
  demoSystemBaselineValues 
} from "./demodata";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        },
      });
    }
    console.log("Users have been created");
  } else {
    console.log("User table already contains data. Skipping user seed.");
  }

  const tagCount = await prisma.tag.count();
  if (tagCount === 0) {
    for (const tag of demoTags) {
      await prisma.tag.create({ data: { id: tag.id, name: tag.name } });
    }
    console.log("Demo tags have been created");
  } else {
    console.log("Tag table already contains data. Skipping tag seed.");
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
    console.log("Demo baselines have been created");
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
    console.log("Demo systems have been created");
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
    console.log("Demo activity logs have been created");
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
    console.log("Demo system baseline values have been created");
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