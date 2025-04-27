const mysql = require('mysql2/promise');

const DATABASE_URL='jdbc:mysql://49.247.43.209:3306/ecocentre0'
const DB_HOST='49.247.43.209'
const DB_PORT=3306
const DB_USER='ecocentre0'
const DB_PASSWORD='eco_centre0@@'
const DB_DATABASE='ecocentre0'

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 30, // 연결 풀 크기 설정 (선택 사항)
});

module.exports.getConnection = async function() {
  try {

    console.log('getConnection');
    console.log(DB_HOST);
    console.log(DB_PORT);
    console.log(DB_USER);
    console.log(DB_PASSWORD);
    console.log(DB_DATABASE);
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports.pool = pool;