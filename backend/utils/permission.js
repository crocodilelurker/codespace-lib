import mongoose from "mongoose";
import { getMapById } from "../services/access.service.js";
import { getClientById } from "../services/client.service.js";
import { getDocById } from "../services/document.service.js";
import { decodeToken } from "./jwt.js";

export const userAllowed = async (docid, token) => {
    try {
        if (!token || !docid) {
            return { isAllowed: false, ableToWrite: false, error: "Missing token or document ID" };
        }

        if (!mongoose.Types.ObjectId.isValid(docid)) {
            return { isAllowed: false, ableToWrite: false, error: "Invalid document ID" };
        }

        // verify the token
        const decoded = await decodeToken(token);
        if (!decoded || !decoded.id) {
            return { isAllowed: false, ableToWrite: false, error: "Invalid or expired token" };
        }

        const userid = decoded.id;

        // get user by id
        const clientExists = await getClientById(userid);
        if (!clientExists) {
            return { isAllowed: false, ableToWrite: false, error: "User not found" };
        }

        const doc = await getDocById(docid);
        if (!doc) {
            return { isAllowed: false, ableToWrite: false, error: "Document not found" };
        }

        const accessMap = (doc.accessMap && doc.accessMap.collaborators)
            ? doc.accessMap
            : await getMapById(doc.accessMap?._id || doc.accessMap);

        if (!accessMap) {
            return { isAllowed: false, ableToWrite: false, error: "Access map not found" };
        }

        // if the doc is public then it is allowed; if it is private and the user is in collaborator then it is allowed
        // if the user is in collaborator and the role is either owner or editor then also he is allowed
        // the write permission is only decided by the collaborators role not by whether the doc is public or not

        let isAllowed = false;
        let ableToWrite = false;
        let role = null;

        if (accessMap.publicAccess) {
            isAllowed = true;
        }

        const collaborator = accessMap.collaborators?.find((item) => {
            const colUserId = item.userid?._id ? item.userid._id.toString() : item.userid?.toString();
            return colUserId === userid.toString();
        });

        if (collaborator) {
            isAllowed = true;
            role = collaborator.role;
            if (collaborator.role === 'owner' || collaborator.role === 'editor') {
                ableToWrite = true;
            }
        }

        const ownerId = doc.owner?._id ? doc.owner._id.toString() : doc.owner?.toString();
        if (ownerId && ownerId === userid.toString()) {
            isAllowed = true;
            ableToWrite = true;
            role = 'owner';
        }

        return {
            isAllowed,
            ableToWrite,
            role,
            user: clientExists,
            doc
        };
    } catch (error) {
        console.error("Error in userAllowed:", error);
        return { isAllowed: false, ableToWrite: false, error: "Internal error checking permission" };
    }
};