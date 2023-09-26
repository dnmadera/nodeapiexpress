const ErrorResponse = require('../utils/errorResponse')
const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    error.message = err.message
    //log to console for developer
    console.log(err.stack)



    if (err.name === 'CastError'){
        const message = `Resource cast error not found id value ${err.value}`
        error = new ErrorResponse(message, 404);

    }

 
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server internal error'
    })
}

module.exports = errorHandler;