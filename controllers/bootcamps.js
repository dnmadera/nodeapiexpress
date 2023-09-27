const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder');

/**
 * @desc    Gets all the bootcamps
 * @access  Public 
*/
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.find()
        res.status(200).json({success: true, count: bootcamp.length, data: bootcamp});
    } catch(error){
        next(error)
    }    
    
}


/**
 * @desc    Gets single bootcamps
 * @access  Public 
*/
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id)
        if (!bootcamp) {
            console.error('error')
            return next(new ErrorResponse(`Bootcamp not found ${req.params.id}`, 404))
        }
        res.status(200).json({success: true, data: bootcamp});        
    } catch (error) {
        next(error)
    }
    
}

/**
 * @desc    Creates new bootcamp
 * @access  Public 
*/
exports.createBootcamp = asyncHandler (async (req, res, next) => {   
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, count: bootcamp.length, data: bootcamp});
    } catch(error){
        next(error)
    }     
})


/**
 * @desc    Deteltes a bottcamp
 * @access  Public 
 * @param   {string} req.params.id - the resource id
 * @returns {string} the message of the result of the operation 
*/
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.deleteOne({_id: req.params.id});
        res.status(200).json({success: true, message: `deletes bootcamps id ${req.params.id} deletedCount: ${bootcamp.deletedCount}`});        
    } catch (error) {
        next(error)
    }
    
}


/**
 * @desc    Update bootcamp
 * @access  Public 
*/
exports.putBootcamp = asyncHandler(async (req, res, next) => {   
    try {
        const bootcamp = await Bootcamp.updateOne({_id: req.params.id}, req.body)
        res.status(200).json({success: true, data: bootcamp});
    } catch(error){
        next(error)
    }
});



/**
 * @desc    Updates a bootcamp
 * @access  Public 
*/
exports.patchBootcamp = asyncHandler(async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.updateOne({_id: req.params.id}, req.body)
        res.status(200).json({success: true, data: bootcamp});
    } catch(error){
        next(error)
    }
});




/**
 * @desc    Calculate radius
 * @route   /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Public 
*/
exports.getBootcampRadius = asyncHandler(async (req, res, next) => {
   
    try {
        const { zipcode, distance } = req.params;

        console.log(req.params)

   
        //Get loc
        const loc = await geocoder.geocode(zipcode);
        console.log('geocode ', loc)

        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        console.log(lng, lat);

        //Calc radius using radians
        //radius 3963 mi / 6378.1 km

        const radius = distance / 6378.1
        const bootcamps = await Bootcamp.find({
            location: {
                $geoWithin: { $centerSphere: [[lng, lat], radius] } 
            }
        })

        res.status(200).json({
            success: true, 
            count: bootcamps.length,
            data: bootcamps
        });

        

    } catch (error) {
        next(error)
    }

    
    
});
