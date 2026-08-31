import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    tags:[{
        type:String
    }],
    //need to make a project associated field
    mclient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Mclient'
    },

},{
    timestamps:true
});

const Client = mongoose.model("Client",ClientSchema);
export default Client;
