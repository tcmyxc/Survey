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

//修改个人信息
router.post('/userInfo', function(req, res, next) {
    console.log(req.body);
    res.redirect('/userInfo');
});

//登出
router.get('/logout', function(req, res, next) {
    res.send("<script>alert('登出成功！即将跳转到网站主页'); window.location.href='/';</script>");
});

//创建表单
router.get('/createQuestionnaire', function(req, res, next) {
    console.log(req.body);
    res.render('../views/createQuestionnaire', {
        title: "创建表单",
        questionnaireTitle: req.body.questionnaireTitle,
        questionnaireDesc: req.body.questionnaireDesc
    });
});

router.post('/createQuestionnaire', function(req, res, next) {
    console.log(req.body);
    res.render('../views/createQuestionnaire', {
        title: "创建表单",
        questionnaireTitle: req.body.questionnaireTitle,
        questionnaireDesc: req.body.questionnaireDesc
    });
});
module.exports = router;