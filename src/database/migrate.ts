import { pool } from './connection';

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('customer', 'delivery_staff', 'admin') NOT NULL DEFAULT 'customer',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create packages table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id VARCHAR(36) PRIMARY KEY,
        tracking_number VARCHAR(50) UNIQUE NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_address TEXT NOT NULL,
        receiver_name VARCHAR(255) NOT NULL,
        receiver_address TEXT NOT NULL,
        receiver_phone VARCHAR(20) NOT NULL,
        status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed') NOT NULL DEFAULT 'pending',
        current_location VARCHAR(255),
        estimated_delivery TIMESTAMP NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        delivery_staff_id VARCHAR(36),
        customer_id VARCHAR(36) NOT NULL,
        FOREIGN KEY (delivery_staff_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create package_history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package_history (
        id VARCHAR(36) PRIMARY KEY,
        package_id VARCHAR(36) NOT NULL,
        status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed') NOT NULL,
        location VARCHAR(255) NOT NULL,
        notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(36) NOT NULL,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    try {
      await pool.execute(`CREATE INDEX idx_packages_tracking_number ON packages(tracking_number)`);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await pool.execute(`CREATE INDEX idx_packages_customer_id ON packages(customer_id)`);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await pool.execute(`CREATE INDEX idx_packages_status ON packages(status)`);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await pool.execute(`CREATE INDEX idx_package_history_package_id ON package_history(package_id)`);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await pool.execute(`CREATE INDEX idx_users_email ON users(email)`);
    } catch (error) {
      // Index might already exist, continue
    }

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await createTables();
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigration();
}
