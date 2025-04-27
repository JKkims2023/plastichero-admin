const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 30, // 연결 풀 크기 설정 (선택 사항)
});

module.exports.getConnection = async function() {
  try {

    console.log('getConnection');
    console.log(process.env.DB_HOST);
    console.log(process.env.DB_PORT);
    console.log(process.env.DB_USER);
    console.log(process.env.DB_PASSWORD);
    console.log(process.env.DB_DATABASE);
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports.pool = pool;