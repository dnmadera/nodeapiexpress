const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Register user
 * @access  Public 
 * @route   POST /api/v1/auth/register
*/
exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role} = req.body;
    
    //Create user
    const user = await User.create({
        name,
        email,
        password, 
        role
    })

    sendTokenResponse(user, 200, res);
});



/**
 * @desc    Login user
 * @access  Public 
 * @route   POST /api/v1/auth/login
*/
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    //validate email and password
    if (!email || !password)
        return next(new ErrorResponse("Please provide an email and password", 400));

    //Check for the user
    const user = await User.findOne({ email }).select('+password')
    if (!user)
        return next(new ErrorResponse("Invalid credentials", 401));
    
    
    const isMatch = await user.matchPassword(password);

    if (!isMatch){
        return next(new ErrorResponse("Invalid credentials", 401));
    }
    


    sendTokenResponse(user, 200, res);
});






//Get token from model and create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();

    //
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false
    }

    if (process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            sucess: true,
            token
        })
}




/**
 * @desc    Get current logged in user
 * @access  Private 
 * @route   GET /api/v1/auth/me
*/
exports.getMe = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    
    res.status(200).json({
        success: true,
        data: user
    });
});




/**
 * @desc    Forgot password
 * @access  Public
 * @route   GET /api/v1/auth/forgotpassword
*/
exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email});

    if (!user){
        return next(new ErrorResponse(`There is no user with this email ${req.body.email}`))
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false})


    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
    const message = `You receive this email because you has requested to reset your passowrd. Make a PUT to: ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token', 
            message
        });

        res.status(200).json({
            success: true,
            data: `email sent to ${user.email}`
        });

    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired = undefined;
        await user.save( {validateBeforeSave: false})

        return next(new ErrorResponse('Email can not be sent', 500))
    }
    
   
});