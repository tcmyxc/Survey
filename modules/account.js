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
    	        	var status = 1;// 用户名已存在
    	        	callback(undefined, status);
    	        } else {
    	            var sql = 'select * from user where email=?';
    	            db.query(sql, email, function(err, data) {
    	                if (err) {
    	                    throw err;
    	                } else {
    	                    if (data.length > 0) {
    	                    	var status = 2;// 邮箱已存在
    	                    	callback(undefined, status);
    	                    } else {
    	                        var sql = 'insert into user(username, password, email) values (?, ?, ?)';
    	                        db.query(sql, [username, pwd, email], function(err, data) {
    	                            if (err) {
    	                                console.log('添加失败\n', err);
    	                                throw err;
    	                            } else {
    	                            	var status = 3;// 添加成功
    	                            	callback(undefined, status);
    	                            }
    	                        });
    	                    }
    	                }
    	            });
    	        }
    	    }
    	});
    	db.end();// 关闭数据库连接
    } catch (err) {
        callback(err);
    }
};