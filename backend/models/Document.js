import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Untitled"
    },
    description: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    accessMap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessMap',
        required: true
    }
}, {
    timestamps: true
});

const Document = mongoose.model("Document", docSchema);
export default Document;