const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const log = require('./libs/log')(module);
const config = require('./libs/config');
const ArticleModel = require('./libs/mongoose');

const app = express();
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
    res.status(404);
    log.debug('Not found URL: %s', req.url);
    res.send({error: 'Not found'});
})

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});

app.get('/api', function (req, res) {
    res.send('API is running');
});

app.get('/api/articles', function(req, res) {
    return ArticleModel.find(function (err, articles) {
        if (!err) {
            return res.send(articles);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.post('/api/articles', function(req, res) {
    let article = new ArticleModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description
    });
    console.log(article);
    article.save(function (err) {
        if (!err) {
            log.info("article created");
            return res.send({ status: 'OK', article:article });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            log.error('Internal error(%d): %s',res.statusCode,err.message);
        }
    });


});

app.get('/api/articles/:id', function(req, res) {
    return ArticleModel.findById(req.params.id, (err, article) => {
        console.log(req.params.id);
        if (!article) {
            return res.send({ statusCode: 404, error: 'Not found'})
        }
        if (!err) {
            return res.send({ status: 'OK', article: article} );
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    })
});

app.put('/api/articles/:id', function (req, res){
    return ArticleModel.findById(req.params.id, (err, article) => {
        console.log(req.params);
        if (!article) {
            res.send({ statusCode: 404, error: 'Not found' });
        }

        article.title = req.body.title,
        article.author = req.body.author,
        article.description = req.body.description
        return article.save(function (err) {
            if (!err) {
                log.info("article updated");
                return res.send({ status: 'OK', article:article });
            } else {
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s',res.statusCode,err.message);
            }
        });          
    })
});

app.delete('/api/articles/:id', function (req, res){
    return ArticleModel.findById(req.params.id, (err, article) => {
        if (!article) {
            res.send({ statusCode: 404, error: 'Not found' });
        }
        return article.remove(err => {
            if (!err) {
                log.info("article removed");
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        })
    })
});

console.log(config.get('port'))
app.listen(config.get('port'), () => {
    console.log('Express server listening on port ' + config.get('port'))
})