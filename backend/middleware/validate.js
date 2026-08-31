import response from "../utils/response.js";
export const validate = (schema) => (req,res,next) => {

    const result = schema.safeParse({
        body:req.body,
        query:req.query,
        params:req.params
    });
    if(!result.success)
    {
        return response(res,400,"validation error", result.error.format());
    }
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
}