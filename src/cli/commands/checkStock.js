import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import inquirer from 'inquirer';

import { makeCheckStockUseCase } from '../../usecases/retail/checkStock.js';
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js';

const checkStockUseCase = makeCheckStockUseCase({ inventoryRepository });

export default async function checkStockCommand(user) {
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '🔍 Consulter le stock :',
      choices: [
        { name: '📦 Stock du magasin local', value: 'local' },
        { name: '🏢 Stock du centre logistique', value: 'logistic' }
      ]
    }
  ]);

  const spinner = ora('📦 Chargement du stock...').start();

  try {
    const inventory = mode === 'local'
      ? await checkStockUseCase.getInventoryByStore(user.storeId)
      : await checkStockUseCase.getInventoryFromLogisticCenter();

    spinner.stop();

    if (!inventory.length) {
      console.log(chalk.yellow('❗ Aucun produit trouvé.'));
      return;
    }

    const table = new Table({
      head: [
        chalk.cyan('Produit'),
        chalk.cyan('Catégorie'),
        chalk.cyan('Prix'),
        chalk.cyan('Stock')
      ],
      style: { head: [], border: [] }
    });

    for (const item of inventory) {
      const product = item.Product;
      table.push([
        product.name,
        product.category,
        product.price.toFixed(2) + ' $',
        item.stock
      ]);
    }

    const label = mode === 'local' ? `Magasin #${user.storeId}` : 'Centre logistique';
    console.log(chalk.green.bold(`
🛒 Stock – ${label} – ${inventory.length} produits
`));
    console.log(table.toString());
  } catch (err) {
    spinner.fail('❌ Erreur lors de la consultation du stock.');
    console.error(chalk.red(err.message));
  }
}
