//Defines Depenences
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');

//Content
const app = express();

//Import file routes config ./api/routes/
const userRoutes = require('./api/routes/user.route');
const ticketRoutes = require('./api/routes/ticket.route');

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

mongoose
  .connect(
    // `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.mfg8v.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    // `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.lrekd.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    'mongodb+srv://sparking:sparking@cluster0.lrekd.mongodb.net/test?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log('Database connected!');
  });

//Local
// mongoose.set('useCreateIndex', true);
// mongoose.connect('mongodb://localhost:27017/sParking', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, err => {
//     if(err) throw err
//     console.log('Connect MongoDB Successfully!')
// });
mongoose.Promise = global.Promise;

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(
  session({
    secret: 'session secret key',
    resave: true,
    saveUninitialized: true,
  })
);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST,PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

//Routes
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);

//Catch 404 errors and forward then to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

//Module exports
module.exports = app;
