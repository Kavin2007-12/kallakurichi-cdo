const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSetup() {
  console.log('Starting MySQL Database Setup...');
  
  // 1. Establish connection to MySQL server (without selecting a DB)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Allows executing multiple statements if needed
  });

  try {
    // 2. Read the SQL setup file
    const sqlFilePath = path.join(__dirname, 'setup.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Reading setup.sql file...');
    console.log('Running entire setup.sql file...');
    await connection.query(sql);

    console.log('Database and Tables created & seeded successfully!');
  } catch (error) {
    console.error('Error during database setup:', error);
  } finally {
    await connection.end();
    console.log('MySQL setup connection closed.');
  }
}

runSetup();
