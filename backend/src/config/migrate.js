const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files.`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ Executed: ${file}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`, err.message);
      process.exit(1);
    }
  }

  console.log('All migrations executed successfully.');
  await pool.end();
  process.exit(0);
}

runMigrations();
