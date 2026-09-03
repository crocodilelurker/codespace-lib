// we need to have functions like get user by id , email, name , etc
import Client from "../models/Client.js";
export const getClientByEmailorPhone = async (email, phoneNumber) => {
    const client = await Client.findOne({
        $or: [
            { email: email },
            { phoneNumber: phoneNumber }
        ]
    });
    return client;
}

export const getClientByEmail = async (email) => {
    const client = await Client.findOne({
        email: email
    })
    return client;
}

export const getClientByPhone = async (phoneNumber) => {
    const client = await Client.findOne({
        phoneNumber: phoneNumber
    })
    return client;
}