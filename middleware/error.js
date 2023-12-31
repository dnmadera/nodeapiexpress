const ErrorResponse = require('../utils/errorResponse')
const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    error.message = err.message
    //log to console for developer
    console.log('Error: '.bgRed, err)



    //Mongo cast error, resource not found
    if (err.name === 'CastError'){
        const message = `Resource not found`
        error = new ErrorResponse(message, 404);
    }


    //Mongoose duplicated field value
    if (err.code === 11000){
        const message = `Duplicate field value entered`
        error = new ErrorResponse(message, 400);

    }

    //Mongoose validation error    
    if (err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message)        
        error = new ErrorResponse(message, 400);
    }
 

    //writes the error message and status
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server internal error'
    })
}

module.exports = errorHandler;