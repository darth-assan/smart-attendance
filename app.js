const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database')
const expressLayouts = require('express-ejs-layouts');

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

app.use(expressLayouts);

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Home route
app.get('/',(req,res)=>{
        res.render('index',{
            title: 'Dashboard'
        });
    });

// Route Files
let students = require('./routes/students.js');
let courses = require('./routes/courses.js');
app.use('/student', students);
app.use('/course', courses);

// Start Server
app.listen(3000,()=>{
    console.log('Server Started on port 3000....');
})