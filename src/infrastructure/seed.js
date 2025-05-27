import bcrypt from 'bcrypt';
import chalk from 'chalk';

import { sequelize } from './database.js';
import { ProductModel, UserModel, SaleModel } from './models/index.js';

export async function seedUsers() {
  const hash = await bcrypt.hash('password', 10);

  await UserModel.findOrCreate({
    where: { username: 'admin' },
    defaults: { password: hash }
  });

  console.log(chalk.green('✅ Utilisateur admin créé (admin / password)'));
}

export async function seedProducts() {
await ProductModel.bulkCreate([
  // 🍎 Fruits
  { name: 'Pomme', category: 'Fruits', price: 1.2, stock: 100 },
  { name: 'Banane', category: 'Fruits', price: 1.5, stock: 80 },
  { name: 'Orange', category: 'Fruits', price: 1.3, stock: 90 },

  // 🥛 Produits laitiers
  { name: 'Lait', category: 'Produits laitiers', price: 2.5, stock: 50 },
  { name: 'Oeufs', category: 'Produits laitiers', price: 3.0, stock: 60 },
  { name: 'Fromage', category: 'Produits laitiers', price: 4.0, stock: 40 },

  // 🍞 Boulangerie
  { name: 'Pain', category: 'Boulangerie', price: 1.0, stock: 200 },
  { name: 'Croissant', category: 'Boulangerie', price: 1.8, stock: 120 },
  { name: 'Baguette', category: 'Boulangerie', price: 1.2, stock: 180 },

  // 🍖 Viandes
  { name: 'Poulet', category: 'Viandes', price: 5.0, stock: 30 },
  { name: 'Bœuf', category: 'Viandes', price: 6.5, stock: 25 },
  { name: 'Jambon', category: 'Viandes', price: 4.8, stock: 40 },

  // 🥕 Légumes
  { name: 'Tomate', category: 'Légumes', price: 2.0, stock: 90 },
  { name: 'Carotte', category: 'Légumes', price: 1.8, stock: 120 },
  { name: 'Concombre', category: 'Légumes', price: 1.6, stock: 100 },

  // 🥤 Boissons
  { name: 'Jus d’orange', category: 'Boissons', price: 3.5, stock: 70 },
  { name: 'Eau minérale', category: 'Boissons', price: 1.0, stock: 150 },
  { name: 'Limonade', category: 'Boissons', price: 2.2, stock: 90 },

  // 🥣 Petit-déjeuner
  { name: 'Céréales', category: 'Petit-déjeuner', price: 2.8, stock: 110 },
  { name: 'Tartine', category: 'Petit-déjeuner', price: 2.0, stock: 100 },
  { name: 'Yaourt', category: 'Petit-déjeuner', price: 2.5, stock: 80 },

  // 🛒 Épicerie
  { name: 'Pâtes', category: 'Épicerie', price: 1.7, stock: 150 },
  { name: 'Riz', category: 'Épicerie', price: 1.9, stock: 130 },
  { name: 'Haricots', category: 'Épicerie', price: 2.2, stock: 100 },

  // 🐟 Poissons
  { name: 'Saumon', category: 'Poissons', price: 8.0, stock: 20 },
  { name: 'Thon', category: 'Poissons', price: 7.0, stock: 30 },
  { name: 'Morue', category: 'Poissons', price: 6.5, stock: 25 }
], { ignoreDuplicates: true });

  console.log(chalk.green('✅ Produits ajoutés.'));
}

async function seedSales() {
  const admin = await UserModel.findOne({ where: { username: 'admin' } });
  const pomme = await ProductModel.findOne({ where: { name: 'Pomme' } });
  const lait = await ProductModel.findOne({ where: { name: 'Lait' } });

  if (!admin || !pomme || !lait) {
    console.log(chalk.red('❌ Utilisateur ou produits manquants pour le seed des ventes.'));
    return;
  }

  await SaleModel.bulkCreate([
    {
      userId: admin.id,
      productId: pomme.id,
      quantity: 3,
      total: 3 * pomme.price,
      date: new Date()
    },
    {
      userId: admin.id,
      productId: lait.id,
      quantity: 1,
      total: 1 * lait.price,
      date: new Date()
    }
  ]);

  pomme.stock -= 3;
  lait.stock -= 1;
  await pomme.save();
  await lait.save();

  console.log(chalk.green('✅ Ventes de test enregistrées.'));
}

export async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log(chalk.green('✅ Connexion PostgreSQL réussie !'));

    await sequelize.sync({ force: false });
    console.log(chalk.green('✅ Modèles synchronisés avec la base PostgreSQL'));

    await seedUsers();
    await seedProducts();
    await seedSales();

    process.exit(0);
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors du seed : ${error.message}`));
    process.exit(1);
  }
}

// Si ce fichier est exécuté directement
if (process.argv[1].endsWith('seed.js')) {
  await seedDatabase();
}
