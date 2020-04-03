var express = require('express');
var router = express.Router();
var db = require("../modules/sqlcon");
var uuidV1 = require('uuid/v1');

/////////////////////////////////////////////
// 2020-03-13
//   - 暂时没有做身份认证
//   - 做了几个简单的界面
////////////////////////////////////////////

//主页
router.get('/', function(req, res, next) {
    res.render('../views/index', {
        title: "问卷网站|主页",
    });
});

// 注册页面
router.get('/signin', function(req, res, next) {
    res.render('../views/signin', {
        title: "注册页面",
    });
});

// 注册表单信息提交
// 2020.04.03
router.post('/addUser', function(req, res, next) {
    console.log(req.body);
    var username = req.body.username;
    var pwd = req.body.password;
    var email = req.body.email;
    var sql = 'select * from user where username=?';
    db.query(sql, username, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                return res.send("<script>alert('用户名已被占用!');window.location.href='/signin';</script>");
            } else {
                var sql = 'select * from user where email=?';
                db.query(sql, email, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (data.length > 0) {
                            return res.send("<script>alert('邮箱已被占用!');window.location.href='/signin';</script>");
                        } else {
                            var sql = 'insert into user(username, password, email) values (?, ?, ?)';
                            db.query(sql, [username, pwd, email], function(err, data) {
                                if (err) {
                                    console.log('添加失败\n', err);
                                } else {
                                    var token = {
                                        username: null,
                                        email: null
                                    };
                                    token.username = username;
                                    token.email = email;
                                    req.session.token = token;

                                    res.send("<script>alert('注册成功，点击进入网站！'); window.location.href='/home';</script>");
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

// 登录表单提交
router.post('/login', function (req, res, next) {
    console.log(req.body);
    var username = req.body.username;
    var passwprd = req.body.password;
    var sql = "select * from user where username=? and password=?";
    db.query(sql, [username, passwprd], function (err, data) {
        if(err){
            console.log(err);
        }
        else if(data.length > 0){
            var token = {
                username: null,
                email: null
            };
            token.username = username;
            token.email = data[0].email;
            req.session.token = token;

            console.log(req.session.token);
            console.log(data[0]);
            res.redirect("/home");
        }
        else{
            res.send("<script>alert('请检查用户名或者密码!'); window.location.href='/login';</script>");
        }
    })
})
// 忘记密码页面
router.get('/findPWD', function(req, res, next) {
    res.render('../views/findPWD', {
        title: "密码找回",
    });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var username = req.session.token.username;
    res.render('../views/home', { 
        title: "Home",
        username: username
         });
});

//帮助页面
router.get('/help', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var username = req.session.token.username;
    res.render('../views/help', { 
        title: "帮助",
        username: username
         });
});

//联系我们
router.get('/contact', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var username = req.session.token.username;
    res.render('../views/contact', { 
        title: "联系我们",
        username: username
         });
});

// 查看个人信息
router.get('/userInfo', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }

    var username = req.session.token.username;
    var email = req.session.token.email;
    //console.log(req.session.token);

    res.render('../views/userInfo', {
        title: "个人信息",
        username: username,
        email: email
    });
    // var sql = "select * from user where username=?";
    // db.query(sql, [username], function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         var email = data[0].email;
    //         res.render('../views/userInfo', {
    //             title: "个人信息",
    //             username: username,
    //             email: email
    //         });
    //     }
    // });
});

//修改个人信息
router.post('/userInfo', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    //console.log(req.body);
    //console.log(req.session.token.username);
    var username = req.session.token.username;
    var email = req.body.email;
    var pwd = req.body.password;
    var sql = "update user set email=?, password=? where username=?";
    db.query(sql, [email, pwd, username], function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/userInfo');
        }
    });
});

//登出
router.get('/logout', function(req, res, next) {
    req.session.token.destroy();
    res.send("<script>alert('登出成功！即将跳转到网站主页'); window.location.href='/';</script>");
});

//用户在创建表单页面刷新，则响应这个页面
router.get('/createQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    console.log(req.body);
    var qID = req.session.token.qID;
    console.log(qID);
    var username = req.session.token.username;
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
                username: username,
                subQData: data,
                length: length
            });
        }
    });
});

//创建问卷
router.post('/createQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    console.log(req.body);
    // 如果用户在创建文卷界面刷新
    if (req.session.token.qID) {
        res.redirect("/createQuestionnaire");
    }
    // 如果是首次创建表单
    else {
        var owner = req.session.token.username;
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
                        req.session.token.qID = data[0].qID;
                        console.log(req.session.token.qID);
                        res.redirect("/createQuestionnaire");
                    }
                });
            }
        });
    }
});

// 添加问题
router.post('/addQuestion', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    // 2020-03-23 下面的代码是复制创建问卷的，需要修改
    console.log(req.body);

    var qID = req.session.token.qID;
    var qType = req.body.questionType;
    var qMust = (req.body.questionMust == 'on') ? '1' : '0';
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
    } else if (qType == '2') {
        var qLevel = req.body.radioLevel;
        var sql = "insert into questions (questionnaire_id, q_type, q_must, q_desc, q_level) values (?,?,?,?,?)";
        db.query(sql, [qID, qType, qMust, qDesc, qLevel], function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/createQuestionnaire");
            }
        });

    } else if (qType == '4' || qType == '5') {
        var sql = "insert into questions (questionnaire_id, q_type, q_must, q_desc) values (?,?,?,?)";
        db.query(sql, [qID, qType, qMust, qDesc], function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/createQuestionnaire");
            }
        });

    } else {
        res.redirect("/createQuestionnaire");
    }
});

// 发布问卷，先生成唯一码，然后发布问卷
router.get('/publishQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var qID = req.session.token.qID;
    console.log(qID);
    res.render('../views/tmp.ejs', {
        msg: '你好'
    });

});

module.exports = router;