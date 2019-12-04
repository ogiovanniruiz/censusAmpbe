var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/healthCheck', function(req,res){
  res.sendStatus(200);
})

module.exports = router;
