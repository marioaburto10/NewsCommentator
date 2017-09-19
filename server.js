// Dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// Require request and cheerio to make the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

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

// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// Routes
// Index route
app.get('/', function(req, res) {
  res.send("index.html");
});

// Scrape route
app.get('/scrape', function(req, res){
  request('http://www.developer-tech.com/', function(error, response, html){
    var $ = cheerio.load(html);
    $('article h3').each(function(i, element){
      var result = {};

      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

      var newArticle = new Article (result);

      newArticle.save(function(err, doc){
        if(err){
          console.log(err);
        }
        else{
          console.log(doc);
        }
      });
    });
  });
  res.send("Scrape has been performed!");
  res.redirect("/");
});

app.get('/articles', function(req, res){
  Article.find({}, function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      res.json(doc);
    }
  });
});

app.get('/articles/:id', function(req, res){
  Article.findOne({'_id': req.params.id})

  .populate('note')
  .exec(function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      res.json(doc);
    }
  });
});

app.post('/articles/:id', function(req, res){
  var newNote = new Note(req.body);
  newNote.save(function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})

      .exec(function(err, doc){
        if(err){
          console.log(err);
        }
        else{
          res.send(doc);
        }
      });
    }
  });
});

// listen on port 3000
app.listen(3000, function() {
  console.log('The magic happens on port 3000!');
});
