const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


/**
 * @desc    Gets all the bootcamps
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcamp-id/courses
 * @access  Public 
*/
exports.getCourses = async (req, res, next) => {
    try {
        console.log(req.query)
        let query;


        if (req.params.bootcamp_id){
            query = Course.find({ bootcamp: req.params.bootcamp_id })
        } else {
            query = Course.find();
        }

        
        //execute query
        const courses = await query

        res.status(200).json({success: true, count: courses.length, data: courses});
    } catch(error){
        next(error)
    }    
    
}
