var express = require('express');
var router = express.Router();
var db = require("../modules/sqlcon");

/////////////////////////////////////////////
// 2020-03-13
//   - 暂时没有做身份认证
//   - 做了几个简单的界面
////////////////////////////////////////////

//主页
router.get('/', function(req, res, next) {
    if (req.session.userName) {
        var userName = req.session.userName;
    } else {
        var userName = "test";
        req.session.userName = userName;
    }
    res.render('../views/index', {
        title: "问卷网站|主页",
        userName: userName
    });
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

// 查看个人信息
router.get('/userInfo', function(req, res, next) {
    var userName = req.session.userName;
    //console.log(req.session);
    var sql = "select * from user where username=?";
    db.query(sql, [userName], function(err, data) {
        if (err) {
            console.log(err);
        } else {
            var email = data[0].email;
            res.render('../views/userInfo', {
                title: "个人信息",
                userName: userName,
                email: email
            });
        }
    });
});

//修改个人信息
router.post('/userInfo', function(req, res, next) {
    //console.log(req.body);
    //console.log(req.session.userName);
    var userName = req.session.userName;
    var email = req.body.email;
    var pwd = req.body.password;
    var sql = "update user set email=?, password=? where username=?";
    db.query(sql, [email, pwd, userName], function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/userInfo');
        }
    });
});

//登出
router.get('/logout', function(req, res, next) {
    res.send("<script>alert('登出成功！即将跳转到网站主页'); window.location.href='/';</script>");
});

//用户在创建表单页面刷新，则响应这个页面
router.get('/createQuestionnaire', function(req, res, next) {
    console.log(req.body);
    var qID = req.session.qID;
    console.log(qID);
    var userName = req.session.userName;
    var sql = "select * from (select * from questionnaire as a left join questions as b on a.id = b.questionnaire_id) as tmp where id = ?";
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("问题个数：" + data.length);
            var length = data.length;
            res.render('../views/createQuestionnaire', {
                title: "创建表单",
                questionnaireTitle: data[0].title,
                questionnaireDesc: data[0].desc,
                userName: userName,
                subQData: data,
                length: length
            });
        }
    });
});

//创建问卷
router.post('/createQuestionnaire', function(req, res, next) {
    console.log(req.body);
    // 如果用户在创建文卷界面刷新
    if (req.session.qID) {
        res.redirect("/createQuestionnaire");
    }
    // 如果是首次创建表单
    else {
        var owner = req.session.userName;
        var title = req.body.questionnaireTitle;
        var desc = req.body.questionnaireDesc;
        // desc 是保留字，需要加反引号
        var sql = "INSERT INTO questionnaire (title, `desc`, owner) VALUES (?, ?, ?)";
        db.query(sql, [title, desc, owner], function(err, data) {
            if (err) {
                console.log(err);
            } else {
                var sql = "SELECT LAST_INSERT_ID() as qID";
                db.query(sql, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        //console.log(data[0].qID);
                        req.session.qID = data[0].qID;
                        console.log(req.session.qID);
                        res.redirect("/createQuestionnaire");
                    }
                });
            }
        });
    }
});

// 添加问题
router.post('/addQuestion', function(req, res, next) {
    // 2020-03-23 下面的代码是复制创建问卷的，需要修改
    console.log(req.body);

    var qID = req.session.qID;
    var qType = req.body.questionType;
    var qMust = req.body.questionMust ? 1: 0;
    var qDesc = req.body.subQuestionDesc;

    if (qType == "1" || qType == "3") {
        var qOptions = JSON.stringify(req.body.options);
        console.log(qOptions);
        var sql = "insert into questions (questionnaire_id, q_type, q_must, q_desc, q_options) values (?,?,?,?,?)";
        db.query(sql, [qID, qType, qMust, qDesc, qOptions], function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/createQuestionnaire");
            }
        });
    }
    else{
        res.redirect("/createQuestionnaire");
    }
});
module.exports = router;