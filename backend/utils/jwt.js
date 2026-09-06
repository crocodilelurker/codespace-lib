import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const generateAccessRefresh = async (payload) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn : '15m'});
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn : '7d'});
    return { accessToken , refreshToken};
};
export const decodeToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}
