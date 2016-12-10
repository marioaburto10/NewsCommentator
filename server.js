// Dependencies
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// initialize express app
var express = require('express');
var app = express();

// use morgan and bodyparser with this app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static(process.cwd() + '/public'));

// Handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Database configuration with mongoose
mongoose.connect('mongodb://localhost/newsCommentator');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// import routes
var routes = require('./controller/controller.js');
app.use('/', routes);

// listen on port 3000
var port = process.env.PORT || 3000
app.listen(port, function() {
  console.log('The magic happens on port 3000!');
});
