const path = require('path')
const express = require('express');
const morgan = require('morgan')
const colors = require('colors')
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

//loads env vars
dotenv.config({ path: './config/config.env'});



const bootcampsRouter = require('./routes/bootcamps')
const coursesRouter = require('./routes/courses')
const authRouter = require('./routes/auth')
const sandboxRouter = require('./routes/sandbox')
const usersRouter = require('./routes/users')
const reviewsRouter = require('./routes/reviews')

//DB connection
connectDB();

const app = express();


//SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); // Importa el archivo de configuración de Swagger

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




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

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000,
    max: 100
})

app.use(limiter) 

// Prevent HTTP parameter pollution
app.use(hpp())

// Enable CORS
app.use(cors())

//mount routers
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/sandbox', sandboxRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);






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
