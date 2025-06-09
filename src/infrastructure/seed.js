import bcrypt from 'bcrypt';
import chalk from 'chalk';
import { sequelize } from './database.js'
import {
	ProductModel,
	UserModel,
	SaleModel,
	StoreModel,
	InventoryModel,
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
		defaults: { password: hash, role: 'admin' },
	})
	await UserModel.findOrCreate({
		where: { username: 'caissier1' },
		defaults: { password: hash, role: 'employee', storeId: 1 },
	})
	await UserModel.findOrCreate({
		where: { username: 'caissier2' },
		defaults: { password: hash, role: 'employee', storeId: 2 },
	})
	await UserModel.findOrCreate({
		where: { username: 'logistics' },
		defaults: { password: hash, role: 'logistics' },
	})
	await UserModel.findOrCreate({
		where: { username: 'analyst' },
		defaults: { password: hash, role: 'analyst' },
	})

  console.log(chalk.green('✅ Utilisateurs créés.'))
}

async function seedProducts() {
	const products = [
		{ name: 'Pomme', category: 'Fruits', price: 1.2 },
		{ name: 'Banane', category: 'Fruits', price: 1.5 },
		{ name: 'Orange', category: 'Fruits', price: 1.3 },
		{ name: 'Lait', category: 'Produits laitiers', price: 2.5 },
		{ name: 'Oeufs', category: 'Produits laitiers', price: 3.0 },
		{ name: 'Fromage', category: 'Produits laitiers', price: 4.0 },
		{ name: 'Pain', category: 'Boulangerie', price: 1.0 },
		{ name: 'Croissant', category: 'Boulangerie', price: 1.8 },
		{ name: 'Baguette', category: 'Boulangerie', price: 1.2 },
		{ name: 'Poulet', category: 'Viandes', price: 5.0 },
		{ name: 'Bœuf', category: 'Viandes', price: 6.5 },
		{ name: 'Jambon', category: 'Viandes', price: 4.8 },
	]

	for (const prod of products) {
		await ProductModel.findOrCreate({
			where: { name: prod.name },
			defaults: prod,
		})
	}

	console.log(chalk.green('✅ Produits ajoutés.'))
}

async function seedInventory() {
	const stores = await StoreModel.findAll()
	const products = await ProductModel.findAll()

	for (const store of stores) {
		for (const product of products) {
			await InventoryModel.findOrCreate({
				where: { storeId: store.id, productId: product.id },
				defaults: { stock: 100 },
			})
		}
	}

	console.log(chalk.green('✅ Stock initial assigné par magasin.'))
}

async function seedSales() {
  const caissier1 = await UserModel.findOne({
		where: { username: 'caissier1' },
	})
	const caissier2 = await UserModel.findOne({
		where: { username: 'caissier2' },
	})
	const lait = await ProductModel.findOne({ where: { name: 'Lait' } })
	const pain = await ProductModel.findOne({ where: { name: 'Pain' } })

  const today = new Date('2025-06-09')

  await SaleModel.bulkCreate([
		{
			userId: caissier1.id,
			storeId: caissier1.storeId,
			productId: lait.id,
			quantity: 2,
			total: 2 * lait.price,
			date: today,
		},
		{
			userId: caissier2.id,
			storeId: caissier2.storeId,
			productId: pain.id,
			quantity: 5,
			total: 5 * pain.price,
			date: today,
		},
	])

	const inv1 = await InventoryModel.findOne({
		where: { storeId: caissier1.storeId, productId: lait.id },
	})
	const inv2 = await InventoryModel.findOne({
		where: { storeId: caissier2.storeId, productId: pain.id },
	})

  if (inv1) {
		inv1.stock -= 2
		await inv1.save()
	}
	if (inv2) {
		inv2.stock -= 5
		await inv2.save()
	}

  console.log(chalk.green('✅ Ventes de test enregistrées.'))
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
		await seedInventory()
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
