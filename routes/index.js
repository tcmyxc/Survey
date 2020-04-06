var express = require('express');
var router = express.Router();
var db = require("../modules/sqlcon");
var aModle = require("../modules/account");
var uuidV1 = require('uuid/v1');


/////////////////////////////////////////////
// 2020-04-03
//   + 已完成
//      - 注册、登录、修改密码、个人信息修改
//      - 创建文卷、添加问题
//   + 未完成
//      - 文卷发布
//      - 发布之后信息如何收集？
//      - 统计信息如何展示？
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
// router.post('/addUser', function(req, res, next) {
//     console.log(req.body);
//     var username = req.body.username;
//     var pwd = req.body.password;
//     var email = req.body.email;
//     var sql = 'select * from user where username=?';
//     db.query(sql, username, function(err, data) {
//         if (err) {
//             console.log(err);
//         } else {
//             if (data.length > 0) {
//                 return res.send("<script>alert('用户名已被占用!');window.location.href='/signin';</script>");
//             } else {
//                 var sql = 'select * from user where email=?';
//                 db.query(sql, email, function(err, data) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         if (data.length > 0) {
//                             return res.send("<script>alert('邮箱已被占用!');window.location.href='/signin';</script>");
//                         } else {
//                             var sql = 'insert into user(username, password, email) values (?, ?, ?)';
//                             db.query(sql, [username, pwd, email], function(err, data) {
//                                 if (err) {
//                                     console.log('添加失败\n', err);
//                                 } else {
//                                     var token = {
//                                         username: null,
//                                         email: null
//                                     };
//                                     token.username = username;
//                                     token.email = email;
//                                     req.session.token = token;

//                                     res.send("<script>alert('注册成功，点击进入网站！'); window.location.href='/home';</script>");
//                                 }
//                             });
//                         }
//                     }
//                 });
//             }
//         }
//     });
// });

// 添加用户，进一步分离了模块，暂时改造了一个
// 后面的函数看情况修改（已经写好的有时间再改，后面写的尽量分离）
// 2020-04-06 改为AJAX异步提交表单（有精力就改改，没时间就算了）
router.post('/addUser', function(req, res, next) {
    console.log(req.body);
    aModle.addUser(req, function(err, status) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            //console.log(status);

            if (status === 3) {
                var token = {
                    username: null,
                    email: null
                };
                token.username = req.body.username;
                token.email = req.body.email;
                req.session.token = token;
            }
            //console.log(req.session.token);
            return res.status(200).send({
                status: status
            });

            // if (status === 1) {
            //     return res.send("<script>alert('用户名已被占用!');window.location.href='/signin';</script>");
            // } else if (status === 2) {
            //     return res.send("<script>alert('邮箱已被占用!');window.location.href='/signin';</script>");
            // } else if (status === 3) {
            //     var token = {
            //         username: null,
            //         email: null
            //     };
            //     token.username = req.body.username;
            //     token.email = req.body.email;
            //     req.session.token = token;

            //     res.send("<script>alert('注册成功，点击进入网站！'); window.location.href='/home';</script>");
            // } else {
            //     return res.send("<script>alert('未知错误!');window.location.href='/signin';</script>");
            // }
        }
    });
});


// 登录表单提交
router.post('/login', function(req, res, next) {
    //console.log(req.body);
    var username = req.body.username;
    var passwprd = req.body.password;
    var sql = "select * from user where username=? and password=?";
    db.query(sql, [username, passwprd], function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else if (data.length > 0) {
            var token = {
                username: null,
                email: null
            };
            token.username = username;
            token.email = data[0].email;
            req.session.token = token;

            //console.log(req.session.token);
            //console.log(data[0]);
            res.redirect("/home");
        } else {
            res.send("<script>alert('请检查用户名或者密码!'); window.location.href='/login';</script>");
        }
    })
});

// 忘记密码页面
router.get('/findPWD', function(req, res, next) {
    res.render('../views/findPWD', {
        title: "密码找回",
    });
});

