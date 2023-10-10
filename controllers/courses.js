const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');



/**
 * @desc    Gets all the courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcamp-id/courses
 * @access  Public 
*/
exports.getCourses = asyncHandler(async (req, res, next) => {
    //console.log('params', req.params.bootcamp_id)
    if (req.params.bootcamp_id){
            const query = await Course.find({ bootcamp: req.params.bootcamp_id });
            res.status(200).json({
                success: true,
                count: query.length,
                data: query
            });
        } else {
                        
            res.status(200).json(res.advancedResults);
    
        }

    
        
       
    
    
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
    req.body.user = req.user.id;

    console.log('request body'.yellow, req.body)

    const bootcamp = await Bootcamp.findById(bootcampId);    

    if (!bootcamp){
        next(new ErrorResponse(`No bootcamp with id of ${bootcampId}`, 404 ))
    }


    //check the user owns the bootcamp
    //Make sure user is bootcamp owner or admin 
    if (bootcamp.user.id.toString() !== req.user.id && req.user.role != 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course to bootcamp ${bootcamp._id}`, 401))
    }

    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,         
        data: course
    });
    
});



/**
 * @desc    update course
 * @route   PUT /api/v1/courses/:id
 * @access  Private
*/
exports.updateCourse = asyncHandler(async (req, res, next) => {
    
    let course = await Course.findById(req.params.id);    

    if (!course){
        next(new ErrorResponse(`No Course with id of ${req.params.id}`, 404 ))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //returns a new version
        runValidators: true
    });

    

    res.status(200).json({
        success: true,         
        data: course
    });
    
});


/**
 * @desc    Delete course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private
*/
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    
    const course = await Course.findById(req.params.id);    

    if (!course){
        next(new ErrorResponse(`No Course with id of ${req.params.id}`, 404 ))
    }

    await course.deleteOne();
    

    res.status(200).json({
        success: true,         
        data: course
    });
    
});