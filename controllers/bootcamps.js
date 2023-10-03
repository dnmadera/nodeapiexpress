const path = require('path')
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
        console.log(req.query)
        let query;

        //Copy query
        let reqQuery = { ...req.query }

        //Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];


        //Important: Loop over remove fields and delete from request query
        removeFields.forEach(param => delete reqQuery[param]);

        //create string query
        let queryStr = JSON.stringify(reqQuery)

        //Create operators $le, $gt...
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

        console.log(queryStr)

        //Find resources
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

        //Select fields if included
        if (req.query.select){
            const fields = req.query.select.split(',').join(' ')
            console.log(fields)
            query = query.select(fields)
        }

        //Sort fields if included
        if (req.query.sort){
            const sorts = req.query.select.split(',').join(' ')
            console.log(sorts)
            query = query.sort(sorts)
        } else {
            query = query.sort('-averageCost'); //by default descendant averageCost (-)
        }

        //Paginantion
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const startIndex = (page - 1) * limit;
        query.skip(startIndex).limit(limit);
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();


        //execute query
        const bootcamp = await query

        //pagination result
        const pagination = {};

        
        if (endIndex < total){
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0){
            pagination.prev = {
                page: page - 1,
                limit
            }
        }


        console.log('result'.red.bold, bootcamp)


        res.status(200).json({success: true, total: total, pagination, data: bootcamp});
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
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    console.log('id', req.params.id)
    const bc = await Bootcamp.findById(req.params.id);

    console.log('bootcamp', bc)

    if (!bc){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`), 404)
    }

    await bc.deleteOne()

    res.status(200).json({success: true, message: `deletes bootcamps id ${req.params.id}`});
    
});


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