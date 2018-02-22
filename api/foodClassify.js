var express = require('express');
var router = express.Router();
var cheerio = require("cheerio");
var superagent = require("superagent");
var FoodClassify = require("../models/foodClassify");

router.post("/food",function(req,res){
    // 获取数据
    FoodClassify.find({},function(err,data){
        if(err)return err;
        console.log(data);
        res.json({
            success: true,
            data: data
        })
    })

    // 爬取数据
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    // var items = [];
    // var url = "http://www.xiachufang.com/category/40076/?page=10";
    // superagent.get(url)
    //     .end(function (err, sres) {
    //         // 常规的错误处理
    //         if (err) return next(err);
    //         // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
    //         // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
    //         var $ = cheerio.load(sres.text);
    //         $('.normal-recipe-list ul li').each(function (idx, element) {
    //             var $element = $(element);
    //             var itemsData = {
    //                 foodName: $element.children().children().children(".name").text(),
    //                 foodMsg: $element.children().children().children(".ellipsis").text(),
    //                 foodPic: $element.children().children(".cover").children("img").attr("data-src"),
    //                 url: $element.children("a").attr("href"),
    //                 foodDetails: []
    //             };
    //             items.push(itemsData);
    //         });
    //         items = items;
    //         dealitems(items);
    //     });
});

function dealitems(data) {
    for(var i = 0; i < data.length; i++){
        var agentUrl = "http://www.xiachufang.com" + data[i].url;
        (function (){
            var itemData = data[i];
            superagent.get(agentUrl)
                .end(function(err,sres){
                    if (err) return next(err);
                    var $ = cheerio.load(sres.text);
                    var foodDetailsArr = [];
                    $('.steps ol li').each(function (idx, element) {
                        var $element = $(element);
                        var stepsData = {
                            cookPic: $element.children("img").attr("src"),
                            cookMsg: $element.children(".text").text()
                        };
                        foodDetailsArr.push(stepsData);
                    });
                    var cookMaterialStr = "";
                    $('.ings table tbody tr').each(function (idx, element) {
                        var $element = $(element);
                        cookMaterialStr += $element.children(".name").text() +","+ $element.children(".unit").text()+",";
                    });
                    var cookMaterial = {
                        cookMaterial : cookMaterialStr
                    };
                    foodDetailsArr.unshift(cookMaterial);

                    itemData.foodDetails = foodDetailsArr;
                    FoodClassify.create(itemData,function(){
                        console.log("插入成功")
                    })
                })
        }(i));
    }
}

function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
}

// 食物详情
router.post("/foodDetails",function(req,res){
    var foodname = req.body.foodName;
    FoodClassify.findOne({url:foodname},function(err,food){
        if(err) return err;
        console.log(food);
        res.json({
            success: true,
            data: food
        })
    })
});

module.exports = router;