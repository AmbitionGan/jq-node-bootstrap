var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var foodClassifySchema = new Schema({
    foodName: String,
    foodMsg: String,
    foodPic: String,
    url: String,
    foodDetails:Array
});

var foodClassify = mongoose.model("foodClassify",foodClassifySchema);
module.exports = foodClassify;