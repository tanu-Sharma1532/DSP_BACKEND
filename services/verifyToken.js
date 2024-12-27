const jwt = require('jsonwebtoken');
const JWT_SECRET = require('./config');

function verifyToken(req, res, next)
{
    const token = req.headers['authorization'];

    if(!token)
    {
        return res.status(403).json({success:false,message:'Token is required'});
    }

    jwt.verify(token, JWT_SECRET, (err,decode) => {
        if(err)
        {
            return res.status(401).json({success:false,message:"Invalid Token"});
        }

        req.userId = decode.userId;
        next();
    })
}


module.exports = verifyToken; 