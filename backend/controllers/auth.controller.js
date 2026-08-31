import response from "../utils/response.js";

export const signup = async (req,res) => {
    //we are getting parsed and clean data
    try 
    {

    }
    catch(error)
    {
        console.log("error in signup controller", error);
        return response(res,500,"ISE Signup",null);
    }
}

export {
    signup
}