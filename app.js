var express = require('express'),
path = require('path'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
exphbs = require('express-handlebars'),
expressValidator = require('express-validator'),
flash = require('connect-flash'),
session = require('express-session');
passport = require('passport'),
localStrategy = require('passport-local').Strategy,
mongo = require('mongodb');
mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/maeve',{ useNewUrlParser: true }),
db = mongoose.connection,
routes = require("./routes/index"),
users = require('./routes/users');
calendar = require("./routes/calendar"),
webhook = require('./routes/webhook'),
request = require('request');



//webhook access page token

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;


// init app
var app = express();


// view engine
app.set('views',path.join(__dirname,'views'));
app.engine('handlebars',exphbs({defaultLayout:'layout',helpers: require('./public/js/helpers')}));
app.set('view engine', 'handlebars');



// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

// set static folder 
app.use(express.static(path.join(__dirname, 'public')));

// express session 
app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}));


//passport init
app.use(passport.initialize());
app.use(passport.session());


// express validator 
app.use(expressValidator({
    errorFormatter:function(param , msg , value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg , 
            value : value
        };
    }
}));

// connect flash
app.use(flash());

// global vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null ;
    res.locals.db_duplicates = req.flash('db_duplicates');
    
    next();
});


app.use("/" , routes);
app.use("/users",users);
app.use("/calendar",calendar);
app.use("/webhook",webhook);
app.get("*",function(req,res){
    res.redirect('/');
});


app.use(function(err,req,res,next){
    console.log(err)
});

// set port 
app.set('port',(process.env.PORT) || 3000);

app.listen(app.get('port'),()=>{
    console.log("Server started on port " + app.get('port'));
});