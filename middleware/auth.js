const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1]
        } 
    } catch (err){
        console.error(err)
        return new ErrorResponse('You are not authorize', 401)
    }
    
    /**
        else if (req.cookies.token) {
            token = req.cokies.token
        }
    */

    if (!token){
        
        return next(new ErrorResponse('You are not authorize', 401))
    }


    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('decoded', decoded)
        req.user = await User.findById(decoded.id);
        next();
    } catch(err){
        console.error(err);
        return next(new ErrorResponse('You are not authorize access to this route', 401))
    }
}
)


//Grant access to especific roles
exports.authorize = (...roles) => {
    return (req, resp, next) => {
        if (!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorize access to this route`, 403));
        }

        next();
    }

}