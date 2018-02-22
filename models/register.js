var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var registerSchema = new Schema({
    username : String,
    password : Number,
    avatar_url : String
});

var Registers = mongoose.model("Registers",registerSchema);         // 第一个参数是文档名称也就是数据库对应表名称
module.exports = Registers;

