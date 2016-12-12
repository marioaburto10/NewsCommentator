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
  // Scrape data
  res.redirect('/scrape');
});

// Scrape route: GET request to scrape developer-tech.com
router.get('/scrape', function(req, res){
  // grab html of www.developer-tech.com
  request('http://www.developer-tech.com/', function(error, response, html){
    // save html into $ for shorthand selector
    var $ = cheerio.load(html);
    // grab every article with an h3
    $('article h3').each(function(i, element){
      var result = {};
      // save article titles and links
      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

      // create new article entry with Article model
      var articleEntry = new Article (result);

      // save new entry to db
      articleEntry.save(function(err, doc){
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
  // Find all articles and sort them in descending order
  Article.find().sort({_id: -1})

  // populate notes associated with articles
  .populate('notes')

  // send them to handlebars to render them
  .exec(function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      var hbsObject = {articles: doc}
      res.render('index', hbsObject)
    }
  })
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
router.post('/add/note/:id', function(req, res){
  // create new note using Note model
  var noteEntry = new Note(req.body);
  // save new note to db
  noteEntry.save(function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      // if a note exists already, update it
      Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})

      .exec(function(err, doc){
        if(err){
          console.log(err);
        }
        else{
          res.sendStatus(200);
        }
      });
    }
  });
});

module.exports = router;