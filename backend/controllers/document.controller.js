import { createDoc, getDocByUser, getDocById, updateDoc, deleteDoc } from "../services/document.service.js";
import response from "../utils/response.js";

export const createDocument = async (req, res) => {
    const { name, publicAccess } = req.body;
    const user = req.user;
    const newDoc = await createDoc(user.name, name, user.id, publicAccess);
    if (!newDoc) {
        return response(res, 500, "Error in creating new Doc controller", null);
    }
    return response(res, 201, "doc created", newDoc);
};

export const getDocumentByUser = async (req, res) => {
    const user = req.user;
    const docs = await getDocByUser(user.id);
    return response(res, 200, "docs fetched", docs);
};

export const getDocumentById = async (req, res) => {
    const { id } = req.params;
    const doc = await getDocById(id);
    if (!doc) {
        return response(res, 404, "doc not found", null);
    }
    return response(res, 200, "doc fetched", doc);
};

export const updateDocument = async (req, res) => {
    const { name, description, content, language } = req.body;
    let doc = req.doc;
    const updatedDoc = await updateDoc(doc, name, description, content, undefined, language);
    if (!updatedDoc) {
        return response(res, 500, "Error in updating doc controller", null);
    }
    return response(res, 200, "doc updated", updatedDoc);
};

export const deleteDocument = async (req, res) => {
    let doc = req.doc;
    const result = await deleteDoc(doc);
    if (result) {
        return response(res, 200, "doc deleted", null);
    }
    return response(res, 500, "error in deleting doc controller", null);
};




