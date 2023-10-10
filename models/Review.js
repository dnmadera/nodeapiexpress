const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxLength: 100
    },
    text: {
        type: String,
        trim: true,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,        
        min: 1,
        max: 10,
        required: [true, 'Please enter a rating']
    },
   
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    //user relationship
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
});



module.exports = mongoose.model('Review', ReviewSchema);