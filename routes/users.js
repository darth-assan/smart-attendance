const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');


// bring in user model
let User = require('../models/user');
// bring in user model
let Course = require('../models/course');

// Login Process
router.post('/login',
    passport.authenticate('local',{failureFlash:true,failureRedirect:"/"}),
    function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    User.findById(req.user._id,(err,data)=>{
        if (err) throw err
        if(data.isAdmin === true){
            res.redirect('/users/admin/?_id=' + req.user._id);
        }else{
            res.redirect('/users/dashboard/?_id=' + req.user._id);
        }
    });  
    });

//Get admin page
router.get('/admin',(req,res)=>{
    User.find({},(err,data)=>{
        if (err) throw err
            Course.find({},(err,data2)=>{
                if (err) throw err
                    User.findById(req.user._id,(err,data3)=>{
                        if(err) throw err
                        res.render('admin',{
                            title:'Admin',
                            total_users: data.length,
                            total_courses: data2.length,
                            user_name:data3.name.lastName,
                            users:data,
                            courses:data2
                    });
            });
        });
    })
});

// Back door registertion used when all users are deleted from the db
// router.get('/test',(req,res)=>{
//     res.render('test')
// })


// Register Process
router.post('/register',[
    check('email').isEmail(),
    check('firstName').isString(),
    check('lastName').isString(),
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
        req.flash('danger','Something went wrong. Check your input and retry.');
        return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;


let newUser = new User({
    name:{
        firstName:firstName,
        lastName:lastName
    },
    email:email,
    password:password
});

bcrypt.genSalt(10,function(err,salt){
    if(err) throw err
    bcrypt.hash(newUser.password,salt, function(err,hash){
        if(err) throw err
        newUser.password = hash;
        newUser.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success','User added successfully')
                res.redirect('/users/admin');
            }
        });
    });
});
});

//Get Add Courses
router.get('/add_courses',(req,res)=>{
    User.findById(req.user._id,(err,data)=>{
        if(err) throw err
            Course.find({},(err,data1)=>{
                if (err) throw err
                res.render('add_courses',{
                    title: 'Add Courses',
                    isAdmin:data.isAdmin,
                    user_name:data.name.lastName,
                    courses: data1
                });
            });
    });
});

//Post courses selected
router.post('/add_courses',(req,res)=>{
    //let selected = req.body.selected
    // console.log(selected)
    [req.body.selected].forEach(element => {
        Course.findByIdAndUpdate(element,{assigned:req.user._id},(err)=>{
            if (err) throw err
        });
    });
    res.redirect('/users/dashboard');
});

// Get user dashboard
router.get('/dashboard',(req,res)=>{
    User.findById(req.user._id,(err,data)=>{
        if(err) throw err
            Course.find({assigned:req.user._id},(err,data1)=>{
                if (err) throw err
                res.render('dashboard',{
                    title: 'Dashboard',
                    isAdmin:data.isAdmin,
                    user_name:data.name.lastName,
                    courses:data1
                });
            });
    });
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
    res.redirect('/');
})

module.exports = router;