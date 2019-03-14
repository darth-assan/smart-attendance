const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');


module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy(function(username,password,done){
    // Match Username
    let query = {email:username};
    User.findOne(query,function(err,user){
        if(err) throw err;
        if (!user) return done(null, false,{ message: 'User not found.' });

        // Match Password
        bcrypt.compare(password,user.password,function(err,isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            }else{
                return done(null, false,{ message: 'Incorrect password.' });
            }
        });
    });
    }));

    passport.serializeUser(function(user,done){
        done(null,user._id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        });
    });
}