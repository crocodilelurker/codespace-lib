import mongoose from "mongoose";
const clientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber :{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    third:{
        type:Boolean,
        required:true,
        default:false
    }
},{
    timestamps:true
});

const Client = mongoose.model("Client",clientSchema);
export default Client;