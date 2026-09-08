import Document from "../models/Document.js";
import AccessMap from "../models/AccessMap.js";
import { createMap } from "./access.service.js";
import mongoose from "mongoose";

export const createDoc = async (username, docName, userId, publicAccess = false) => {
    try {
        const docId = new mongoose.Types.ObjectId();
        const newMap = await createMap(docId, userId, publicAccess);
        if (!newMap) {
            return null;
        }
        const newDoc = new Document({
            _id: docId,
            name: docName,
            ownerName: username,
            owner: userId,
            accessMap: newMap._id
        });
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
        const userObjId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        const accessMaps = await AccessMap.find({
            "collaborators.userid": userObjId
        }).select("documentId");

        const sharedDocIds = accessMaps.map((m) => m.documentId).filter(Boolean);

        const docs = await Document.find({
            $or: [
                { owner: userObjId },
                { _id: { $in: sharedDocIds } }
            ]
        })
            .populate("accessMap")
            .sort({ updatedAt: -1 });

        return docs;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const getDocById = async (docId) => {
    try {
        const doc = await Document.findById(docId).populate("accessMap");
        return doc;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

export const deleteDoc = async (doc) => {
    try {
        await AccessMap.findOneAndDelete({ documentId: doc._id });
        await doc.deleteOne();
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};

export const updateDoc = async (doc, name, description, content, yjsState, language) => {
    try {
        if(name != undefined)
            doc.name = name;
        if(description != undefined)
            doc.description = description;
        if(content != undefined)
            doc.content = content;
        if(yjsState != undefined)
            doc.yjsState = yjsState;
        if(language != undefined)
            doc.language = language;
        await doc.save();
        return doc;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};