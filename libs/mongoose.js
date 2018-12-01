const mongoose = require('mongoose');
const log = require('./log')(module);
const config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoose:uri'),  { useNewUrlParser: true });

var db = mongoose.connection;


const Schema =  mongoose.Schema;

let Images = new Schema({
    kind: {
        type: String,
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true }
});

let  Article = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    //images: [Images],
    modified: { type: Date, default: Date.now }
});

Article.path('title').validate(v => {
    return v.length > 5 && v.length < 70;
});


module.exports = mongoose.model('Article', Article);