const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,        
        required: [true, 'Please enter a number of weeks']
    },
    tuition: {
        type: Number,
        trim: true,
        required: [true, 'Please enter a tuition cost']
    },
    minimumSkill: {
        type: String,
        trim: true,
        required: [true, 'Please inter a skill'],
        enum: ['beginner','intermediate','advance']
    }, 
    schoolashipAvailable: {
        type: Boolean,
        default: false
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);