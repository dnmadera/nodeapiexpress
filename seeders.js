const fs = require('fs')
const colors = require('colors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({path:'./config/config.env'});

//loads models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');


//Connect mongodb
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,            
    //useCreateIndex: true, //not compatible
    //useFindAndModify: false //not compatible
    
});


//read json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`));

const importData = async () => {
    try {
        await createModel(Bootcamp, bootcamps);
        await createModel(Course, courses);
        await createModel(User, users);
        await createModel(Review, reviews);
        

        console.log('data imported... '.green.inverse)
        process.exit(0);
    } catch (error) {
        console.error('error'.red, error)
        process.exit(1);
    }
}


const createModel = async (model, data) => {
    console.log('init data imported ... '.green, model)
    await model.create(data);
    console.log('end data imported... '.green.inverse, model)
}



const deleteData = async () => {
    try {
        await deleteManyModel(Bootcamp);
        await deleteManyModel(Course);
        await deleteManyModel(User);
        await deleteManyModel(Review);
        
        console.log('data destroyed... '.cyan.inverse)
        process.exit(0);
    } catch (error) {
        console.error('error'.red, error)
        process.exit(1);
    }
}

const deleteManyModel = async (model) => {
    console.log('init data destroyed... '.gray, model)
    await model.deleteMany();
    console.log('end data destroyed... '.gray.inverse, model)
}


if (process.argv[2] === '-i'){
    importData();
} else if (process.argv[2] === '-d'){
    deleteData();
}