// 修改密码，表单提交
router.post('/findPWD', function(req, res, next) {
    var username = req.body.username;
    var pwd = req.body.password;
    var sql = "update user set password=? where username=?";
    db.query(sql, [pwd, username], function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            res.send("<script>alert('修改成功，进入登录页面!');window.location.href='/';</script>");
        }
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
    // 需要校验邮箱是否被占用以及更改前后邮箱是否相同
    var sql = 'select email from user where username=?';
    db.query(sql, username, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            // 邮箱相同
            //console.log(data);// 返回的是一个数组
            if (data.length > 0 && data[0].email == email) {
                return res.send("<script>alert('修改后的邮箱和原邮箱相同!');window.location.href='/userInfo';</script>");
            } else {
                var sql = 'select email from user where email=?';
                db.query(sql, email, function(err, data) {
                    if (err) {
                        console.log(err);
                        return res.send('<script>alert("服务器故障，请稍后重试")</script>');
                    } else {
                        // 邮箱被占用
                        if (data.length > 0) {
                            return res.send("<script>alert('邮箱被占用!');window.location.href='/userInfo';</script>");
                        } else {
                            var sql = "update user set email=?, password=? where username=?";
                            db.query(sql, [email, pwd, username], function(err, data) {
                                if (err) {
                                    console.log(err);
                                    return res.send('<script>alert("服务器故障，请稍后重试")</script>');
                                } else {
                                    req.session.token.email = email;
                                    res.redirect('/userInfo');
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

//登出
router.get('/logout', function(req, res, next) {
    req.session.destroy(); //销毁session
    res.send("<script>alert('登出成功！即将跳转到网站主页'); window.location.href='/';</script>");
});

//用户在创建表单页面刷新，则响应这个页面
router.get('/createQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var qID = req.session.token.qID;
    //console.log(qID);
    var username = req.session.token.username;
    var sql = "select * from (select * from questionnaire as a left join questions as b on a.id = b.questionnaire_id) as tmp where id = ?";
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            //console.log("问题个数：" + data.length);
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
    //console.log(req.body);
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
                return res.send('<script>alert("服务器故障，请稍后重试")</script>');
            } else {
                //console.log('问卷ID:', data.insertId);// 直接获取问卷ID，调用data.insertId即可，不需要再次查询
                req.session.token.qID = data.insertId;
                //console.log(req.session.token.qID);
                res.redirect("/createQuestionnaire");
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

    //console.log(req.body);

    var qID = req.session.token.qID;
    var qType = req.body.questionType;
    var qMust = (req.body.questionMust == 'on') ? '1' : '0';
    var qDesc = req.body.subQuestionDesc;

    if (qType == "1" || qType == "3") {
        var qOptions = JSON.stringify(req.body.options);
        //console.log(qOptions);
        var sql = "insert into questions (questionnaire_id, q_type, q_must, q_desc, q_options) values (?,?,?,?,?)";
        db.query(sql, [qID, qType, qMust, qDesc, qOptions], function(err, data) {
            if (err) {
                console.log(err);
                return res.send('<script>alert("服务器故障，请稍后重试")</script>');
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
                return res.send('<script>alert("服务器故障，请稍后重试")</script>');
            } else {
                res.redirect("/createQuestionnaire");
            }
        });

    } else if (qType == '4' || qType == '5') {
        var sql = "insert into questions (questionnaire_id, q_type, q_must, q_desc) values (?,?,?,?)";
        db.query(sql, [qID, qType, qMust, qDesc], function(err, data) {
            if (err) {
                console.log(err);
                return res.send('<script>alert("服务器故障，请稍后重试")</script>');
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
    // 将问卷状态设置为已发布，然后生成一个唯一码（暂时未做）
    var qID = req.session.token.qID ? req.session.token.qID : req.query.qID;
    var sql = "update questionnaire set status='1' where id=?";
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        }
    });

    req.session.token.qID = null; // 问卷发布之后将token里面的qID清掉

    var username = req.session.token.username;
    var URL = '127.0.0.1:3000/questionnaires?qID=' + qID;
    res.render('../views/questionaires/questionnaireURL', {
        title: "问卷链接",
        username: username,
        url: URL
    });
});

// 我的问卷
router.get('/myQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var username = req.session.token.username;
    var sql = "select * from questionnaire where owner=?";
    db.query(sql, username, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            //console.log("问题个数：" + data.length);
            var length = data.length;
            res.render('../views/questionaires/questionnaireList', {
                title: "我的问卷",
                username: username,
                data: data,
                length: length
            });
        }
    });
});

// 预览文卷
router.get('/viewQuestionnaire', function(req, res, next) {
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    var qID = req.query.qID;
    var URL = '127.0.0.1:3000/questionnaires?qID=' + qID;
    var username = req.session.token.username;
    var sql = "select * from (select * from questionnaire as a left join questions as b on a.id = b.questionnaire_id) as tmp where id = ?";
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            //console.log("问题个数：" + data.length);
            var length = data.length;
            res.render('../views/questionaires/questionnaire', {
                title: "问卷预览",
                questionnaireTitle: data[0].title,
                questionnaireDesc: data[0].desc,
                username: username,
                subQData: data,
                length: length,
                url: URL
            });
        }
    });
});

// 问卷填写
router.get('/questionnaires', function(req, res, next) {
    var qID = req.query.qID;
    var sql = "select * from (select * from questionnaire as a left join questions as b on a.id = b.questionnaire_id) as tmp where id = ?";
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            //console.log("问题个数：" + data.length);
            var length = data.length;
            // 不存在这个问卷
            if (length == 0) {
                return res.send("<script>alert('请检查网址是否输入正确');</script>");
            }

            // 如果查询结果为空，那就不存在状态，所以这个判断要写在下面
            var status = data[0].status;
            if (status == 0) {
                return res.send("<script>alert('请检查网址是否输入正确');</script>");
            }
            if (status == 2) {
                return res.send("<script>alert('问卷已停止收集');</script>")
            }
            res.render('../views/questionaires/fillQuestionnaire', {
                title: "问卷填写",
                questionnaireTitle: data[0].title,
                questionnaireDesc: data[0].desc,
                subQData: data,
                length: length,
                qID: qID,
                url: URL
            });
        }
    });
});

// 问卷填写的数据，post提交
router.post('/questionnaires', function(req, res, next) {
    // console.log(req.body);
    // console.log(typeof req.body);// object
    var qID = req.body.qID;
    delete req.body.qID;
    console.log(req.body);
    var q_data = JSON.stringify(req.body);
    console.log(q_data);
    var sql = 'insert into q_data (q_id, data) values (?, ?)';
    db.query(sql, [qID, q_data], function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            return res.send("<script>alert('感谢您的填写');</script>")
        }
    });
});

