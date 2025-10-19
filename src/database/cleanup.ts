import { pool } from './connection';

async function cleanupOrders() {
  try {
    console.log('🧹 Cleaning up all packages and package history...');

    const [[{ count: historyBefore }]]: any = await pool.query('SELECT COUNT(*) as count FROM package_history');
    const [[{ count: packagesBefore }]]: any = await pool.query('SELECT COUNT(*) as count FROM packages');

    await pool.execute('DELETE FROM package_history');
    await pool.execute('DELETE FROM packages');

    const [[{ count: historyAfter }]]: any = await pool.query('SELECT COUNT(*) as count FROM package_history');
    const [[{ count: packagesAfter }]]: any = await pool.query('SELECT COUNT(*) as count FROM packages');

    console.log(`✅ Deleted package_history: ${historyBefore - historyAfter}`);
    console.log(`✅ Deleted packages: ${packagesBefore - packagesAfter}`);
    console.log('🎉 Cleanup complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

cleanupOrders();


