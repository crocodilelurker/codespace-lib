import { decodeToken } from "../utils/jwt.js";
import response from "../utils/response.js";
import { getDocById } from "../services/document.service.js";
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return response(res, 401, "Unauthorized", null);
    }
    const token = authHeader.split(" ")[1];
    const decoded = await decodeToken(token);
    if (!decoded || !decoded.id) {
        return response(res, 401, "Unauthorized", null);
    }
    req.user = decoded;
    next();
};

export const docOwnerMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let doc = await getDocById(id);
        if (!doc) {
            return response(res, 404, "Doc not found", null);
        }
        if (doc.owner.equals(user.id) == false) {
            return response(res, 403, "Forbidden", null);
        }
        req.doc = doc;
        next();
    }
    catch (error) {
        console.log(error);
        return response(res, 500, "internal server error or doc id parser", null);
    }
};

export const docWriteMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let doc = await getDocById(id);
        if (!doc) {
            return response(res, 404, "Doc not found", null);
        }

        const isOwner = doc.owner.equals(user.id);
        let isEditor = false;

        if (doc.accessMap && doc.accessMap.collaborators) {
            const col = doc.accessMap.collaborators.find((c) => {
                const colId = c.userid?._id ? c.userid._id.toString() : c.userid?.toString();
                return colId === user.id.toString() && (c.role === 'editor' || c.role === 'owner');
            });
            if (col) isEditor = true;
        }

        if (!isOwner && !isEditor) {
            return response(res, 403, "Forbidden - write permission required", null);
        }

        req.doc = doc;
        req.isOwner = isOwner;
        next();
    }
    catch (error) {
        console.log(error);
        return response(res, 500, "internal server error or doc id parser", null);
    }
};