var debug = require('debug')('app');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var _ = require('lodash');

var config = require('./config');
require('./models/_db');
var routor = require('./controllers/_routor');


var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;

var app = express();

// view engine setup
app.set('views', require('path').join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('./utils/ejs-mate'));
app.locals._layoutFile = 'layout.html';

app.use(require('serve-favicon')(__dirname + '/public/favicon.ico')); // favicon.icon
app.use(require('morgan')(config.express_logger_format)); // express logger
app.use(require('method-override')()); // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
app.use(require('response-time')()); // Returns middleware that adds a X-Response-Time header to responses.
app.use(require('body-parser').json()); // Node.js body parsing middleware.
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')(config.session_secret));
app.use(require('compression')()); // Node.js compression middleware.
app.use(session({
  secret: config.session_secret,
  store: new MongoStore({
    url: config.db
  }),
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());

// other middleware

// static dir
app.use(express.static(require('path').join(__dirname, 'public')));

// routor --> controller
app.use('/', routor);

//views  --  config
_.extend(app.locals, {
  config: config
});

// error handlers
if (config.debug) {
  app.use(require('errorhandler')());
} else {
  app.use(function (err, req, res, next) {
    return res.status(500).send('500 status');
  });
}

app.listen(config.port, function() {
  debug('Server listening on port %f in %d mode', config.port, app.settings.env);
});

module.exports = app;

// https setting
var https = require('https')
  , fs = require("fs");
var options = {
  key: fs.readFileSync('cert/privatekey.pem'),
  cert: fs.readFileSync('cert/certificate.pem')
};
https.createServer(options, app).listen(config.https_port, function () {
  debug('Https server listening on port ' + config.https_port);
});

if (require.main === module) {
  require('./models/topic').getTopicsLimit5w(function (err, data) {
    if (err) {
    } else {
    }
  });
}