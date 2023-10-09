const path = require('path')
const express = require('express');
const morgan = require('morgan')
const colors = require('colors')
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')



//loads env vars
dotenv.config({ path: './config/config.env'});



const bootcampsRouter = require('./routes/bootcamps')
const coursesRouter = require('./routes/courses')
const authRouter = require('./routes/auth')
const sandboxRouter = require('./routes/sandbox')

//DB connection
connectDB();

const app = express();



//body parser
app.use(express.json())

//coockie parser
app.use(cookieParser())




//dev loggin middleware
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));


//File uploading
app.use(fileUpload())

app.use(express.static(path.join(__dirname, 'public')))


//mount routers
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/sandbox', sandboxRouter);


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
