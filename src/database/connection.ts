import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// First connect without database to create it if needed
const createDatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create database if it doesn't exist
const createDatabase = async () => {
  try {
    const tempPool = mysql.createPool(createDatabaseConfig);
    const connection = await tempPool.getConnection();
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'track_swiftly'}`);
    connection.release();
    await tempPool.end();
  } catch (error) {
    console.log('Note: Could not create database, continuing with existing setup...');
  }
};

// Initialize database creation
createDatabase();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'track_swiftly',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};
