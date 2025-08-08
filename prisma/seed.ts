import { PrismaClient } from "../lib/generated/prisma";
import { users } from "../lib/data";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function isDatabaseEmpty() {
  const userCount = await prisma.user.count();
  return userCount === 0;
}

async function main() {
  const isEmpty = await isDatabaseEmpty();
  if (!isEmpty) {
    console.log("Datenbank enthält bereits Daten. Überspringe Seed-Prozess.");
    return;
  }
  console.log("Datenbank ist leer. Starte Seed-Prozess...");
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