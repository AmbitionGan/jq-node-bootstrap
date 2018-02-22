var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var uploadSchema = new Schema({
    userInfo:{
        username: String,
        avatar_url: String,
    },
    fielPath: Array,
    title: String,
    text: String,
    com_id: String,
    sendTime: String,
    zanStatus: Boolean
});

var upload = mongoose.model("upload",uploadSchema);         // 第一个参数是文档名称也就是数据库对应表名称
module.exports = upload;