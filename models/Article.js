// require mongoose
var mongoose = require('mongoose');
// create Schema class
var Schema = mongoose.Schema;

// Create article scheema
var ArticleSchema = new Schema({
  title: {
    type:String,
    required:true
  },
  link: {
    type:String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }
});

// Create Article model
var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;