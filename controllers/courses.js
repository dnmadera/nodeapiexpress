const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


/**
 * @desc    Gets all the courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcamp-id/courses
 * @access  Public 
*/
exports.getCourses = asyncHandler(async (req, res, next) => {

        console.log(req.query)
        let query;


        const populate = {
            path: "bootcamp",
            select: "name description"
        }
        if (req.params.bootcamp_id){
            query = Course.find({ bootcamp: req.params.bootcamp_id }).populate(populate);
        } else {
            query = Course.find().populate(populate);
        }

        
        //execute query
        const courses = await query

        res.status(200).json({success: true, count: courses.length, data: courses});
    
    
});


/**
 * @desc    Gets single course
 * @route   GET /api/v1/courses(:id)
 * @access  Public 
*/
exports.getCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findOne({_id: req.params.id}).populate({
        path: "bootcamp",
        select: "name description"
    });

    if (!course){
        next(new ErrorResponse(`No course find with id of ${req.params.id}`, 404 ))
    }


    res.status(200).json({
        success: true,         
        data: course
    });
    
});




/**
 * @desc    Add course
 * @route   POST /api/v1/bootcamps/:bootcamp_id/courses
 * @access  Private
*/
exports.addCourse = asyncHandler(async (req, res, next) => {
    
    const bootcampId = req.params.bootcamp_id;
    req.body.bootcamp = bootcampId;

    console.log('request body', req.body)

    const bootcamp = await Bootcamp.findById(bootcampId);    

    if (!bootcamp){
        next(new ErrorResponse(`No bootcamp with id of ${bootcampId}`, 404 ))
    }

    const course = await Course.create(req.body);



    res.status(201).json({
        success: true,         
        data: course
    });
    
});