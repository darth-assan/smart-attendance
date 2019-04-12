const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');


// bring in user model
let User = require('../models/user');
// bring in courses model
let Course = require('../models/course');
// bring in attendance model
let Attendance = require('../models/attendance');

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
                        if(err) throw new Error("BROKEN");
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
    check('password2').isLength({min:5})
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
        if(err)  new Error("BROKEN");
            Course.find({},(err,data1)=>{
                if (err) throw err
                req.flash('warning','DISABLED COURSES HAVE ALREADY BEEN ASSIGNED TO OTHER USER')
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
router.post('/add_courses',[check('selected').exists()],(req,res)=>{
    // Checking for error (empty submission)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('danger','No course(s) selected.');
        res.redirect('/users/admin/?_id='+ req.user._id);
    }else{
        let selected = req.body.selected;

        if(Array.isArray(selected) == true){
            req.body.selected.forEach(element => {
                Course.findByIdAndUpdate(element,{assigned:req.body.user},(err)=>{
                    if (err) throw err
                });
            });
            req.flash('success','Courses assigned successfully')
            res.redirect('/users/admin/?_id='+ req.user._id);
        }else{
            [req.body.selected].forEach(element => {
                Course.findByIdAndUpdate(element,{assigned:req.body.user},(err)=>{
                    if (err) throw err
                });
            });
            req.flash('success','course assigned successfully')
            res.redirect('/users/admin/?_id='+ req.user._id);
        }
    }
});

//Load user edit form (admin)
router.get('/edit/:id', (req,res)=>{
    User.findById(req.params.id,(err,data)=>{
        if (err) throw err
        User.findById(req.user._id,(err,result)=>{
            if (err) throw err
            if(result.isAdmin == false){
                req.flash('danger','Not Authorized');
                res.redirect('/');
            }else{
                res.render('edit_user',{
                    title:'Edit User',
                    user:data,
                    user_name:result.name.lastName
                });
            }
        });
    });
});

//Update user edit post (admin)
router.post('/edit/:id',[
    check('email').isEmail(),
    check('firstName').isString(),
    check('lastName').isString(),
    check('passwordReset').isString()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('danger','Something went wrong. Check your input and retry.');
        return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password =req.body.passwordReset;

    let user = {
        name:{
            firstName:firstName,
            lastName:lastName
        },
        email:email,
        password:password
    }

    bcrypt.genSalt(10,function(err,salt){
        if(err) throw err
        if(user.password == "true"){
            user.password = user.name.firstName + user.name.lastName;
            console.log(password)

            bcrypt.hash(user.password,salt, function(err,hash){
                if(err) throw err
                user.password = hash;
                let query = {_id:req.params.id}
    
                User.update(query,user,(err)=>{
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success','Updated Successfully')
                        res.redirect('/users/edit/'+req.params.id)
                    }
                })
            });
        }
    });
 });

// Delete user (Admin)
router.delete('/delete/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }

    User.findById(req.params.id,function(err,data){
        if (err) throw err
        User.findById(req.user._id,(err,result)=>{
            if (err) throw err
            if(result.isAdmin == false){
                req.flash('danger','Not Authorized');
                res.redirect('/');
            }else{
            let query = {_id:req.params.id}
            User.remove(query,(err)=>{
                if(err) throw err
                res.send('Success');
            });
        }
    });
});
});

// Get user dashboard
router.get('/dashboard', async (req,res)=>{

    const user = await  User.findById(req.user._id);
    const courses = await Course.find({assigned:req.user._id});

    res.render('dashboard',{
        title: 'Dashboard',
        isAdmin:user.isAdmin,
        user_name:user.name.lastName,
        courses:courses
    });
});

// Profile
router.get('/profile/:id',(req,res)=>{
    User.findById(req.params.id,(err,user)=>{
        if(err) throw new Error("BROKEN");
        Course.find({assigned:req.params.id},(err,courses)=>{
            if (err) throw err
            res.render('profile',{
                title: 'Profile',
                isAdmin:user.isAdmin,
                user_name:user.name.lastName,
                courses:courses,
                user:user
            });
        });
    });
});

//Update profile (user)
router.post('/edit_profile/:id',[
    check('email').isEmail(),
    check('firstName').isString(),
    check('lastName').isString()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('danger','Something went wrong. Check your input and retry.');
        return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    let user = {
        name:{
            firstName:firstName,
            lastName:lastName
        },
        email:email
    }
    let query = {_id:req.params.id}
    
    User.update(query,user,(err)=>{
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success','Profile Update Successful')
            res.redirect('/users/profile/'+req.params.id)
        }
    });
 });

// Update password
router.post('/update_password/:id',[
    check('currentPass').exists(),
    check('newPass').isLength({min:5}),
    check('newPass2').isLength({min:5})
        .custom((value,{req}) => {
            if (value !== req.body.newPass) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        req.flash('danger','Password Update Error: New password do not match.');
        res.redirect('/users/profile/'+req.params.id);
    }else{

        const currentPass = req.body.currentPass;
        const newPass = req.body.newPass;

        // Check current password
        User.findById(req.params.id,(err,data)=>{
            if (err) throw err
            // Match Password
            bcrypt.compare(currentPass,data.password,function(err,isMatch){
                if(err) throw err
                if(isMatch){
                    // Hash new password
                    bcrypt.hash(newPass,10,function(err,hash){
                        if(err) throw err
                        User.findByIdAndUpdate(req.params.id,{password:hash},(err)=>{
                            if(err) throw err;
                            req.flash('success','Password Update Successful');
                            res.redirect('/users/profile/'+req.params.id);
                        });
                    });
                }else{
                    req.flash('danger','Password Update Error: Current password Error. Try again !!');
                    res.redirect('/users/profile/'+req.params.id);
                }
            });
        });
    }
 });

// Delete user (Admin)
router.delete('/delete/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }

    User.findById(req.params.id,function(err,data){
        if (err) throw err
        User.findById(req.user._id,(err,result)=>{
            if (err) throw err
            if(result.isAdmin == false){
                req.flash('danger','Not Authorized');
                res.redirect('/');
            }else{
            let query = {_id:req.params.id}
            User.remove(query,(err)=>{
                if(err) throw err
                res.send('Success');
            });
        }
    });
});
});

// Logout
router.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
})

module.exports = router;