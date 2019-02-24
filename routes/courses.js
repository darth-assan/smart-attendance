const express = require('express');
const router = express.Router();
const passport = require('passport');

// bring in user model
let User = require('../models/user');
let Course = require('../models/course');

//Get Single Course
router.get('/:id',(req,res)=>{
    Course.findById(req.params.id,(err,course)=>{
            res.render('course',{
            course:course
        });
    });
});

module.exports = router;