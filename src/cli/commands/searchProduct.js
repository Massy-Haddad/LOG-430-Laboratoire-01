import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { searchProduct } from '../../usecases/searchProduct.js';

export default async function searchProductCommand() {
  const { searchType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'searchType',
      message: '🔍 Rechercher un produit par :',
      choices: ['ID', 'Nom', 'Catégorie']
    }
  ]);

  const { keyword } = await inquirer.prompt([
    {
      type: 'input',
      name: 'keyword',
      message: `🔎 Entrez le ${searchType.toLowerCase()} à rechercher :`,
      validate: input => input.trim() !== '' || 'Ce champ ne peut pas être vide.'
    }
  ]);

  const spinner = ora('Recherche en cours...').start();

  try {
    const products = await searchProduct(keyword.trim(), searchType.toLowerCase());
    spinner.stop();

    if (products.length === 0) {
      console.log(chalk.red('❌ Aucun produit trouvé.'));
      return;
    }

    const table = new Table({
      head: ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock'],
      colWidths: [6, 20, 20, 10, 10]
    });

    products.forEach(p => {
      table.push([p.id, p.name, p.category, `${p.price.toFixed(2)} $`, p.stock]);
    });

    console.log(chalk.green(`\n✅ ${products.length} produit(s) trouvé(s) :`));
    console.log(table.toString());
    console.log("\n")
  } catch (error) {
    spinner.stop();
    console.error(chalk.red(`❌ Erreur : ${error.message}`));
  }
}
