import Document from "../models/Document.js";

export const createDoc = (username, docName, userId) => {
    try
    {const newDoc = new Document({
        name :docName,
        ownerName : username,
        owner : userId
    });
    // we need to create an AccessMap
    return newDoc;
}
catch(error)
{
    console.log(error);
    return null;
}
};

export const getDocByUser = (userId) => {
    try
    {
        const docs = Document.find({
            owner : userId
        });
        return docs;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
};
export const getDocById = (docId) => {
    try
    {
        const doc = Document.findById(docId);
        return doc;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
};

export const deleteDoc = async (doc) => {
    try 
    {
        // we are sure that the doc exists and the user is the owner of the doc
        await doc.deleteOne();
        return true;
    }
    catch (error)
    {
        console.log(error);
        return false;
    }
};

export const updateDoc = async (doc, name, description, content) => {
    try
    {
        if(name)
        {
            doc.name = name;
        }
        if(description)
        {
            doc.description = description;
        }
        if(content)
        {
            doc.content = content;
        }
        await doc.save();
        return doc;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
}