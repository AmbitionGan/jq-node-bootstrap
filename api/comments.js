var express = require("express");
var router = express.Router();
var Comments = require("../models/comment");
var sd = require("silly-datetime");

router.post("/sendComment",function(req,res){
    var sendTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    var sendData = {
        userInfo:{
            username: req.body.username,
            avatar_url: req.body.avatar_url
        },
        text: req.body.text,
        com_id: req.body.com_id,
        sendTime: sendTime
    };
   if(sendData.com_id == ""){
       res.json({
           success: false,
           msg: "内容不能为空"
       });
   }else{
       Comments.create(sendData,function(err,data){

           if(err) return err;
           res.json({
               success: true,
               msg: "发表成功",
               data:{
                   com_id: data.com_id
               }
           })
       })
   }
});

router.post("/searchComment",function(req,res){
    var searchId = req.body.com_id;
    if(searchId == ""){
        res.json({
            success: false,
            msg: "参数错误"
        });
    }else{
        Comments.find({com_id: searchId},function(err,com){
            if(err) return err;
            res.json({
                success: true,
                msg: "获取成功",
                data: com
            })
        })
    }
});

module.exports = router;