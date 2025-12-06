import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const email = 'oyo150589@gmail.com';

  console.log('🔍 Vérification de la connexion à la base de données...');

  // Vérifier la connexion
  try {
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  }

  // Vérifier les emails existants
  console.log('\n📋 Emails autorisés actuels:');
  const existingEmails = await prisma.authorizedEmail.findMany();
  console.log(existingEmails);

  // Vérifier si l'email existe déjà
  const existing = await prisma.authorizedEmail.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`\n✅ L'email ${email} est déjà autorisé`);
  } else {
    console.log(`\n➕ Ajout de ${email} aux emails autorisés...`);
    const created = await prisma.authorizedEmail.create({
      data: { email },
    });
    console.log('✅ Email ajouté:', created);
  }

  // Vérifier à nouveau
  console.log('\n📋 Emails autorisés après modification:');
  const allEmails = await prisma.authorizedEmail.findMany();
  console.log(allEmails);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
