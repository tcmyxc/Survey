const db = require('./sqlcon');
var md5 = require('md5');

exports.createQuestionnaire = function(req, callback) {
    try {
        var owner = req.session.token.username;
        var title = req.body.questionnaireTitle;
        var desc = req.body.questionnaireDesc;
        // desc 是保留字，需要加反引号
        var sql = "INSERT INTO questionnaire (title, `desc`, owner) VALUES (?, ?, ?)";
        db.query(sql, [title, desc, owner], function(err, data) {
            if (err) {
                throw err;
            } else {
                callback(undefined, data);
            }
        });
        
    } catch (err) {
        callback(err);
    }
};

exports.updateQuestionnaireStatusById = function(req, callback) {
	try {
		var qID = req.session.token.qID ? req.session.token.qID : req.query.qID;
		var status = req.query.status ? req.query.status : 1;
		var sql = "update questionnaire set status=? where id=?";
		db.query(sql, [status, qID], function(err, data) {
		    if (err) {
                throw err;
            } else {
                callback(undefined, data);
            }
		});   
	} catch (err) {
	    callback(err);
	}
};

exports.selectQuestionnaireByUsername = function(req, callback) {
	try {
		var username = req.session.token.username;
		var sql = "select * from questionnaire where owner=?";
		db.query(sql, username, function(err, data) {
		    if (err) {
		        throw err;
		    } else {
		        callback(undefined, data);
		    }
		});
	} catch (err) {
	    callback(err);
	}
};

//viewQuestionnaire
exports.viewQuestionnaire = function(req, callback) {
	try {
		var qID = (req.query.qID) ? req.query.qID:req.session.token.qID ;
		var sql = "select * from (select * from questionnaire as a left join questions as b on a.id = b.questionnaire_id) as tmp where id = ?";
		db.query(sql, qID, function(err, data) {
		    if (err) {
		        throw err;
		    } else {
		        callback(undefined, data);
		    }
		});
	} catch (err) {
	    callback(err);
	}
};

//保存用户填写的表单数据
exports.addQData = function(req, callback) {
	try {
		var qID = req.body.qID;
		var u_ip = req.ip;
		delete req.body.qID;
		var q_data = JSON.stringify(req.body);

		var sql = 'insert into q_data (q_id, data, u_ip) values (?, ?, ?)';
		db.query(sql, [qID, q_data, u_ip], function(err, data) {
		    if (err) {
		        throw err;
		    } else {
		        callback(undefined, data);
		    }
		});
	} catch (err) {
	    callback(err);
	}
};

//检查用户是否填写过表单
exports.checkUIp = function(req, callback) {
	try {
		var u_ip = req.ip;
		var qID = req.query.qID;
		var sql = 'select * from q_data where u_ip = ? and q_id = ?';
		db.query(sql, [u_ip, qID], function(err, data) {
		    if (err) {
		        throw err;
		    } else {
		        callback(undefined, data);
		    }
		});

	} catch (err) {
	    callback(err);
	}
};

//查看问卷结果
exports.viewResult = function(req, callback) {
	try {
		var qID = req.query.qID;
		var sql = 'select * from questionnaire as q1,q_data as q2 where q1.id=q2.q_id and q1.id=?';
		db.query(sql, qID, function(err, data) {
		    if (err) {
		        throw err;
		    } else {
		        callback(undefined, data);
		    }
		});

	} catch (err) {
	    callback(err);
	}
};
