var express = require("express");
var passwordless = require("passwordless");
var bodyParser = require("body-parser");
var email = require("emailjs");
var oauthserver = require("oauth2-server");
var MongoStore = require("passwordless-mongostore");
var mongoose = require('mongoose');
var Nexmo = require("simple-nexmo")


var nexmo = new Nexmo({
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    baseUrl: 'API_BASE_URL',
    useSSL: true,
    debug: false
});

var uristring = 'mongodb://localhost/health';


var smtpUser = "";
var smtpPassword = "";
var smtpHost = "";

var smtpServer  = email.server.connect({
    user:    smtpUser,
    password: smtpPassword,
    host:    smtpHost,
    ssl:     true
});

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

passwordless.init(new MongoStore(uristring))

passwordless.addDelivery('email',
    function(tokenToSend, uidToSend, recipient, callback) {
        var host = 'localhost:3000';
        smtpServer.send({
            text:    'Hello!\nAccess your account here: http://'
            + host + '?token=' + tokenToSend + '&uid='
            + encodeURIComponent(uidToSend),
            from:    yourEmail,
            to:      recipient,
            subject: 'Token for ' + host
        }, function(err, message) {
            if(err) {
                console.log(err);
                return callback(err);
            }
            callback(message);
        });
    });

passwordless.addDelivery('sms',
    function(tokenToSend, uidToSend, recipient, callback) {
        //here to be changed sms headers as wished
        options.from = "Company"
        options.to = recipient;
        //type can be also changed to text
        options.type = 'unicode'
        options.text = "Your login token is: "+tokenToSend+" your uid is "+uidToSend
        nexmo.sendSMSMessage(options, function(err){
            if (err){
                console.log(err);
            }
            callback();
        })
    });


var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));

app.oauth = oauthserver({
    model: require("./lib/oautModel"),
    grants: ['password'],
    debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
});

app.use(app.oauth.errorHandler());

app.get('/logged_in', passwordless.acceptToken(),
    function(req, res) {
        res.render('homepage');
    });

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/sendtoken',
    passwordless.requestToken(
        function(user, delivery, callback, req) {
            User.find({email: user}, function(ret){
                if(ret){
                    callback(null, ret.id);
                }else{
                    callback(null, null)
                }
            })
        }),
    function(req, res) {
        res.render('secondstep', { uid: req.passwordless.uidToAuth });
    });

router.get('/restricted', passwordless.restricted(),
    function(req, res) {

    });

app.listen(3000);


