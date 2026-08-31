import mongoose from "mongoose";
const docSchema = new mongoose.Schema({

    name:{
        type:String,
        default:"Untitled"
    },
    content:{
        type:String,
        default:""
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
        required:true
    },
    others:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
    }]
},{
    timestamps:true
});

const Document = mongoose.model("Document",docSchema);
export default Document;