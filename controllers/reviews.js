const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');





/**
 * @desc    Gets all the reviews
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/bootcamps/:bootcamp-id/reviews
 * @access  Public 
*/
exports.getReviews = asyncHandler(async (req, res, next) => {
    
    if (req.params.bootcamp_id){
            const query = await Review.find({ bootcamp: req.params.bootcamp_id });
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
 * @desc    Get a review by id
 * @route   GET /api/v1/reviews/:id
 * @access  Public 
*/
exports.getReview = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const review = await Review.findById(id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review){
        next(new ErrorResponse(`No review found with the id of ${id}`, 404))
    }
    
    
    res.status(200).json({
        success: true,        
        data: review
    });
    
});



/**
 * @desc    Add a new review for bootcamp
 * @route   POST /api/v1/bootcamps/:bootcamp_id/reviews
 * @access  Private 
*/
exports.addReview = asyncHandler(async (req, res, next) => {    

    req.body.bootcamp = req.params.bootcamp_id;
    req.body.user = req.user.id;


    const bootcamp = await Bootcamp.findById(req.body.bootcamp);

    if (!bootcamp) {
        next(new ErrorResponse(`No bootcamp was found with the id of ${req.body.bootcamp}`, 404))
    }

    const review = await Review.create(req.body);

    
    res.status(201).json({
        success: true,        
        data: review
    });
    
});