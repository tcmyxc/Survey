const db = require('./sqlcon');

/**
 * 检查用户名或者邮箱是否存在
 * @author 徐文祥
 * @DateTime 2020-04-05
 */
exports.addUser = function(req, callback) {
    try {
        var username = req.body.username;
        var pwd = req.body.password;
        var email = req.body.email;
        var sql = 'select * from user where username=?';
        db.query(sql, username, function(err, data) {
            if (err) {
                throw err;
            } else {
                if (data.length > 0) {
                    var status = 1; // 用户名已存在
                    callback(undefined, status);
                } else {
                    var sql = 'select * from user where email=?';
                    db.query(sql, email, function(err, data) {
                        if (err) {
                            throw err;
                        } else {
                            if (data.length > 0) {
                                var status = 2; // 邮箱已存在
                                callback(undefined, status);
                            } else {
                                var sql = 'insert into user(username, password, email) values (?, ?, ?)';
                                db.query(sql, [username, pwd, email], function(err, data) {
                                    if (err) {
                                        console.log('添加失败\n', err);
                                        throw err;
                                    } else {
                                        var status = 3; // 添加成功
                                        callback(undefined, status);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    } catch (err) {
        callback(err);
    }
};

exports.loginRequired = function(req, res, next){
    // 如果用户未登陆但是访问了登陆之后才能看到的页面，则重定向到首页
    if (!req.session.token) {
        res.send("<script>alert('登录已过期，请重新登录!');window.location.href='/';</script>").end();
        return;
    }
    // 已登录，执行下一个中间件函数
    next();
};