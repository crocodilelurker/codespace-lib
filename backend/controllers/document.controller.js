import { createDoc, getDocByUser ,getDocById,updateDoc, deleteDoc} from "../services/document.service.js";
import response from "../utils/response.js";

export const createDocument = async (req,res) => {
    // we need the user id and 
    const { name } = req.body;
    const  user  = req.user;
    const newDoc = await createDoc(user.username,name,user.id);
    if(!newDoc)
    {
        return response(res,500, "Error in creating new Doc controller");
    }
    return response(res,201, "doc created", newDoc);
};

export const getDocumentByUser = async (req,res) => {
    const user = req.user;
    const docs = await getDocByUser(user.id);
    return response(res,200, "docs fetched" ,docs);
};

export const getDocumentById = async (req,res) => {
    const { id } = req.params;
    const doc = await getDocById(id);
    if(!doc)
    {
        return response(res,404, "doc not found", null);
    }
    return response(res,200, "doc fetched", doc);
};
export const updateDocument = async (req,res) => {
    // we can update name, description and content (bulk) for the doc
    const { name , description , content } = req.body;
    let doc = req.doc;
    const updatedDoc = await updateDoc(doc,name, description,content);
    if(!updatedDoc)
    {
        return response(res,500, "Error in updating doc controller", null);
    }
    return response(res,200, "doc updated", updatedDoc);
};

export const deleteDocument = async (req,res) => {
    //doc is already fetched and stored in req.doc
    let doc = req.doc;
    const result = await deleteDoc(doc);
    if(result)
    {
        return response(res,200, "doc deleted", null);
    }
    return response(res,500, "error in deleting doc controller", null);
};



