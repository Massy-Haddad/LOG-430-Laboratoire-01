import figlet from 'figlet';
import chalk from 'chalk';
import loginPrompt from './loginPrompt.js';
import menuPrompt from './menuPrompt.js';

console.clear();
console.log(chalk.cyan(figlet.textSync('POS App', { horizontalLayout: 'full' })));

try {
  const user = await loginPrompt();
  console.log(chalk.green(`\n✅ Bienvenue, ${user.username} !\n`));
  await menuPrompt(user);
} catch (err) {
  console.error(chalk.red(`❌ ${err.message}`));
  process.exit(1);
}
