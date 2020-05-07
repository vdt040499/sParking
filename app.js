//Defines Depenences
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');

//Content
const app = express();

//Import file routes config ./api/routes/
const userRoutes = require('./api/routes/user.route')

//Connect to DB

// Atlas sParking team
// mongoose.connect(
//     'mongodb+srv://sparking:' +
//      process.env.MONGO_ATLAS_PW +
//      '@sparking-awyrr.mongodb.net/test',{
//          useNewUrlParser: true
//      }
// );

//Atlas VoTan
// mongoose.connect(
//     'mongodb+srv://admin:' +
//     process.env.MONGO_ATLAS_PW +
//     '@restapi-mfg8v.mongodb.net/test?retryWrites=true&w=majority',
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }  
// );

//Local
mongoose.connect('mongodb://localhost:27017/sParking',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

);
mongoose.Promise = global.Promise;

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(session({ secret: 'session secret key' }));
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST,PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes
app.use('/users', userRoutes);

//Catch 404 errors and forward then to error handler
app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status(404);
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//Module exports
module.exports = app;