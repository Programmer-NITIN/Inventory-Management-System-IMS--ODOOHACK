const app = require('./src/app');
const env = require('./src/config/env');
const pool = require('./src/config/db');

async function start() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 CoreInventory API running on port ${env.PORT}`);
      console.log(`   Health: http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
