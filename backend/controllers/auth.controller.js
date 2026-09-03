import response from "../utils/response.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import Client from "../models/Client.js";
import { getClientByEmail, getClientByEmailorPhone } from "../services/client.service.js";
import { generateAccessRefresh } from "../utils/jwt.js";
export const signup = async (req, res) => {
    //we are getting parsed and clean data
    try {
        const { name, email, phoneNumber, password } = req.body;
        console.log("signup controller", name, email, phoneNumber, password);
        const hashedPassword = await hashPassword(password);
        const existClient = await getClientByEmailorPhone(email, phoneNumber);
        if (existClient) {
            return response(res, 400, "Client already exists", null);
        }
        const newClient = await Client.create({
            name: name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        const payload = {
            id: newClient._id,
            name: newClient.name,
            email: newClient.email
        }
        const { accessToken, refreshToken } = await generateAccessRefresh(payload);
        newClient.accessToken = accessToken;
        newClient.refreshToken = refreshToken;
        await newClient.save();
        return response(res, 201, "Client created successfully", {
            id: newClient._id,
            name: newClient.name,
            email: newClient.email,
            accessToken,
            refreshToken
        });
        //we need to create and send jwt access and refresh token as well
    }
    catch (error) {
        console.log("error in signup controller", error);
        return response(res, 500, "ISE Signup", null);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existClient = await getClientByEmail(email);
        if (!existClient) {
            return response(res, 400, "wrong email or pass", null
            )
        }
        const isMatch = await comparePassword(password, existClient.password);
        if (!isMatch) {
            return response(res, 400, "wrong email or pass", null)
        }
        const payload = {
            id: existClient._id,
            name: existClient.name,
            email: existClient.email
        }
        const { accessToken, refreshToken } = await generateAccessRefresh(payload);
        existClient.accessToken = accessToken;
        existClient.refreshToken = refreshToken;
        await existClient.save();
        return response(res, 200, "Client logged in successfully", {
            id: existClient._id,
            name: existClient.name,
            email: existClient.email,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.log("error in login controller", error);
        return response(res, 500, "ISE Login", null);
    }

}