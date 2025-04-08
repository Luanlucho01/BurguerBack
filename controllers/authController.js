import UserModel from "../models/userModels.js";
import { registerUser, loginUser, getUserFromToken } from "../services/authService.js";

export const register=async(req,res)=>{
    const {email,senha}=req.body;
    if(!email || !senha){
        return res.status(400).json({success:false,message:"Preencha os campos"})
    };

    const user=new UserModel({email,senha});

    try {
        const response = await registerUser(user);
        if(response.success){
            return res.status(200).json(response);
        }else{
            return res.status(400).json(response);
        }

    } catch (error) {
        return {success:false,message:"Erro ao registrar usuario"}
    }
}

export const login=async(req,res)=>{
    const {email, senha}=req.body;
    if(!email || !senha){
        return res.status(400).json({success:false,message:"Preencha os campos"})
    }

    try {
        const response = await loginUser(email, senha);
        if(response.success){
            return res.status(200).json(response);
        }else{
            return res.status(400).json(response);
        }
    } catch (error) {
        return {success:false,message:"Erro ao logar"}
    }
}

export const getUserDetails = async (req,res) => {
    const token=req.headers.authorization?.split(' ')[1];
    console.log(token);
    if(!token){
        return res.status(401).json({success:false,message:"Token não providenciado"});
    }
    try {
        const response = await getUserFromToken(token);
        if(response.success){
            return res.status(200).json(response);
        }else{
            return res.status(401).json(response);
        }
    } catch (error) {
        console.error("Erro ao puxar detalhes:", error);
        return res.status(500).json({success:false,message:"Falha ao receber os dados"});
    }
}