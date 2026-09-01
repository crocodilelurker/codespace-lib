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
        default : ""
    },
    third:{
        type:Boolean,
        required:true,
        default:false
    },
    provider : {
        type : String,
        enum : ['github','local'],
        required :true,
        default:'local'
    },
    refreshToken : {
        type : String,
        default: ""
    },
    accessToken : {
        type :String,
        default : ""
    }
},{
    timestamps:true
});

const Client = mongoose.model("Client",clientSchema);
export default Client;