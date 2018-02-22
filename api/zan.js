var express = require("express");
var router = express.Router();
var Zans = require("../models/zan");

router.post("/golike",function(req,res){
    var sendData = req.body;
    Zans.findOne(sendData,function(err,zan){
        if(err) return err;
        console.log(zan);
        if(zan == null) {
            Zans.create(sendData, function (err, data) {
                if (err) return err;
                res.json({
                    success: true,
                    msg: "点赞成功"
                })
            })
        }else{
            if (zan.zanStatus) {
                res.json({
                    success: true,
                    msg: "点赞成功"
                })
            } else {
                Zans.create(sendData, function (err, data) {
                    if (err) return err;
                    res.json({
                        success: true,
                        msg: "点赞成功"
                    })
                })
            }
        }
    })

});

router.post("/nolike",function(req,res){
    var searchUser = req.body.username;
    var searchId = req.body.com_id;
    if(searchId == ""){
        res.json({
            success: false,
            msg: "参数错误"
        });
    }else{
        Zans.findOneAndRemove({username: searchUser},{com_id: searchId},function(err,zan){
            if(err)return err;
            res.json({
                success: true,
                msg: "取消成功"
            })
        })
    }
});

module.exports = router;