
const express = require('express');
const morgan = require('morgan')
const colors = require('colors')
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

//loads env vars
dotenv.config({ path: './config/config.env'});



const bootcampsRouter = require('./routes/bootcamps')


//DB connection
connectDB();

const app = express();


//body parser
app.use(express.json())




//dev loggin middleware
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'))



//mount routers
app.use('/api/v1/bootcamps', bootcampsRouter);


//middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);


//Handle unhandled rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold)
    server.close(() => process.exit(1))
    });
