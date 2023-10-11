const Bootcamp = require('../models/Bootcamp')
const Review = require('../models/Review')

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




/**
 * @desc    update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
*/
exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id);    

    if (!review){
        next(new ErrorResponse(`No Review with id of ${req.params.id}`, 404 ))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        next(new ErrorResponse(`Not authorized to update review`, 401 ))
    }


    

    
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //returns a new version
        runValidators: true
    });
        
    res.status(200).json({
        success: true,         
        data: review
    });
    
});


/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
*/
exports.deleteReview = asyncHandler(async (req, res, next) => {
    
    const review = await Review.findById(req.params.id);    

    if (!review){
        next(new ErrorResponse(`No Review with id of ${req.params.id}`, 404 ))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        next(new ErrorResponse(`Not authorized to update review`, 401 ))
    }

    
    //await review.remove(); //deprecated
    await review.deleteOne();
    

    res.status(200).json({
        success: true,         
        data: review
    });
    
});