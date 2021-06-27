//Defines Depenences
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');

const { getCurNumOfTic, getAllTickets, getSevenDatesArr, getNumOfTicFLW } = require('./utils/ticket')

//Define port
const port = process.env.PORT;

const User = require('./api/models/user.model');
const Space = require('./api/models/space.model');

//Content
const app = express();

// Init space
const initSpace = async () => {
  const spaces = await Space.find();
  const date = new Date()

  if (spaces.length  === 0) {
    const space = new Space({
      name: 'UIT',
      parked: 0,
      avai: 500
    })
    await space.save()
  } else {
    const space = await Space.findOne({ name: 'UIT' });
    const date = new Date()
    const spaceDate = new Date(space.date)

    if (spaceDate.getDate() !== date.getDate() || spaceDate.getMonth() !== date.getMonth() || spaceDate.getFullYear() !== date.getFullYear()) {
      space.parked = 0;
      space.avai = 500;
      space.date = new Date()
      await space.save()
    }
  }
}

//Create a server
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  console.log('We have a new connection!!!')
  
  // Init data for admin
  socket.on('initial', async (callback) => {
    console.log('We have connection with app')
    initSpace()
    const users = await getUsersWithMS()
    const curTickets = await getCurNumOfTic()
    const allTickets = await getAllTickets()
    const dateArr = getSevenDatesArr().map(item => `${item.day}/${item.month}`)
    const lastTicketArr = await getNumOfTicFLW()
    const space = await Space.findOne({ name: 'UIT' });

    callback(users, curTickets, allTickets, dateArr, lastTicketArr, space)
  })

  socket.on('initialApp', () => {
    console.log('We have connection with app')
  })

  socket.on('disconnect', () => {
    console.log('User had left!!!');
  })
});

//Import file routes config ./api/routes/
const userRoutes = require('./api/routes/user.route');
const ticketRoutes = require('./api/routes/ticket.route');
const { getUsersWithMS } = require('./utils/user');

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
