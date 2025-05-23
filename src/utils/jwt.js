import jwt from 'jsonwebtoken';

const signToken = (payload) => {
    return jwt.sign({ sub: payload },
        process.env.SECRET_KEY, 
        // { expiresIn: '4h' }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
};

export {
    signToken,
    verifyToken
}