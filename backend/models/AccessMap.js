import mongoose from "mongoose";

const accessMapSchema = new mongoose.Schema({
    documentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Document',
        required : true,
        unique : true
    },
    collaborators : [
        {
            userid : {
                type : mongoose.Schema.Types.ObjectId,
                ref :'Client'
            },
            role : {
                type :String,
                enum : ['viewer','editor','owner'],
                default : 'viewer'
            }
        },
    ],
    publicAccess : {
        type : Boolean ,
        default : false
    },
},{
    timestamps: true
});

const AccessMap = mongoose.model("AccessMap", accessMapSchema);

export default AccessMap;