import mongoose from "mongoose";
const docSchema = new mongoose.Schema({

    name:{
        type:String,
        default:"Untitled"
    },
    description:{
        type:String,
        default:""
    },// this field cannot be created during doc creation only updated later
    content:{
        type:String,
        default:""
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
        required:true
    },
    ownerName : {
        type :String,
        required :true
    },
    accessMap : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'AccessMap',
        //for now required is false
    }
},{
    timestamps:true
});

const Document = mongoose.model("Document",docSchema);
export default Document;