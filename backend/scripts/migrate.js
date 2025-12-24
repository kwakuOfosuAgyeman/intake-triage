import { initDatabase } from '../src/config/db.js';

console.log('Running database migrations...');
initDatabase();
console.log('Migrations complete!');
process.exit(0);