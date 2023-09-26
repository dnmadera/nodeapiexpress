const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')


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
exports.createBootcamp = async (req, res, next) => {   
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, count: bootcamp.length, data: bootcamp});
    } catch(error){
        next(error)
    }     
}


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
exports.putBootcamp = async (req, res, next) => {   
    try {
        const bootcamp = await Bootcamp.updateOne({_id: req.params.id}, req.body)
        res.status(200).json({success: true, data: bootcamp});
    } catch(error){
        next(error)
    }
}



/**
 * @desc    Updates a bootcamp
 * @access  Public 
*/
exports.patchBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.updateOne({_id: req.params.id}, req.body)
        res.status(200).json({success: true, data: bootcamp});
    } catch(error){
        next(error)
    }
}