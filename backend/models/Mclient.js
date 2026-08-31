import mongoose from "mongoose";

const MclientSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    third_party:{
        type:Boolean,
        required:true,
        default:false
    },

},
{
    timestamps:true
});

const Mclient = mongoose.model("Mclient",MclientSchema);
export default Mclient;