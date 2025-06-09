import bcrypt from 'bcrypt';
import chalk from 'chalk';

import { sequelize } from './database.js'
import {
	ProductModel,
	UserModel,
	SaleModel,
	StoreModel,
} from './postgres/models/index.js'

async function seedStores() {
	await StoreModel.bulkCreate(
		[
			{ id: 1, name: 'Magasin Centre-Ville', address: '123 rue Principale' },
			{ id: 2, name: 'Magasin Quartier-Nord', address: '456 avenue du Nord' },
			{ id: 3, name: 'Magasin Quartier-Sud', address: '789 boulevard Sud' },
		],
		{ ignoreDuplicates: true }
	)

	console.log(chalk.green('✅ Magasins ajoutés.'))
}

async function seedUsers() {
	const hash = await bcrypt.hash('password', 10)

	await UserModel.findOrCreate({
		where: { username: 'admin' },
		defaults: {
			password: hash,
			role: 'admin',
		},
	})

	await UserModel.findOrCreate({
		where: { username: 'caissier1' },
		defaults: {
			password: hash,
			role: 'employee',
			storeId: 1,
		},
	})

	await UserModel.findOrCreate({
		where: { username: 'caissier2' },
		defaults: {
			password: hash,
			role: 'employee',
			storeId: 2,
		},
	})

	await UserModel.findOrCreate({
		where: { username: 'logistics' },
		defaults: {
			password: hash,
			role: 'logistics',
		},
	})

	await UserModel.findOrCreate({
		where: { username: 'analyst' },
		defaults: {
			password: hash,
			role: 'analyst',
		},
	})

	console.log(
		chalk.green(
			'✅ Utilisateurs créés (admin, caissier1, caissier2, logistics, analyst).'
		)
	)
}

async function seedProducts() {
	await ProductModel.bulkCreate(
		[
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
			{ name: 'Morue', category: 'Poissons', price: 6.5, stock: 25 },
		],
		{ ignoreDuplicates: true }
	)

	console.log(chalk.green('✅ Produits ajoutés.'))
}

async function seedSales() {
	const [caissier1, caissier2] = await Promise.all([
		UserModel.findOne({ where: { username: 'caissier1' } }),
		UserModel.findOne({ where: { username: 'caissier2' } }),
	])

	const pomme = await ProductModel.findOne({ where: { name: 'Pomme' } })
	const lait = await ProductModel.findOne({ where: { name: 'Lait' } })
	const pain = await ProductModel.findOne({ where: { name: 'Pain' } })

	if (!caissier1 || !caissier2 || !pomme || !lait || !pain) {
		console.log(chalk.red('❌ Données manquantes pour générer les ventes.'))
		return
	}

	const today = new Date('2025-06-09')

	await SaleModel.bulkCreate([
		{
			userId: caissier1.id,
			productId: pomme.id,
			quantity: 4,
			total: 4 * pomme.price,
			storeId: 1,
			date: today,
		},
		{
			userId: caissier1.id,
			productId: lait.id,
			quantity: 2,
			total: 2 * lait.price,
			storeId: 1,
			date: today,
		},
		{
			userId: caissier2.id,
			productId: pain.id,
			quantity: 5,
			total: 5 * pain.price,
			storeId: 2,
			date: today,
		},
	])

	pomme.stock -= 4
	lait.stock -= 2
	pain.stock -= 5
	await Promise.all([pomme.save(), lait.save(), pain.save()])

	console.log(chalk.green('✅ Ventes enregistrées pour UC1-UC3.'))
}

export async function seedDatabase() {
	try {
		await sequelize.authenticate()
		console.log(chalk.green('✅ Connexion PostgreSQL réussie !'))

		await sequelize.sync({ force: false })
		console.log(chalk.green('✅ Modèles synchronisés avec la base PostgreSQL'))

		await seedStores()
		await seedUsers()
		await seedProducts()
		await seedSales()

		process.exit(0)
	} catch (error) {
		console.error(chalk.red(`❌ Erreur lors du seed : ${error.message}`))
		process.exit(1)
	}
}

if (process.argv[1].endsWith('seed.js')) {
  await seedDatabase();
}
