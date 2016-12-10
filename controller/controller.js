// dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

// Require request and cheerio to make the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// Bring in Note and Article models
var Note = require('../models/Note.js');
var Article = require('../models/Article.js');

// Index page
router.get('/', function(req, res) {
  res.redirect('/articles');
});

// Scrape route: GET request to scrape developer-tech.com
router.get('/scrape', function(req, res){
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
  res.redirect('/articles');
});

// Article route: will grab every article to populate DOM
router.get('/articles', function(req, res){
  Article.find({}, function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      var article_ = {article: doc};
      res.render('index', article_);
    }
  });
});

// Route to grab particular article based on ID
router.get('/articles/:id', function(req, res){
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

// POST Route replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
router.post('/articles/:id', function(req, res){
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
          res.json(doc);
        }
      });
    }
  });
});

module.exports = router;