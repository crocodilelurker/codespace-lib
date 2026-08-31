const response = (res, code, message, data) => {
    return res.status(code).json({
        success: code < 400,
        message,
        data
    });
};

export default response;