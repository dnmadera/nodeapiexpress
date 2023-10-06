const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder');

/**
 * @desc    Gets all the bootcamps
 * @access  Public 
*/
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});


/**
 * @desc    Gets single bootcamps
 * @access  Public 
*/
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        console.error('error')
        return next(new ErrorResponse(`Bootcamp not found ${req.params.id}`, 404))
    }
    res.status(200).json({success: true, data: bootcamp});
    

    
});

/**
 * @desc    Creates new bootcamp
 * @access  Public 
*/
exports.createBootcamp = asyncHandler (async (req, res, next) => {   

    //add user to req.body 
    req.body.user = req.user.id;

    //check for published bootcamp
    const publisedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //if user is not in admin then they only can add just one bootcamp

    if (publisedBootcamp && req.user.role != 'admin'){
        return next(new ErrorResponse(`The user id ${ req.user.id } has already publised a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body);

    if (!bootcamp){
        return next(new ErrorResponse('Not a valid bootcamp', 400))
    }

    res.status(201).json({success: true, count: bootcamp.length, data: bootcamp});
    
})


/**
 * @desc    Deteltes a bottcamp
 * @access  Public 
 * @param   {string} req.params.id - the resource id
 * @returns {string} the message of the result of the operation 
*/
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    console.log('id', req.params.id)
    const bc = await Bootcamp.findById(req.params.id);

    console.log('bootcamp', bc)

    if (!bc){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`), 404)
    }

    //Make sure user is bootcamp owner or admin 
    if (bootcamp.user.id.toString() !== req.params.id && req.user.role != 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`), 401)
    }


    await bc.deleteOne()

    res.status(200).json({success: true, message: `deletes bootcamps id ${req.params.id}`});
    
});


/**
 * @desc    Update bootcamp
 * @access  Public 
*/
exports.putBootcamp = asyncHandler(async (req, res, next) => {   
  
    await updateBootcamp(req, res, next);

});



/**
 * @desc    Updates a bootcamp
 * @access  Public 
*/
exports.patchBootcamp = asyncHandler(async (req, res, next) => {

    await updateBootcamp(req, res, next);

});


const updateBootcamp = async (req, res, next) => {
    
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`), 404)
    }

    //Make sure user is bootcamp owner or admin 
    if (bootcamp.user.id.toString() !== req.params.id && req.user.role != 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`), 401)
    }


    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //returns a new version
        runValidators: true
    });


    res.status(200).json({success: true, data: bootcamp});
}




/**
 * @desc    Calculate radius
 * @route   /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Public 
*/
exports.getBootcampRadius = asyncHandler(async (req, res, next) => {
   
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

    
    
});




/**
 * @desc    Uplaod photo for bootcamp
 * @route   POST /api/v1/bootcamps/:id/photo
 * @access  Private 
*/
exports.photoUploadBootcamp = asyncHandler(async (req, res, next) => {
    console.log('id', req.params.id)
    const bc = await Bootcamp.findById(req.params.id);

    
    if (!bc){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`), 404)
    }

    //Make sure user is bootcamp owner or admin 
    if (bootcamp.user.id.toString() !== req.params.id && req.user.role != 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`), 401)
    }


    if (!req.files){
        return next(new ErrorResponse(`Please upload a file`), 400)
    }

    
    const file = req.files.file;
    //make sure the image is a foto

    console.log(file);
    console.log(file.mimetype.toString().startsWith('image'))

    if (!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`), 400)
    }
    
    //check file size
    if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
        let maxSize = Math.round(parseInt(process.env.MAX_UPLOAD_FILE_SIZE), 2);
        return next(new ErrorResponse(`Please upload an image less than ${maxSize} MB`), 400)
    }

    //create custom filename
    file.name = `photo_${bc._id}_${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async error => {
        if (error){
            return next(new ErrorResponse(`Error unploading file`), 400)
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name})

        res.status(200).json({
            success: true,
            data: file.name
        })

    });



});