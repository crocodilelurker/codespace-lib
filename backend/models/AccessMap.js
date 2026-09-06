import mongoose from "mongoose";

const accessMapSchema = new mongoose.Schema({
    documentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique : true
    },
    collaborators : [
        {
            userid : {
                type : mongoose.Schema.Types.ObjectId,
                ref :'User'
            },
            role : {
                type :String,
                enum : ['viewer','editor'],
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