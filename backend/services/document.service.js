import Document from "../models/Document.js";

export const createDoc = async (username, docName, userId) => {
    try {
        const newDoc = new Document({
            name: docName,
            ownerName: username,
            owner: userId
        });
        // we need to create an AccessMap
        await newDoc.save();
        return newDoc;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const getDocByUser = async (userId) => {
    try {
        const docs = await Document.find({
            owner: userId
        });
        return docs;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
export const getDocById = async (docId) => {
    try {
        const doc = await Document.findById(docId);
        return doc;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const deleteDoc = async (doc) => {
    try {
        // we are sure that the doc exists and the user is the owner of the doc
        await doc.deleteOne();
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};

export const updateDoc = async (doc, name, description, content) => {
    try {
        //from frontend i will send all these 3 for sure 
        //no need to check
        doc.name = name;
        doc.description = description;
        doc.content = content;
        await doc.save();
        return doc;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}