const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// bring in user model
let User = require('../models/user');
let Course = require('../models/course');

// Register Courses
router.post('/register',[
    check('code').isString(),
    check('title').isString(),
    check('duration').isString(),
    // check('time').isString(),
    check('venue').isString(),
    check('day').isString()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const code = req.body.code;
    const title = req.body.title;
    const duration = req.body.duration;
    const time = req.body.time;
    const venue = req.body.venue;
    const day = req.body.day;


let newCourse = new Course({
    code:code,
    title:title,
    duration:duration,
    time:time,
    venue:venue,
    day:day
});

newCourse.save(function(err){
    if(err){
        console.log(err);
        return;
    }else{
        req.flash('success','Course added successfully')
        res.redirect('/users/register');
    }
});

});

//Get Single Course
router.get('/:id',(req,res)=>{
    Course.findById(req.params.id,(err,course)=>{
            res.render('course',{
            title:'Courses',
            course:course
        });
    });
});


module.exports = router;