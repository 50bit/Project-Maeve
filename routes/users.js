var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
mongoose = require('mongoose');
db = mongoose.connection;
var User = require('../models/user');




// Register
router.get('/register', function (req, res) {
    res.render('register');
});

// Login
router.get('/login', function (req, res,next) {

    res.render("login");

    // res.render("login")
    

    // // Authorization Code should be generated per user by the developer. This will 
    // // be passed to the Account Linking callback.
    
    // var authCode = "1234567890";
    // //var authCode = req.user._id ;

    // // Redirect users to this URI on successful login
    // var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

    // console.log("accountLinkingToken : " + accountLinkingToken);
    // console.log("\n redirectURI : " + redirectURI);
    // console.log("\n redirectURISuccess : " + redirectURISuccess);

    // if(accountLinkingToken){
    //     res.redirect(redirectURISuccess);
    // }
    // else{
    //     res.render('login', {
    //         accountLinkingToken: accountLinkingToken,
    //         redirectURI: redirectURI,
    //         redirectURISuccess: redirectURISuccess
    //     });
    // }
    
    
    
});

// Register User
router.post('/register', function (req, res,next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confPassword = req.body.confPassword;
    
    req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password','password should be at least 8 charchaters').isLength({min:8});
    req.checkBody('confPassword', 'Passwords do not match').equals(req.body.password);
    

    
    var errors = req.validationErrors();

    
    
    if(errors){
        res.render('register',{
            errors:errors
        })
    }else{
        
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        
        User.createUser(newUser,(err,user)=>{
            if(err){
                
                req.flash('db_duplicates','Username or Email is already taken');
                res.redirect("/users/register");
            }
            else{
                console.log(user);
                req.flash('success_msg','You registered successfully');
                res.redirect("/users/login");
            }
            
        });
        

        
    }

    console.log(name);
});





passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
        });
    }
));

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
        done(err, user);
	});
});





router.post('/login',function(req, res, next) {
	// passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
	// function (req, res) {
        
    //     res.redirect('/');
    var url =req.url;
    console.log("req url : " + url+"\n\n\n");
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/users/login'); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res, next);
		
});


router.get('/logout',function(req,res){
    req.logOut();
    req.flash('success_message','you are logged out');
    res.redirect('/users/login')
});


router.get('/auth',(req,res)=>{
    var accountLinkingToken = req.query.account_linking_token;
    var redirectURI = req.query.redirect_uri;

    if(req.user && accountLinkingToken && redirectURI){
        // successfully redirect to facebook and pass user._id as auth_code 
        var authCode = req.user._id;
        var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;
        console.log("authCode = " + authCode+ "\n\n\n")
        res.redirect(redirectURISuccess);
    }
    else{
        //redirect to /users/login and passing it the uri query  
        res.render("auth")
    }
});

router.post('/auth',(req,res,next)=>{
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('back'); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('back');
        });
      })(req, res, next);
});



module.exports = router;