import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = "ola";

export const registerUser=async(user)=>{
    console.log(user);

    try {
        const hashedPassword = await bcrypt.hash(user.senha,10)
        const query=`INSERT INTO usuarios (email, senha) VALUES (?, ?)`
        const values=[user.email, hashedPassword];

        await pool.query(query, values);
        return {success:true, message:"Usuário Registrado"}

    } catch (error) {
        return {success:false, message:"Erro ao registrar usuario",error:error}
        
    }
}

export const loginUser=async(email,senha)=>{
    try {
        const [rows]=await pool.query(`SELECT * FROM usuarios WHERE email = ?`,[email]);
        
        if(rows.length===0){
            return {success:false,message:"Usuário não encontrado."}
        }
        const user=rows[0]
        const passwordMatch = await bcrypt.compare(senha,user.senha);
        if(!passwordMatch){
            return {success:false,message:"Senha incorreta"}
        }
        const token=jwt.sign(
            {id:user.id,email:user.email},
            JWT_SECRET,
            {expiresIn: '1h'}
        );
        return{
            success:true,
            message:'Logado com sucesso',
            token,
            user: { id: user.id, email: user.email }
        }
    } catch (error) {
        return {success:false,message:"Falha ao logar",error:error}
    }

}

export const getUserFromToken = async(token)=>{
    try {
        const trimmedToken=token.trim();
        console.log("Token recebido:", trimmedToken);

        const decodedToken = jwt.verify(trimmedToken, JWT_SECRET);
        console.log("Token decodificado:", decodedToken);

        const [rows]=await pool.query(`SELECT id, email FROM usuarios WHERE email = ?`, [decodedToken.email]);
        if(rows.length===0){
            return {success:false,message:"Usuário não encontrado"}
        }
        
        const user = rows[0];
        return {success:true, user};
    } catch (error) {
        console.error("Erro de verificação de token:", error);
        return { success: false, message: "Token inválido ou expirado" };
    }
}