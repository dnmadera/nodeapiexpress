const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')

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
    console.log('request'.red, req)

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
            success: true,
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




/**
 * @desc    Reset password
 * @access  Public
 * @route   GET /api/v1/auth/resetpassword/:resettoken
*/
exports.resetpassword = asyncHandler(async (req, res, next) => {

    //get hash token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');


    const user = await User.findOne({
        resetPasswordToken
        ,resetPasswordExpiration: { $gt: Date.now()}
    });

    if (!user){
        return next(new ErrorResponse('Invalid token', 400))
    }

    //set the new password
    user.password = req.body.newpassword;
    user.resetPasswordExpiration = undefined;
    user.resetPasswordToken = undefined;

    await user.save()

    sendTokenResponse(user, 200, res);
});



/**
 * @desc    Updates name and email
 * @access  Private 
 * @route   PUT /api/v1/auth/updatedetails
*/
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
    

    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true        
    });



    res.status(200).json({
        success: true,
        data: user
    });
 
});





/**
 * @desc    Updates name and email
 * @access  Private 
 * @route   PUT /api/v1/auth/updatepassword
*/
exports.updatePassword = asyncHandler(async (req, res, next) => {
    console.log('request'.red, req)
  
    const user = await User.findById(req.user.id).select('+password')

    //check current pasword
    if (!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newpassword;

    await user.save();

    sendTokenResponse(user, 200, res);
 
});





/**
 * @desc    Logout user
 * @access  Private 
 * @route   GET /api/v1/auth/logout
*/
exports.logout = asyncHandler(async (req, res, next) => {
    
    res.cookie('token', 'none', {
        expires: new Date(Date.now()) + 10 * 1000,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}
    });
 
});