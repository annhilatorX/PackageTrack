#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Track Swiftly Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created. Please edit it with your database credentials.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependencies installed.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Run database migration
console.log('🗄️  Setting up database...');
try {
  execSync('npm run db:migrate', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Database tables created.\n');
} catch (error) {
  console.error('❌ Failed to create database tables:', error.message);
  console.log('Please make sure MySQL is running and your database credentials are correct.\n');
  process.exit(1);
}

// Seed database
console.log('🌱 Seeding database with sample data...');
try {
  execSync('npm run db:seed', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Database seeded with sample data.\n');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
}

console.log('🎉 Backend setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Make sure your .env file has the correct database credentials');
console.log('2. Start the backend server: npm run dev');
console.log('3. The API will be available at http://localhost:8080\n');
console.log('📋 Sample accounts:');
console.log('- Admin: admin@cloudtrack.com / admin123');
console.log('- Customer: customer@example.com / password123');
console.log('- Delivery Staff: delivery@cloudtrack.com / password123\n');
console.log('📋 Sample tracking numbers:');
console.log('- TS123456789');
console.log('- TS987654321');
console.log('- TS555666777');
