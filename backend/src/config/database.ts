import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST?.split(':')[0],
  port: parseInt(process.env.DB_HOST?.split(':')[1] || '8889'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('Database config:', {
  ...dbConfig,
  password: '****'  // Ne prikazujemo password u logu
});

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('Attempting to connect to database...');
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    
    // Test query
    const [result] = await connection.query('SELECT 1 + 1 as test');
    console.log('Test query result:', result);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

// Export both pool and test function
export { pool as default, testConnection }; 