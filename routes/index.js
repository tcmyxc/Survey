var express = require('express');
var router = express.Router();

/////////////////////////////////////////////
// 2020-03-13
//   - 暂时没有做身份认证
//   - 做了几个简单的界面
////////////////////////////////////////////

//主页
router.get('/', function(req, res, next) {
    res.render('../views/index', { title: "问卷网站|主页" });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
    res.render('../views/home', { title: "Home" });
});

//帮助页面
router.get('/help', function(req, res, next) {
    res.render('../views/help', { title: "帮助" });
});

//联系我们
router.get('/contact', function(req, res, next) {
    res.render('../views/contact', { title: "联系我们" });
});

//个人信息
router.get('/userInfo', function(req, res, next) {
    res.render('../views/userInfo', { 
    	title: "个人信息",
    	userName: "tcmyxc",
    	email: "tcmyxc@163.com"
    	 });
});

//登出
router.get('/logout', function(req, res, next) {
	res.send("<script>alert('登出成功！即将跳转到网站主页'); window.location.href='/';</script>");
});

module.exports = router;