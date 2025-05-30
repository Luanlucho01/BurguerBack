import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool=mysql2.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    connectionLimit:10,
    queueLimit:0,
    waitForConnections:true
})

const checkConnection=async()=>{
    try {
        const connection=await pool.getConnection();
        console.log("Conectado ao banco de dados");
        connection.release();
    } catch (error) {
        console.log("Erro ao conectar ao banco de dados");
        throw error;
    }
}

export {pool,checkConnection};