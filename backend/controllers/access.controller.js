import { addCol, createMap, deleteCol, updateCol, getMap } from "../services/access.service.js";
import response from "../utils/response.js";

export const createAccessMap = async (req, res) => {
    const id = req.params.id;
    const userid = req.user.id;
    const { publicAccess } = req.body;
    if (publicAccess === undefined)
        return response(res, 400, "all fields are required", null);
    const accessMap = await createMap(id, userid, publicAccess);
    if (!accessMap)
        return response(res, 500, "Failed to create access map", null);
    return response(res, 201, "util created", accessMap);
};

export const getAccessMap = async (req, res) => {
    const { id } = req.params;
    const mapFound = await getMap(id);
    if (!mapFound)
        return response(res, 404, "resource not found", null);
    return response(res, 200, "resource found", mapFound);
};

export const addCollaborator = async (req, res) => {
    const { id } = req.params;
    let mapFound = await getMap(id);
    if (!mapFound)
        return response(res, 404, "resource not found", null);
    const { userid, role } = req.body;
    if (!userid || !role)
        return response(res, 400, "userid and role are required", null);
    if (!['viewer', 'editor'].includes(role))
        return response(res, 400, "role must be viewer or editor", null);
    const result = await addCol(mapFound, userid, role);
    if (result === false)
        return response(res, 400, "User is already a collaborator", null);
    if (!result)
        return response(res, 500, "Failed to add collaborator", null);
    return response(res, 200, "added successfully", result);
};

export const deleteCollaborator = async (req, res) => {
    const { id } = req.params;
    let mapFound = await getMap(id);
    if (!mapFound)
        return response(res, 404, "resource not found", null);
    const { userid } = req.body;
    if (!userid)
        return response(res, 400, "userid is required", null);
    const result = await deleteCol(mapFound, userid);
    if (result === false)
        return response(res, 400, "Cannot delete owner or user not found", null);
    if (!result)
        return response(res, 500, "Failed to delete collaborator", null);
    return response(res, 200, "Deleted user", result);
};

export const updateCollaborator = async (req, res) => {
    const { id } = req.params;
    let mapFound = await getMap(id);
    if (!mapFound)
        return response(res, 404, "resource not found", null);
    const { userid, role } = req.body;
    if (!userid || !role)
        return response(res, 400, "userid and role are required", null);
    if (!['viewer', 'editor'].includes(role))
        return response(res, 400, "role must be viewer or editor", null);
    const result = await updateCol(mapFound, userid, role);
    if (result === false)
        return response(res, 400, "Cannot update owner role or user not found", null);
    if (!result)
        return response(res, 500, "Failed to update collaborator", null);
    return response(res, 200, "Updated user", result);
};


