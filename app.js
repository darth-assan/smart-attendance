const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');

// Database connection
const config = require('./config/database')
mongoose.connect(config.database,{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
let db = mongoose.connection;

// Check database connection
db.once('open', function(){
    console.log('Connection to MongoDB established successfully');
});

//check for db errors
db.on('error',function(err){
    console.log(err);
});

// Init App
const app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Express Flash Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
 
// parse application/json
app.use(bodyParser.json());

// Cookie Parser
app.use(require('cookie-parser')());

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));


// Custom Flash Messages
app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

//Home route
app.get('/',(req,res)=>{
    res.render('login',{
        title:'Login',
    });
});

// Route Files
let users = require('./routes/users');
let courses = require('./routes/courses');
let api = require('./api/api');

app.use('/users', users);
app.use('/courses',courses);
app.use('/api',api);

// Start Server
app.listen(3000,()=>{
    console.log('Server Started on port 3000....');
});