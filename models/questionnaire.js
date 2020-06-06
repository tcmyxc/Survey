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
		var sql = "update questionnaire set status='1' where id=?";
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