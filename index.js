var express = require("express");
var expressSession = require('express-session');
var bodyParser = require("body-parser");
var passwordless = require("passwordless");
var MongoStore = require("passwordless-mongostore");
var mongoose = require('mongoose');
var Nexmo = require("simple-nexmo");
var ejs = require("ejs");
var env = require('node-env-file');
    env(__dirname + '/.env');

var uristring = 'mongodb://localhost/health';

var nexmo = new Nexmo({
    apiKey      : process.env.NEXMO_API_KEY,
    apiSecret   : process.env.NEXMO_API_SECRET,
    baseUrl     : process.env.NEXMO_BASE_URL,
    useSSL      : true,
    debug       : true
});


var app = express();


passwordless.init(new MongoStore(uristring));
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
        console.log('SMS SERVICE')
        //here to be changed sms headers as wished
        var options = {};
        options.from = "Company"
        options.to = recipient;
        options.type = 'text'
        options.text = "Your login token is: "+tokenToSend+" your uid is "+uidToSend
        nexmo.sendSMSMessage(options, function(err){
            if (err){
                console.log(err);
            }
            callback();
        })
    },{ ttl: 1000*60*10 });



app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({secret: '42', saveUninitialized: false, resave: false}));


app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/overview' }));

console.log(process.env.NEXMO_BASE_URL);

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});
var User = require("./lib/userModel");
User.findOne({email: 'eivindingebrigtsen@gmail.com'}, function(err, res){
    console.log(err, res)
});




/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

/* GET restricted site. */
app.get('/restricted', passwordless.restricted(),
 function(req, res) {
  res.render('restricted', { user: req.user });
});

/* GET login screen. */
app.get('/login', function(req, res) {
  res.render('login', { user: req.user });
});

/* GET logout. */
app.get('/logout', passwordless.logout(),
    function(req, res) {
  res.redirect('/');
});

/* POST login screen. */
app.post('/sendtoken', 
    passwordless.requestToken(
        // Simply accept every user
        function(user, delivery, callback) {
            //callback(null, user);
            User.findOne({"email": user}, function(err, ret) {
                console.log('User.find', err, ret);
               if(ret){
                  callback(null, ret.id)
               }else{
                  callback(null, null)
               }
          })
        }),
    function(req, res) {
        res.render('secondstep', {uid: 'asd'});
});



app.listen(3000);