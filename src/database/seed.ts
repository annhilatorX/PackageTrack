import { pool } from './connection';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  try {
    console.log('🔄 Seeding database with sample data...');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create sample users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@cloudtrack.com',
        password: adminPassword,
        name: 'Amit Sharma',
        role: 'admin',
        phone: '+91 98765 43210'
      },
      {
        id: uuidv4(),
        email: 'customer@example.com',
        password: hashedPassword,
        name: 'Priya Patel',
        role: 'customer',
        phone: '+91 98765 43211'
      },
      {
        id: uuidv4(),
        email: 'delivery@cloudtrack.com',
        password: hashedPassword,
        name: 'Ravi Singh',
        role: 'delivery_staff',
        phone: '+91 98765 43212'
      }
    ];

    for (const user of users) {
      await pool.execute(
        `INSERT IGNORE INTO users (id, email, password, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, user.email, user.password, user.name, user.role, user.phone]
      );
    }

    console.log('✅ Users created');
    console.log('ℹ️ Skipping sample packages and history seeding as requested.');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Sample accounts:');
    console.log('Admin: admin@cloudtrack.com / admin123');
    console.log('Customer: customer@example.com / password123');
    console.log('Delivery Staff: delivery@cloudtrack.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}
