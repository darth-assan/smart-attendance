const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database')

mongoose.connect(config.database);
let db = mongoose.connection;

// Check database connection
db.once('open', function(){
    console.log('Connected to MongoDB established');
})

//check for db errors
db.on('error',function(err){
    console.log(err);
});

// Init App
const app = express();

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Home route
app.get('/',(req,res)=>{
        res.render('index',{
            title: 'Dashboard'
        });
    });

// Route Files
let courses = require('./routes/courses.js');
app.use('/courses', courses);

// Start Server
app.listen(3000,()=>{
    console.log('Server Started on port 3000....');
})