import AccessMap from "../models/AccessMap.js";
import { getClientById } from "../services/client.service.js";

export const createMap = async (docid, userid, publicAccess) => {
    try {
        let newMap = new AccessMap({
            documentId: docid,
            collaborators: [{
                userid: userid,
                role: 'owner'
            }],
            publicAccess: publicAccess || false
        });
        await newMap.save();
        return newMap;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const getMap = async (docid) => {
    let mapFound = await AccessMap.findOne({
        documentId: docid
    }).populate("collaborators.userid", "name email");
    if (!mapFound)
        return null;
    return mapFound;
};

export const addCol = async (mapFound, userid, role) => {
    try {
        const client = await getClientById(userid);
        if (!client)
            return null;
        const exists = mapFound.collaborators.some((item) => {
            const id = item.userid._id ? item.userid._id.toString() : item.userid.toString();
            return id === userid.toString();
        });
        if (exists)
            return false;
        mapFound.collaborators.push({
            userid,
            role
        });
        await mapFound.save();
        await mapFound.populate("collaborators.userid", "name email");
        return mapFound;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const deleteCol = async (mapFound, userid) => {
    try {
        const target = mapFound.collaborators.find((item) => {
            const id = item.userid._id ? item.userid._id.toString() : item.userid.toString();
            return id === userid.toString();
        });
        if (!target || target.role === 'owner')
            return false;
        mapFound.collaborators = mapFound.collaborators.filter((item) => {
            const id = item.userid._id ? item.userid._id.toString() : item.userid.toString();
            return id !== userid.toString();
        });
        await mapFound.save();
        return mapFound;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const updateCol = async (mapFound, userid, role) => {
    try {
        const target = mapFound.collaborators.find((item) => {
            const id = item.userid._id ? item.userid._id.toString() : item.userid.toString();
            return id === userid.toString();
        });
        if (!target || target.role === 'owner')
            return false;
        target.role = role;
        await mapFound.save();
        await mapFound.populate("collaborators.userid", "name email");
        return mapFound;
    } catch (error) {
        console.log(error);
        return null;
    }
};