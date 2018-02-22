const express = require('express');
const router = express.Router();
const Register = require("../models/register");

router.post("/log",function(req,res){
    Register.findOne({username:req.body.username},function(err,login){
        if(err) return err;
        if(login != null){
            if(login.password == req.body.password){
                var userInfo = {
                    username:login.username,
                    avatar_url: login.avatar_url,
                };
                res.send({
                    success: true,
                    username:login.username,
                    avatar_url: login.avatar_url,
                    uid:login._id,
                });
            }else{
                res.send({
                    success: false,
                    msg: "密码错误，请重新登录！"
                })
            }
        }else{
            res.send({
                success: false,
                msg: "用户未注册。"
            })
        }
    })
});

module.exports = router;