// 查看问卷填写结果
router.get('/questionnaireResult', function(req, res, next) {
    var qID = req.query.qID;
    var questionnaireTitle = null;
    var questionnaireDesc = null;
    var sql = 'select * from questionnaire where id=?';
    db.query(sql, qID, function(err, data) {
        if (err) {
            console.log(err);
            return res.send('<script>alert("服务器故障，请稍后重试")</script>');
        } else {
            console.log(data);
            questionnaireTitle = data[0].title;
            questionnaireDesc = data[0].desc;
            var sql = 'select data from q_data where q_id =?';
            db.query(sql, qID, function(err, data) {
                if (err) {
                    console.log(err);
                    return res.send('<script>alert("服务器故障")</script>');
                } else {
                    //console.log(typeof data);
                    //console.log(JSON.parse(JSON.stringify(data)));

                    // 先去除ROWDATA，然后只取出来Data的值，也就是填写的内容
                    data = JSON.parse(JSON.stringify(data));
                    for (var i = 0; i < data.length; i++) {
                        data[i] = JSON.parse(JSON.stringify(data[i].data));
                        console.log(data[i]);
                    }
                    //console.log(typeof data);

                    res.render('../views/questionaires/questionnaireResult', {
                        title: "问卷结果",
                        qID: qID,
                        username: req.session.token.username,
                        questionnaireTitle: questionnaireTitle,
                        questionnaireDesc: questionnaireDesc,
                        data: data
                    });
                }
            });
        }
    });
});

module.exports = router;