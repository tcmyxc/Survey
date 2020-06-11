var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
let session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser'); 

// 引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'hello tcmyxc',
    cookie: { maxAge: 30 * 60 * 1000 }, //cookie生存周期30*60秒
    resave: true,  //cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次
    saveUninitialized: true //强制保存未初始化的会话到存储器
}));

// 静态资源文件夹
app.use(express.static(path.join(__dirname, 'public')));

// 配置中间件
app.use(bodyParser.json());

// This object will contain key-value pairs, 
// where the value can be a string or array (when extended is false), 
// or any type (when extended is true).
// 由于提交的类型不止是字符串，所以设置为true
app.use(bodyParser.urlencoded({
    extended: true
}));

// 配置路由（中间件配置需要在路由前面写好）
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;