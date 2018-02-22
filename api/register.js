var express = require('express');
var router = express.Router();
var Registers = require("../models/register");

router.post("/reg",function(req,res){
    var userInfo = {
        username : req.body.username,
        password : req.body.password,
        avatar_url : "../images/avatar_def.jpg"
    };3
    Registers.findOne({username:req.body.username}).count(function(err,count){
        if(err) return err;
        if(count > 0){
            res.json({
                success: false,
                msg: "用户已注册"
            });    
        }else{
            Registers.create(userInfo,function(err,userInfo){
                if(err) return err;
                console.log(err);
                res.json({
                    success : true
                });
            });
        }
    });
});

module.exports = router;