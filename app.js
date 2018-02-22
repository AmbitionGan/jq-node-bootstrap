var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var register = require("./api/register");
var login = require("./api/login");
var uploadimg = require("./api/uploadimg");
var foodClassify = require("./api/foodClassify");
var comments = require("./api/comments");
var zans = require("./api/zan");
var mongoose = require("mongoose");
var socket = require('socket.io');
var env = process.env.NODE_ENV || 'development';

var dbUrl = 'mongodb://localhost/ambition';   // 自动建立一个数据库大集合，所有的数据都在里面

// connect db
if (env === 'development') {
  dbUrl = 'mongodb://localhost/ambition';
}

mongoose.connect(dbUrl);
mongoose.Promise = global.Promise;

var app = express();



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('cors')());   // 跨域 防止攻击
app.use('/auth', require('cors')());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/auth",register);
app.use("/auth",login);
app.use("/api",uploadimg);
app.use("/api",foodClassify);
app.use("/api",comments);
app.use("/api",zans);

// socket.io
const server = app.listen(4000, function (){
    console.log("Express started in" +app.get('env')+ "mode on http://localhsot:4000");
});

var io = socket(server);
var onlineUsers = {};   // 在线用户信息列表
var onlineCount = 0;    // 在线用户数

io.on("connection",function(socket){
    console.log("一个用户连接");
    // 监听用户进入
    socket.on("login",function(obj){
        // 新加入用户的socket标识
        socket.name = obj.username;
        // 检查在线列表，是否存在
        if(!onlineUsers.hasOwnProperty(obj.username)){

            onlineUsers[obj.username] = {
                username: obj.username,
                avatar_url: obj.avatar_url,
            };
            onlineCount++;
            io.emit("login",{onlineUsers:onlineUsers,onlineCount:onlineCount,userinfo:obj});
            // 向客户端广播，有用户加入
            console.log(obj.username+"加入了聊天室");
        }
    });

    // 监听用户退出
    socket.on("logout",function(){
        //
        if(onlineUsers.hasOwnProperty(socket.name)){

            // 用户信息
            var obj = {username: socket.name};
            // 从在线列表删除用户
            delete onlineUsers[socket.name];
            onlineCount--;
            io.emit("logout",{onlineUsers:onlineUsers,onlineCount:onlineCount,userinfo:obj});
            // 向客户端广播，有用户退出
            console.log(obj.username+"退出了聊天室");
        }
    });

    // 监听用户发布消息
    socket.on("message",function(obj){
      console.log(obj)
        io.emit("message",obj);
        console.log(obj.username+"说："+obj.content);
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
