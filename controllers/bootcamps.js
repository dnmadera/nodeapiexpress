const Bootcamp = require('../models/Bootcamp')


/**
 * @desc    Gets all the bootcamps
 * @access  Public 
*/
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({success: true, message: 'shows all bootcamps'});
}


/**
 * @desc    Gets single bootcamps
 * @access  Public 
*/
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `shows bootcamp id ${req.params.id} `});
}

/**
 * @desc    Creates new bootcamp
 * @access  Public 
*/
exports.createBootcamp = async (req, res, next) => {
    console.log(req.body)

    const bootcamp = await Bootcamp.create(req.body)


    res.status(201).json({success: true, data: bootcamp, message: 'creates new bootcamp'});
}

/**
 * @desc    Updates a bootcamp
 * @access  Public 
*/
exports.patchBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `updates bootcamps id ${req.params.id} `});
}

/**
 * @desc    Deteltes a bottcamp
 * @access  Public 
 * @param   {string} req.params.id - the resource id
 * @returns {string} the message of the result of the operation 
*/
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `deletes bootcamps id ${req.params.id}`});    
}


/**
 * @desc    Update bootcamp
 * @access  Public 
*/
exports.putBootcamp = (req, res, next) => {    
    res.status(200).json({success: true, message: `updates entire resource ${req.params.id} bootcamps`});
}
