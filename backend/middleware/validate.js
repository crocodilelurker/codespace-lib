import response from "../utils/response.js";
export const validate = (schema) => (req,res,next) => {

    const result = schema.safeParse({
        body:req.body
    });
    if(!result.success)
    {
        return response(res,400,"validation error", result.error.format());
    }
    req.body = result.data.body;

    next();
}