var express = require('express');
var router = express.Router();

/* GET users listing. */
router.all('/', function(req, res, next) {
  res.render('Reg',{ title: '注册' });
});

module.exports = router;