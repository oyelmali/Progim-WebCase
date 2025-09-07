const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Connection string varsa onu kullan
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString || undefined,
  // Eğer connection string yoksa eski yöntemi kullan
  ...(connectionString ? {} : {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  }),
  // SSL gerekli
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('PostgreSQL veritabanına başarıyla bağlanıldı.');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};