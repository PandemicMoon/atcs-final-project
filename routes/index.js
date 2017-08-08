var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chat', bodyClass: 'index', url: req.protocol + "://" + req.get('host') });
});

router.get('/chat/:id', function(req, res, next) {
  res.render('chat', { title: 'Chat', chatId: req.params.id, bodyClass: 'chat' });
});

router.get('/chat/', function (req, res, next) {
  res.redirect('/');
});

module.exports = router;
