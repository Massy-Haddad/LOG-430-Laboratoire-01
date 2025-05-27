import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { getSalesByUser, cancelSale } from '../../usecases/returnSale.js';

export default async function returnSaleCommand(currentUser) {
  const spinner = ora('🔁 Chargement des ventes...').start();

  try {
    const sales = await getSalesByUser(currentUser.id);
    spinner.stop();

    if (sales.length === 0) {
      console.log(chalk.yellow('⚠️  Aucune vente à afficher.'));
      return;
    }

    const { selectedSaleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedSaleId',
        message: '🔁 Sélectionnez la vente à annuler :',
        choices: sales.map(sale => ({
          name: `${sale.product.name} x${sale.quantity} - ${sale.total.toFixed(2)}$ (${new Date(sale.date).toLocaleString()})`,
          value: sale.id
        }))
      }
    ]);

    const spinnerReturn = ora('📦 Traitement du retour...').start();

    await cancelSale(selectedSaleId);

    spinnerReturn.stop();
    console.log(chalk.green('✅ Retour traité avec succès. Stock mis à jour.'));
  } catch (error) {
    spinner.stop();
    console.error(chalk.red(`❌ Erreur : ${error.message}`));
  }
}
