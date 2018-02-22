var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commnetSchema = new Schema({
    userInfo:{
        username: String,
        avatar_url: String
    },
    text: String,
    com_id: String,
    sendTime: String
});

var comments = mongoose.model("comments",commnetSchema);         // 第一个参数是文档名称也就是数据库对应表名称
module.exports = comments;