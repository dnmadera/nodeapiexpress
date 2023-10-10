const express = require('express')
const advancedResults = require('../middleware/advancedResults')
const Review = require('../models/Review')
const { protect, authorize } = require('../middleware/auth')
const { 
    getReviews    
} = require('../controllers/reviews');


const router = express.Router({ mergeParams: true});


router.route('/')
    .get(advancedResults(Review, {
        path: "bootcamp",
        select: "name description"
    }), getReviews)    
    

module.exports = router