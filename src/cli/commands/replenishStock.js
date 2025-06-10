import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { makeReplenishStockUseCase } from '../../usecases/retail/replenishStock.js';
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js';

const replenishStockUseCase = makeReplenishStockUseCase({ inventoryRepository });

export default async function replenishStockCommand(user) {
  try {
    const lowStock = await replenishStockUseCase.getLocalStockBelowThreshold(user.storeId, 50);

    if (lowStock.length === 0) {
      console.log(chalk.green('✅ Tous les produits ont un stock suffisant (supérieur à 50).'));
      return;
    }

    const { selectedId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedId',
        message: '📦 Sélectionnez un produit à réapprovisionner :',
        choices: lowStock.map(item => ({
          name: `${item.Product.name} [Stock local: ${item.stock}]`,
          value: item.Product.id
        }))
      }
    ]);

    const centerStock = await replenishStockUseCase.getLogisticStockForProduct(selectedId);
    if (!centerStock || centerStock.stock <= 0) {
      console.log(chalk.red('❌ Ce produit est épuisé au centre logistique.'));
      return;
    }

    const { quantity } = await inquirer.prompt([
      {
        type: 'number',
        name: 'quantity',
        message: `📥 Combien d'unités transférer ? (Disponible au centre : ${centerStock.stock})`,
        validate: (input) => input > 0 && input <= centerStock.stock
      }
    ]);

    const spinner = ora('🔄 Réapprovisionnement en cours...').start();
    await replenishStockUseCase.transferFromLogisticCenter(user.storeId, selectedId, quantity);
    spinner.succeed('✅ Réapprovisionnement terminé.');
  } catch (error) {
    console.error(chalk.red(`❌ Erreur : ${error.message}`));
  }
}
