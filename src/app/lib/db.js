const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST_TEST,
  port: process.env.DB_PORT_TEST,
  user: process.env.DB_USER_TEST,
  password: process.env.DB_PASSWORD_TEST,
  database: process.env.DB_DATABASE_TEST,
  connectionLimit: 30, // 연결 풀 크기 설정 (선택 사항)
});

module.exports.getConnection = async function() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports.pool = pool;