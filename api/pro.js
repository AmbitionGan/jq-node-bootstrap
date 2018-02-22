exports.add = function (req, res) {
    if (req.method == "GET") {
        var user = {};
        if(req.session.user){
            user = req.session.user;
        }
        res.render("users/food_add", {title:'发布美食-'+config.name,name:config.name,user:user});
    } else  if (req.method == "POST") {
        //获取数据
        var x = req.body.x;
        var y = req.body.y;
        var cat_id = req.body.cat_id;
        var cat_name = req.body.cat_name;
        var address = req.body.address;
        var title = req.body.title;
        var desc = req.body.desc;
        var content = req.body.content;
        var pics = '';
        var price = req.body.price;
        var tags = req.body.tags;
        var add_time = Date.parse(new Date())/1000;
        var support = 0;
        var uid = req.body.uid;
        //处理图片上传
        //console.dir(req.files);
        var file_obj = req.files.pics;
        //console.log(file_obj.length);
        var file_obj2 = [];
        for(var i=0;i<file_obj.length;i++){
            if(file_obj[i].name){
                file_obj2.push(file_obj[i]);
            }
        }
        var length = file_obj2.length;
        if(length>0){
            file_obj2.forEach(function(item,index){
                if(item.path){
                    var tmpPath = item.path;
                    var type = item.type;
                    var extension_name = "";
                    //移动到指定的目录，一般放到public的images文件下面
                    //在移动的时候确定路径已经存在，否则会报错
                    var tmp_name = (Date.parse(new Date())/1000);
                    tmp_name = tmp_name+''+(Math.round(Math.random()*9999));
                    //判断文件类型
                    switch (type) {
                        case 'image/pjpeg':extension_name = 'jpg';
                            break;
                        case 'image/jpeg':extension_name = 'jpg';
                            break;
                        case 'image/gif':extension_name = 'gif';
                            break;
                        case 'image/png':extension_name = 'png';
                            break;
                        case 'image/x-png':extension_name = 'png';
                            break;
                        case 'image/bmp':extension_name = 'bmp';
                            break;
                    }
                    var tmp_name = tmp_name+'.'+extension_name;
                    var targetPath = 'public/images/' + tmp_name;
                    console.log(tmpPath);
                    //将上传的临时文件移动到指定的目录下
                    fs.rename(tmpPath, targetPath , function(err) {
                        if(err){
                            throw err;
                        }
                        if(pics){
                            pics += ','+tmp_name;
                        }else{
                            pics += tmp_name;
                        }
                        //判断是否完成
                        //console.log(index);
                        //删除临时文件
                        fs.unlink(tmpPath, function(){
                            if(err) {
                                throw err;
                            }else{
                                if((index+1)==length){
                                    console.log(targetPath);
                                    //上传处理完成
                                    //数据
                                    var data = {
                                        x:x,//经度
                                        y:y,//维度
                                        cat_id:cat_id,//分类id
                                        cat_name:cat_name,//分类名称
                                        address:address,//地址
                                        title:title,//标题
                                        desc:desc,//简介
                                        content:content,//内容
                                        pics:pics,//图片字段，以','隔开多张图片
                                        price:price,//价格
                                        tags:tags,//标签 以','隔开多个
                                        add_time:add_time,//支持度
                                        support:support,//支持度 默认为0
                                        uid:uid//用户id 可匿名
                                    };
                                    food_preDao.insert(data, function (err, food) {
                                        if(err){
                                            res.json({err:100,content:'数据库错误'});
                                        }else{
                                            res.json({err:0,content:'发布成功！',data:food});
                                        }
                                    });
                                }
                            }
                        });

                    });
                }
            });
        }else{
            //没有图片
            //数据
            var data = {
                x:x,//经度
                y:y,//维度
                cat_id:cat_id,//分类id
                cat_name:cat_name,//分类名称
                address:address,//地址
                title:title,//标题
                desc:desc,//简介
                content:content,//内容
                pics:pics,//图片字段，以','隔开多张图片
                price:price,//价格
                tags:tags,//标签 以','隔开多个
                add_time:add_time,//支持度
                support:support,//支持度 默认为0
                uid:uid//用户id 可匿名
            };
            food_preDao.insert(data, function (err, food) {
                if(err){
                    res.json({err:100,content:'数据库错误'});
                }else{
                    res.json({err:0,content:'发布成功！',data:food});
                }
            });
        }

    }
};