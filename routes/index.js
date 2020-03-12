var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('../views/index', { title: "问卷网站|首页" });
});

module.exports = router;
