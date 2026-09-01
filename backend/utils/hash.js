import bcrypt from 'bcrypt';

export const hashPassword = async(password) => {
    const hashed = await bcrypt.hash(password,10);
    return hashed;
}
export const comparePassword = async(incomingPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(incomingPassword, hashedPassword);
    return isMatch;
}