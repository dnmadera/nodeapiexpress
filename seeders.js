const fs = require('fs')
const colors = require('colors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({path:'./config/config.env'});

//loads models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');


//Connect mongodb
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,            
    //useCreateIndex: true, //not compatible
    //useFindAndModify: false //not compatible
    
});


//read json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`));

const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        //await Course.create(courses);
        console.log('data imported... '.green.inverse)
        process.exit(0);
    } catch (error) {
        console.error('error'.red, error)
        process.exit(1);
    }
}



const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        console.log('data destroyed... '.cyan.inverse)
        process.exit(0);
    } catch (error) {
        console.error('error'.red, error)
        process.exit(1);
    }
}


if (process.argv[2] === '-i'){
    importData();
} else if (process.argv[2] === '-d'){
    deleteData();
}