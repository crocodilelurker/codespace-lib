import response from "../utils/response.js";
import { hashPassword } from "../utils/hash.js";
import Client from "../models/Client.js";
import { getClientByEmailorPhone } from "../services/client.service.js";
import { generateAccessRefresh } from "../utils/jwt.js";
export const signup = async (req,res) => {
    //we are getting parsed and clean data
    try 
    {
        const {name, email, phoneNumber, password} = req.body;
        const hashedPassword = await hashPassword(password);
        const existClient = await getClientByEmailorPhone(email,phoneNumber);
        if(existClient)
        {
            return response(res,400,"Client already exists",null);
        }
        const newClient = await Client.create({
            name,
            email,
            password:hashedPassword,
            phoneNumber
        });

        const payload = {
            id:newClient._id,
            name:newClient.name,
            email:newClient.email
        }
        const { accessToken , refreshToken } = await generateAccessRefresh(payload);
        newClient.accessToken = accessToken;
        newClient.refreshToken = refreshToken;
        await newClient.save();
        return response(res,201,"Client created successfully",{
            id:newClient._id,
            name:newClient.name
        });
        //we need to create and send jwt access and refresh token as well
    }
    catch(error)
    {
        console.log("error in signup controller", error);
        return response(res,500,"ISE Signup",null);
    }
}

export const login = async (req,res) => {
    
}