const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


/**
 * @desc    Sandbox promise
 * @access  Public 
*/
exports.sandboxPromise = asyncHandler(async (req, res, next) => {

    const data = {
        message: 'something to process as a promise'
    }

    
    calculate(1,'lola').then(result => {
        data.message = result;
        res.status(200).json({
            sucess: true,
            data
        });
    })
    .catch(error => {
        res.status(400).json({
            sucess: false,
            data: error.message
        });

    })
    
    

    
});

 
const calculate = async (a, b) => {

    return new Promise((resolve, reject) => {        
        setTimeout(() => {
            if (isNaN(a) || isNaN(b)) {
                reject(new Error('Both values must be numeric'));
            } else {
                const add = a + b;
                resolve(add);
            }
        }, 1000); 
    });
    
    
}


  