const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');


// bring in user model
let User = require('../models/user');
let Course = require('../models/course');


// Login Process
router.post('/login',function(req,res,next){
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect:'/',
        failureFlash: true
    })(req,res,next);
});

// Register Form
router.get('/register',function(req,res){
    res.render('register',{
        title:'Register',
        name:'registeration'
    });
});

// Register Process
router.post('/register',[
    check('email').isEmail(),
    check('name').isString(),
    check('password').isLength({min:5}),
    check('password2')
        .isLength({min:5})
        .custom((value,{req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const courses = req.body.value


let newUser = new User({
    email:email,
    name:name,
    password:password,
    courses:courses
});

bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(newUser.password,salt, function(err,hash){
        if(err){
            console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                res.redirect('/');
            }
        });
    });
});
});


// Get user dashboard
router.get('/dashboard',(req,res)=>{
    switch (new Date().getDay()) {
        case 1:
            Course.find({day:"MONDAY"},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('dashboard',{
                        title:"Dashboard",
                        name:"dashboard",
                        courses:data
                    });
                };
            });
            break;
        case 2:
            Course.find({day:"TUESDAY"},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('dashboard',{
                        title:"Dashboard",
                        name:"dashboard",
                        courses:data
                    });
                };
            });
            break;
        case 3:
            Course.find({day:"WEDNESDAY"},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('dashboard',{
                        title:"Dashboard",
                        name:"dashboard",
                        courses:data
                    });
                };
            });
            break;
        case 4:
            Course.find({day:"THURSDAY"},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('dashboard',{
                        title:"Dashboard",
                        name:"dashboard",
                        courses:data
                    });
                };
            });
            break;
        case 5:
            Course.find({day:"FRIDAY"},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('dashboard',{
                        title:"dashboard",
                        courses:data
                    });
                };
            });
            break;
        default:
            Course.find({ day: { $exists: false } } ,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('error',{
                        title:"Dashboard",
                        name:"dashboard",
                        msg:"No Courses Available on this day!!"
                    });
                };
            });

    };
});

// Profile
router.get('/profile',(req,res)=>{
    res.render('profile',{
        title:'Profile'
    });
});

// Logout
router.get('/logout',function(req,res){
    req.logout();
    // req.flash('success','You are logged out');
    res.redirect('/');
})

module.exports = router;