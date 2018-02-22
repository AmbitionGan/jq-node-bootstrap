var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var zanSchema = new Schema({
    username: String,
    com_id: String,
    zanStatus: Boolean
});

var zans = mongoose.model("zans",zanSchema);         // 第一个参数是文档名称也就是数据库对应表名称
module.exports = zans;