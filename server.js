//Defines Depenences
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');
const moment = require('moment');

const Ticket = require('./api/models/ticket.model')

//Define port
const port = process.env.PORT || 5000;

const User = require('./api/models/user.model');

//Content
const app = express();

//Create a server
const server = http.createServer(app);
const io = socketio(server);

//Get current the number of tickets
const getCurNumOfTic = async () => {
  const today = moment().startOf('day')

  const tickets = await Ticket.find({
    createdAt: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate()
    }
  })

  return tickets
}

//Get the number of tickets for specific date
const getSpecNumOfTic = async (day, month, year) => {
  const specDate = `${year}-${month}-${day}`
  const tickets = await Ticket.find({
    createdAt: {
      $gte: new Date(new Date(specDate).setHours(00, 00, 00)),
      $lt: new Date(new Date(specDate).setHours(23, 59, 59))
    }
  })

  return tickets
}

//Get array of dates for 7 days ago
const getSevenDatesArr = () => {
  const dateArr = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
    const dateObj = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    }
    dateArr.push(dateObj)
  }

  return dateArr
}

//Get the number of tickets for last weeks
const getNumOfTicFLW = async () => {
  const NumOfTicArr = []
  const dateArr = getSevenDatesArr()
  for (let i = 0; i < dateArr.length; i++) {
      const ticket = await getSpecNumOfTic(dateArr[i].day, dateArr[i].month, dateArr[i].year)
      NumOfTicArr.push(ticket.length)
  }

  return NumOfTicArr
}

io.on('connection', (socket) => {
  console.log('We have a new connection!!!')
  
  // Init data
  socket.on('initial', async (callback) => {
    const users = await User.find().select(['-password']);
    const curTickets = await getCurNumOfTic()
    const dateArr = getSevenDatesArr().map(item => `${item.day}/${item.month}`)
    const lastTicketArr = await getNumOfTicFLW()

    callback(users, curTickets, dateArr, lastTicketArr)
  })

  socket.on('disconnect', () => {
    console.log('User had left!!!');
  })
});

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
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.mfg8v.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    // `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.lrekd.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    // 'mongodb+srv://sparking:sparking@cluster0.lrekd.mongodb.net/test?retryWrites=true&w=majority',
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
    app.use(cors());
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
        
        // Make io accessible to our router
        app.use(function(req, res, next){
          req.io = io;
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
        
//Listen a port
server.listen(port, () => {
  console.log('Server is running on port ' + port);
});
