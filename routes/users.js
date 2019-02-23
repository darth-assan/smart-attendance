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
        failureFlash: false
    })(req,res,next);
});

// Register Form
router.get('/register',function(req,res){
    res.render('register');
});

// Register Process
router.post('/register',[
    check('email').isEmail(),
    check('fname').isAlpha(),
    check('lname').isAlpha(),
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
    const firstname = req.body.fname;
    const lastname = req.body.lname;
    const password = req.body.password;


let newUser = new User({
    email:email,
    firstname:firstname,
    lastname:lastname,
    password:password,
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
    Course.find({},(err,data)=>{
        if(err){
            console.log(err);
        }else{
            res.render('dashboard',{
                courses:data
            });
        };
    });
});

module.exports = router;