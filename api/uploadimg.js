var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable  = require('formidable');
var cacheFolder = 'public/images/';
var sd = require("silly-datetime");
var uuid = require("node-uuid");
var Upload = require("../models/uploadimg");
var Registers = require("../models/register");
var Zans = require("../models/zan");

router.post("/uploadimg",function(req,res){
    var userDirPath =cacheFolder+ "Img";
    if (!fs.existsSync(userDirPath)) {
        fs.mkdirSync(userDirPath);
    }
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = userDirPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 3 * 1024 * 1024; //文件大小
    form.multiples=true;// 多文件上传
    form.type = true;
    var displayUrl;
    var allFile = [];
    var pathArr = [];
    var fielPath = [];
    form.on("file",function(filed,file){
        fielPath.push(file.path);
        allFile.push([filed,file]);
    })
        .on("error",function(err){
            console.error('上传失败：', err.message);
        })
        .parse(req,function(err,fields,files){
            console.log(files);
            var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
            var com_id = uuid.v1();
            var uploadData = {
                userInfo:{
                    username: fields.username,
                    avatar_url: fields.avatar_url
                },
                fielPath: files,
                title: fields.title,
                text: fields.text,
                com_id: com_id,
                sendTime: time,
                zanStatus: false
            };
            Upload.create(uploadData);
            allFile.forEach(function(file,index){
                var extName = ''; //后缀名
                switch (file[1].type) {
                    case 'image/pjpeg':
                        extName = 'jpg';
                        break;
                    case 'image/jpeg':
                        extName = 'jpg';
                        break;
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break;
                }
                if (extName.length === 0) {
                    return res.json({
                        success:false,
                        msg: '只支持png和jpg格式图片'
                    });
                }
            });
        })
        .on("end",function(){
            res.json({
                success: true,
                msg: "上传成功"
            })


        })
});

router.post("/trends",function(req,res){
    var findUsername = req.body.username;
    Upload.find({},function(err,data){
        if(err)return err;
        if(findUsername == ""){
            for(var i = 0; i < data.length; i++){
                data[i].zanStatus = false;
            }
            res.json({
                success: true,
                data: data
            })
        }else{
            Zans.find({username: findUsername},function (err,zan){
                if(err)return err;
                var finalData = data;
                for(var i = 0; i < finalData.length; i++){
                    for(var a = 0; a < zan.length; a++){
                        if(zan[a].com_id == finalData[i].com_id){
                            finalData[i].zanStatus = zan[a].zanStatus;
                        }
                    }
                }
                res.json({
                    success: true,
                    data: finalData
                })
            })
        }
    })
});

router.post("/mytrends",function(req,res){
    var searchCondition = req.body.username;
    Upload.find({userInfo:{username: searchCondition,avatar_url:"../images/avatar_def.jpg"}},function(err,data){
        if(err)return err;
        if(data == false){
            res.json({
                success: false,
                msg: "暂未发表动态。"
            })
        }else{
            Zans.find({username: searchCondition},function (err,zan){
                if(err)return err;
                var finalData = data;
                for(var i = 0; i < finalData.length; i++){
                    for(var a = 0; a < zan.length; a++){
                        if(zan[a].com_id == finalData[i].com_id){
                            finalData[i].zanStatus = zan[a].zanStatus;
                        }
                    }
                }
                res.json({
                    success: true,
                    data: finalData
                })
            })
        }
    })
});

router.post("/mylike",function(req,res){
    var searchCondition = req.body.username;
    Zans.find({username:searchCondition},function(err,zan){
        if(err) return err;

        if(zan == false){
            res.json({
                success: false,
                msg: "暂未喜欢的动态。"
            })
        }else{
            Upload.find({com_id: zan[0].com_id},function(err,data){
                var finalData = data;
                for(var a = 0; a < finalData.length; a++){
                    finalData[a].zanStatus = true;
                }
                res.json({
                    success: true,
                    data: finalData
                })
            })
        }
    })
});

router.post("/lists",function(req,res){
    res.json({
        data:[{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"},{title:"动动"}]
    })
});

module.exports = router;