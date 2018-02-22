var myhost = "http://localhost:3999";
var uid = "";
var username = "";
var avatar_url = "";
var chatroomFlag = false;
var arr1 = []; // 分页数组
// ajax请求
function ajaxSend(url,method,data,dealflag) {
    if(dealflag == "uploadimg"){
        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: "json",
            contentType: false,
            processData: false,
            beforeSend: function() {
            },
            success: function(data) {
                console.log(data);
                ajaxdeal(data,dealflag);
            },
            error: function(err) {
                console.log(err);
            }
        });
    }else{
        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: "json",
            beforeSend: function() {
            },
            success: function(data) {
                // console.log(data);
                ajaxdeal(data,dealflag);
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
}

// 判断ajax请求成功后要触发的处理方法
function ajaxdeal(data,dealflag) {
    switch(dealflag) {
        case "login":
            dealLoginData(data);
            break;
        case "register":
            dealRegisterData(data);
            break;
        case "uploadimg":
            dealUpLoadImgData(data);
            break;
        case "foodClassify":
            dealfoodClassifyData(data);
            break;
        case "foodDetails":
            dealfoodDetails(data);
            break;
        case "trends":
            dealTrendsData(data);
            break;
        case "comment":
            dealCommentData(data);
            break;
        case "search":
            dealCommentSearchData(data);
            break;
        case "golike":
            dealGolikeData(data);
            break;
        case "nolike":
            dealNolikeData(data);
            break;
        case "myTrends":
            dealMyTrendsData(data);
            break;
        case "myLike":
            dealMyLikeData(data);
            break;
        default:
    }
}

// 处理登录返回的数据
function dealLoginData(data) {
    if(data.success){
        alert("登陆成功");
        location.reload(true);
        $(".loginUsername").val("");
        $(".loginPassword").val("");
        $(".loginBg").hide();
        username = data.username;
        avatar_url = data.avatar_url;
        loginSuc();
        uid = data.uid;
        var userStr = "username="+username+",avatar_url="+avatar_url;
        setCookie("user",userStr,7);
        if(chatroomFlag){
            socketInit(username,avatar_url);
        }
        var trendsurl = myhost+"/api/trends";
        var trendsOpt = {
            username: username
        };
        ajaxSend(trendsurl,"post",trendsOpt,"trends");
        $(".personMsgHead img").attr("src",avatar_url);
        $(".personMsgHead p").html(username);
    }else{
        alert(data.msg);
    }
}

// 登陆成功，显示头像
function loginSuc(){
    $(".btnLogin").hide();
    $(".navUsername").text(username);
    $(".avatar").attr("src",avatar_url);
    $(".logined").show();
}

// 初始化登录
function initLogin(){
    $(".logined").hide();
    $(".btnLogin").show();
    username = "";
    avatar_url = "";
    uid = "";
    location.reload(true);
}

// 处理注册返回的数据
function dealRegisterData(data) {
    if(data.success){
        alert("注册成功");
        $(".regUsername").val("");
        $(".regPassword").val("");
        $(".loginBox").show();
        $(".RegisterBox").hide();
    }else{
        alert(data.msg);
    }
}

// 处理上传图片返回的数据
function dealUpLoadImgData(data) {
    if(data.success){
        alert(data.msg);
        fileTmpArr = [];
        fileLastArr = [];
        preLen = 0;
        $(".previewList").children().remove();
        $(".title").val("");
        $(".uploadTextArea").val("");
        window.location.href = "./trends.html";
    }else{
        alert(data.msg)
    }
}

// 上传图片超过数量提示文字
function cueText(ele){
    ele.css("color","#f47d43");
    setTimeout(function(){
        ele.css("color","#000");
    },2000)
}

// 预览图片
var fileTmpArr = [];
var fileLastArr = [];
var preLen = 0;

function preImg(ele){
    var fileList = ele.prop("files");
    var windowURL = window.URL || window.webkitURL;
    var dataURL;
    // 临时储存数组
    if(fileTmpArr.length < 3){
        var baseNum = 3 - fileTmpArr.length;
        if(fileList.length > baseNum){
            fileList.length = baseNum;
        }
        for(var a = 0; a < fileList.length; a++){
            fileTmpArr.push(fileList[a]);
        }
    }
    // 最终显示数组
    if(fileLastArr.length < 3){
        var lastbaseNum = 3 - fileLastArr.length;
        if(fileTmpArr.length > lastbaseNum){
            fileTmpArr.length = lastbaseNum;
        }
        console.log("临时数组长度"+ fileTmpArr.length)
        for(var b = 0; b < fileTmpArr.length; b++){
            fileLastArr.push(fileTmpArr[b]);
        }
    }
    // 插入图片节点
    if(preLen < 3){
        $(".previewbox").remove();
        for(var i = 0; i < fileLastArr.length; i++){
            (function(){
                dataURL = windowURL.createObjectURL(fileLastArr[i]);
                var temStr = "<div class='previewbox' data-index="+i+"><div><span class='closePre'>X</span></div><img src="+dataURL+"></div>";
                $(".previewList").append(temStr);
                preLen = $(".previewbox").length;
            }(i))
        }
    }else{
        alert("最多选三张")
    }
    // 删除预览图片
    $(".closePre").click(function(){
        $(this).parent().parent().remove();
        preLen = $(".previewbox").length;
        var delIndex = $(this).parent().parent().attr("data-index");
        fileLastArr.splice(delIndex,1);
    });
    fileTmpArr = [];
}

// 处理cookie数据
function dealCookieData(data){
    var obj = {};
    var arr = data.split(",");
    var l = arr.length;
    for( var i=0; i<l; i++ ){
        var col = arr[i].split("=");	// "a=1" 在该字符串中，根据等号拆分成数组
        obj[col[0]] = col[1];
    }
    return obj;
}

// socket 方法
// 连接服务器
var socket = null;

// socket 初始化
function socketInit(username,avatar_url){
    var username = username;
    var avatar_url = avatar_url;
    // 连接服务器
    socket = io.connect("http://localhost:4000");
    // 告诉服务器有用户连接
    socket.emit("login",{username: username,avatar_url: avatar_url});
    // 监听用户登录，服务器反馈
    socket.on("login",function(o){
        console.log("用户进入");
        console.log(o);
        createUserList(o);
    });
    // 监听用户退出，服务器反馈
    socket.on("logout",function (o) {
        console.log("用户退出");
        console.log(o);
        logoutMsg (o);
    });
    // 监听用户发送消息
    socket.on("message",function(o){
        console.log("发送消息");
        console.log(o);
        msgList(o,username);
    })
}

// 用户登录，创建用户列表节点
function createUserList(o) {
    $(".massageListTitle").remove();
    $(".userListBox").parent().remove();
    $(".showCount").text(o.onlineCount);
    var onlineUsers = o.onlineUsers;
    for (var a in onlineUsers) {
        var listStr = '<li><div class="userListBox"><img src="' + onlineUsers[a].avatar_url + '"><span>' + onlineUsers[a].username + '</span> </div></li>';
        $(".onlineCount ul").append(listStr);
        var titleStr = '<p class="massageListTitle"><span>' + onlineUsers[a].username + '</span>  进入聊天室</p>';
        $(".massageList").append(titleStr);
    }
}
// 发送消息
function sendMsg(username,avatar_url){
    var sendMsg = $(".sendMsgText").val();
    if(sendMsg != ""){
        var obj = {
            username: username,
            avatar_url:avatar_url,
            content: sendMsg,
        };
        socket.emit("message",obj);
        $(".sendMsgText").val("");
    }else{
        alert("消息不能为空");
    }
}

// 消息显示
function msgList(o,username){
    if(o.username == username){
        var msgListMyselfStr = '<div class="massageChatBoxMyself"><img src="'+o.avatar_url+'"><span>'+o.username+'</span><p>'+o.content+'</p> </div>';
        $(".massageList").append(msgListMyselfStr);
    }else{
        var msgListMyselfStr = '<div class="massageChatBoxMyself massageChatBoxOthers"><img src="'+o.avatar_url+'"><span>'+o.username+'</span><p>'+o.content+'</p> </div>';
        $(".massageList").append(msgListMyselfStr);
    };
}

// 退出聊天室
function logoutSocket(){
    socket.emit("logout");
}

// 推送退出消息
function logoutMsg (o){
    // $(".massageListTitle").remove();
    $(".userListBox").parent().remove();
    $(".showCount").text(o.onlineCount);
    if(JSON.stringify(o.onlineUsers) == "{}"){
        $(".userListBox").parent().remove();
    }else{
        var onlineUsers = o.onlineUsers;
        for (var a in onlineUsers) {
            var listStr = '<li><div class="userListBox"><img src="' + onlineUsers[a].avatar_url + '"><span>' + onlineUsers[a].username + '</span> </div></li>';
            $(".onlineCount").append(listStr);
        }
    }
    var titleStr = '<p class="massageListTitle"><span>' + o.userinfo.username + '</span>  退出聊天室</p>';
    $(".massageList").append(titleStr);
}

// 食物详情获取地址栏参数
function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURIComponent(r[2]); return null;
}

// 处理食物分类返回数据
function dealfoodClassifyData(data){
    var foodClassifyArr = [];
    if(data.success){
        foodClassifyArr = data.data;
        finalFoodArr(foodClassifyArr,"food")
    }else{
        alert("数据获取失败");
    }
}

// 获取所有数据，按20进行分页
function finalFoodArr(foodClassifyArr,classifyFlag){
    var len = foodClassifyArr.length;
    var pageFinalArr = [];
    var tmp = len%20;
    var pageNumLength = parseInt(len/20);
    for(var i=0; i<pageNumLength; i++){
        var tmpFinalArr = [];
        for(var a=0; a<20; a++){
            tmpFinalArr.push(foodClassifyArr[a]);
        }
        foodClassifyArr.splice(0,20);
        pageFinalArr.push(tmpFinalArr);
    }
    if(!!tmp){
        pageFinalArr.push(foodClassifyArr);
    }
    renderFoodClassify(pageFinalArr,classifyFlag);
}

// 分页数字列表渲染
function renderPageNum(a,alen,remove){
    if(arr1[a]){
        if(remove != ""){
            $(".pageNum").remove();
        }
        var arr2 = [];
        var tmp = [];
        for(var b=a; b<alen; b++){
            if(arr1[b]){
                arr2.push(arr1[b]);
            }else{
                tmp.push(b);
            }
        }
        if(tmp.length>=5){
            return false;
        }
        for(var i=a; i> a-tmp.length; i-- ){
            arr2.unshift(arr1[i-1]);
        }
        for(var b=0; b<arr2.length; b++){
            var pageNum = "pageNum" + arr2[b];
            var pageNumModel = "<li class='pageNum "+ pageNum +"' data-index='"+ arr2[b] +"'>"+ arr2[b] +"</li>";
            $(".paginationNex").before(pageNumModel);
        }
    }
}

// 渲染食物分类列表
function renderFoodClassify(pageFinalArr,classifyFlag){
    var a = 0;
    var alen = 5;
    var pageFinalArrLenPub = pageFinalArr.length;
    for(var b=1; b<=pageFinalArrLenPub; b++){
        arr1.push(b);
    }
    if(pageFinalArrLenPub<5)alen = pageFinalArrLenPub;
    renderPageNum(a,alen,"1");
    $(".pageNum1").addClass("paginationNumColor");
    renderPresentFoodClassifyList(pageFinalArr[0],classifyFlag);
    $(".pagination ul").on("click","li",function(){
        var chooseIndex = $(this).attr("data-index");
        var data = pageFinalArr[chooseIndex];
        var pageFinalArrLen = pageFinalArr.length;
        switch (chooseIndex){
            case "paginationIndex":
                $(".pagination ul li").removeClass("paginationNumColor");
                a = 0;
                alen = 5;
                if(arr1.length<5){
                    alen = arr1.length;
                }
                renderPageNum(a,alen,"1");
                $(".pageNum1").addClass("paginationNumColor");
                data = pageFinalArr[0];
                break;
            case　"paginationLast":
                $(".pagination ul li").removeClass("paginationNumColor");
                if(arr1.length<5){
                    a = arr1[arr1.length - 1] - arr1.length;
                }else{
                    a = arr1[arr1.length - 1] - 5;
                }
                if(a<0)a=0;
                alen = arr1.length;
                renderPageNum(a,alen,"1");
                var pageEleNum = ".pageNum"+ Number(pageFinalArrLen);
                $(pageEleNum).addClass("paginationNumColor");
                data = pageFinalArr[pageFinalArrLen - 1];
                break;
            case "paginationPre":
                var prevDataIndex = $(".paginationNumColor").prev().attr("data-index");
                if(prevDataIndex != "paginationPre"){
                    var pageChangeEle = ".pageNum" + prevDataIndex;
                    $(".pagination ul li").removeClass("paginationNumColor");
                    $(pageChangeEle).addClass("paginationNumColor");
                    data = pageFinalArr[prevDataIndex - 1];
                }else{
                    data = pageFinalArr[0];
                }
                break;
            case "paginationNex":
                var nextDataIndex = $(".paginationNumColor").next().attr("data-index");
                if(nextDataIndex != "paginationNex"){
                    var pageChangeEle = ".pageNum" + nextDataIndex;
                    $(".pagination ul li").removeClass("paginationNumColor");
                    $(pageChangeEle).addClass("paginationNumColor");
                    data = pageFinalArr[nextDataIndex - 1];
                }else{
                    data = pageFinalArr[pageFinalArrLen - 1];
                }
                break;
            default:
                $(".pagination ul li").removeClass("paginationNumColor");
                $(this).addClass("paginationNumColor");
                data = pageFinalArr[chooseIndex - 1];
        }
        var nextIndex = $(".paginationNumColor").next().attr("data-index");
        var prevIndex = $(".paginationNumColor").prev().attr("data-index");
        var colorIndex = $(".paginationNumColor").attr("data-index");
        if(nextIndex == "paginationNex"){
            var tmpb = 0;
            tmpb = a + 3;
            if(arr1[tmpb]){
                a = a + 3;
                alen = alen + 3;
            }
            var changeIndex = ".pageNum" + colorIndex;
            renderPageNum(a,alen,"1");
            $(changeIndex).addClass("paginationNumColor");
        }else if(prevIndex == "paginationPre"){
            var tmpb = 0;
            tmpb = a - 3;
            if(arr1[tmpb]){
                a = a - 3;
                if(a < 0) a = 0;
                alen = alen - 3;
            }
            var changeIndex = ".pageNum" + colorIndex;
            renderPageNum(a,alen,"1");
            $(changeIndex).addClass("paginationNumColor");
        }
        renderPresentFoodClassifyList(data,classifyFlag);
    })
}

// 分页食物列表
function renderPresentFoodClassifyList(data,classifyFlag){
    switch (classifyFlag){
        case "food":
            $(".foodClassifyShow ul").children().remove();
            var len = data.length;
            for(var i=0; i<len; i++){
                (function(){
                    var renderStr = "<li class='col-md-3 col-sm-6 col-xs-12'><a href='./foodDetails.html?data="+data[i].url+"' target='_blank' style='overflow:hidden'><div class='foodClassifyShowBox'><div><img src='"+data[i].foodPic+"'alt=''></div><h5>"+data[i].foodName+"</h5><p>"+data[i].foodMsg+"</p></div></a></li>";
                    $(".foodClassifyShow ul").append(renderStr);
                }(i))
            }
            break;
        case "trends":
            $(".trendsClassifyShow ul").children().remove();
            publicRenderModel(data,$(".trendsClassifyShow ul"));
            break;
        case "myTrends":
            $(".myTrendsList").children().remove();
            $(".alertTitle2").remove();
            publicRenderModel(data,$(".myTrendsList"));
            break;
        case "myLike":
            $(".myLikeList").children().remove();
            $(".alertTitle1").remove();
            publicRenderModel(data,$(".myLikeList"));
            break;
        default:
            console.log("列表渲染错误");
    }
}

// 公共渲染模板
function publicRenderModel(data,ele){
    var len = data.length - 1;
    for(var i=len; i>=0; i--){
        var pathStr = data[i].fielPath[0].file0.path;
        pathStr = pathStr.replace("public","..");
        if(data[i].zanStatus){
            var imgStr = "<img class='zan1' src='../images/zan1.png' style='display: none;'><img class='zan2' src='../images/zan2.png'>";
        }else{
            var imgStr = "<img class='zan1' src='../images/zan1.png'><img class='zan2' src='../images/zan2.png' style='display: none;'>";
        }
        var renderStr = "<li class=\"col-md-3\" style='margin-bottom: 15px;' data-index='"+i+"'><div class=\"trendsClassifyShowBox\"><div class=\"trendsClassifyShowHeader\"><img src=\""+ data[i].userInfo.avatar_url +"\" alt=\"头像\"><h5>"+ data[i].userInfo.username +"</h5><span>"+ data[i].sendTime + "</span></div><p>"+ data[i].title +"</p><div class=\"trendsClassifyShowBody\"><img src=\"../"+ pathStr +"\" alt=\"\"></div><div class=\"trendsClassifyShowFooter\"><a data-type='点赞'>"+ imgStr +"</a><a data-type='评论'><img src='../images/com.png'></a><a data-type='更多'><img src='../images/more.png'></a></div></div></li>";
        ele.append(renderStr);
    }
    trendsDetails(data);
}

// 去空格
function trim(s){
    return s.replace(/\s+/g,"");
}

// 食物详情数据处理
function dealfoodDetails(data){
    console.log(data);
    if(data.success){
        var array = [
            {
                ele: $(".foodName"),
                text: data.data.foodName
            },
            {
                ele: $(".foodTitle"),
                text: data.data.foodMsg
            },
            {
                ele: $(".foodRecommed h4:eq(0)"),
                text: data.data.foodName
            },
            {
                ele: $(".foodRecommed .foodRecommedTitle"),
                text: data.data.foodMsg
            }
        ];
        innerText(array);
        $(".foodRecommedBox img").attr("src",data.data.foodPic);
        var cookMaterialStr = trim(data.data.foodDetails[0].cookMaterial);
        console.log(cookMaterialStr);
        var cookMaterialArr = cookMaterialStr.split(",");
        cookMaterialMethod(cookMaterialArr);
        renderCookStep(data.data.foodDetails);
    }
}

// 把食材 分割的字符串在进行处理
function cookMaterialMethod(cookMaterialArr){
    var tmpArr = [];
    var lastcookMaterialArr = [];
    var cookMaterialArrLen = cookMaterialArr.length;
    for(var a=0; a<cookMaterialArrLen; a++){
        tmpArr = [];
        if(a%2 == 0){
            tmpArr.push(cookMaterialArr[a],cookMaterialArr[a+1]);
            lastcookMaterialArr.push(tmpArr);
        }
    }
    renderCookMaterial(lastcookMaterialArr);
}

// 渲染食材列表
function renderCookMaterial(lastcookMaterialArr){
    var arr = lastcookMaterialArr;
    var len = arr.length;
    for(var i=0; i<len; i++){
        (function(){
            if(arr[i][0] != ""){
                var cookMaterialStr = "<li class='col-md-6 col-sm-6 col-xs-6'><span class='Material col-md-6 col-sm-6 col-xs-6'>"+arr[i][0]+"</span><span class='MaterialNum col-md-6 col-sm-6 col-xs-6'>"+arr[i][1]+"</span></li>";
                $(".foodRecommed div ul").append(cookMaterialStr);
            }
        }(i))
    }
}

// 做菜步骤列表
function renderCookStep(arr){
    var arr = arr;
    var len = arr.length;
    console.log(arr)
    for(var i=1; i<len; i++){
        (function (){
            var CookStepStr = "<li class='col-md-12 col-sm-12 col-xs-12'><div class='col-md-12 col-sm-12 col-xs-12'><img class='col-md-12 col-sm-12 col-xs-12' src='"+arr[i].cookPic+"' alt='步骤图'><p class='col-md-12 col-sm-12 col-xs-12'>"+arr[i].cookMsg+"</p></div></li>";
            $(".cookStep ul").append(CookStepStr);
        }(i))
    }
}

//  食物详情操作dom
function innerText(array){
    var array = array;
    var len = array.length;
    for(var i=0; i<len; i++){
        array[i].ele.text(array[i].text);
    }
 }

 // 动态
function dealTrendsData(data){
    if(data.success){
        var trendsDataArr = data.data;
        finalFoodArr(trendsDataArr,"trends");
    }else{
        alert(data.msg)
    }
}

// 动态详情弹窗判断
function trendsDetails(data){
    $(".trendsClassifyShowFooter a").click(function(){
        var clickIndex = $(this).parent().parent().parent().attr("data-index");
        var renderData = data[clickIndex];
        var changeFlag = $(this).attr("data-type");
        var com_id = renderData.com_id;
        switch (changeFlag){
            case "点赞":
                if(username != ""){
                    zan($(this),com_id);
                }else{
                    alert("请先登录");
                }
                break;
            case "评论":
                renderTrendsDetails(renderData);
                var x = $(".trendsDetailsPrev").height();
                $(".trendsDetails").scrollTop(x);
                break;
            case "更多":
                renderTrendsDetails(renderData);
                $(".trendsDetails").scrollTop(0);
                break;
            default:
                renderTrendsDetails(renderData);
                break;
        }
    })
}

// 动态详情弹窗渲染
function renderTrendsDetails(renderData){
    $(".trendsDetailsMask").show();
    $(".trendsDetailsPrev").children().remove();
    var renderData = renderData;
    var imgFileModels = "";
    var imgFileObj = renderData.fielPath[0];
    for(var a in imgFileObj){
        var pathStr = imgFileObj[a].path;
        pathStr = pathStr.replace("public","..");
        var tmpModels = "<img src="+ pathStr +">";
        imgFileModels += tmpModels;
    }
    var TrendsDetailsModels = "<span class=\"trendsDetailsClose\">关闭</span><h4>"+ renderData.title +"</h4><p>"+ renderData.text +"</p>"+ imgFileModels +"<div class=\"author\"><ul><li>"+ renderData.userInfo.username +"</li><li>  |  </li><li>"+ renderData.sendTime +"</li></ul></div>";
    $(".trendsDetailsPrev").append(TrendsDetailsModels);
    $(".trendsDetailsPrev").attr("data-search",renderData.com_id);
    comListRequest(renderData.com_id);
    $(".trendsDetailsClose").click(function(){
        $(".trendsDetailsMask").hide();
    });
}

// 发表评论
function sendComment(searchid,text) {
    var sendData = {
        username: username,
        avatar_url: avatar_url,
        text: text,
        com_id: searchid
    };
    var comUrl = myhost + "/api/sendComment";
    ajaxSend(comUrl,"POST",sendData,"comment");
}

// 处理发表评论返回数据
function dealCommentData(data){
    if(data.success){
        alert("发表成功");
        $(".trendsDetailsCommentBody textarea").val("");
        comListRequest(data.data.com_id);
    }else{
        alert(data.msg);
    }
}

// 评论列表请求
function comListRequest(searchid){
    var searchUrl = myhost + "/api/searchComment";
    var searchData = {
        com_id: searchid
    };
    ajaxSend(searchUrl,"POST",searchData,"search");
}

// 处理评论列表数据
function dealCommentSearchData(data){
    if(data.success){
        var CommentListArr = data.data;
        var CommentListArrLen = CommentListArr.length;
        $(".trendsDetailsCommentHeaderTitle span").html(CommentListArrLen);
        renderCommentList(CommentListArr,CommentListArrLen);
    }else{
        alert(data.msg);
    }
}

// 渲染评论列表
function renderCommentList(arr,len){
    $(".trendsDetailsCommentList ul").children().remove();
    var ctn = len - 1;
    for(var i = ctn; i >= 0; i--){
        var commentListModels = "<li><div class=\"trendsDetailsCommentListAvatar\"><img src=\""+ arr[i].userInfo.avatar_url +"\" alt=\"头像\"></div><div class=\"trendsDetailsCommentListText\"><h5>"+ arr[i].userInfo.username +"</h5><span>"+ arr[i].sendTime +"</span><p>"+ arr[i].text +"</p></div></li>";
        $(".trendsDetailsCommentList ul").append(commentListModels);
    }
}

// 点赞请求
function zan(_this,comid) {
    if(_this.children(".zan2").css("display") == "none"){
        _this.children(".zan2").show();
        _this.children(".zan1").hide();
        var goLikeUrl = myhost + "/api/golike";
        var goLikeData = {
            username: username,
            com_id: comid,
            zanStatus: true
        };
        console.log(goLikeData);
        ajaxSend(goLikeUrl,"POST",goLikeData,"golike");
    }else{
        _this.children(".zan1").show();
        _this.children(".zan2").hide();
        var noLikeUrl = myhost + "/api/nolike";
        var noLikeData = {
            username: username,
            com_id: comid
        };
        ajaxSend(noLikeUrl,"POST",noLikeData,"nolike");
    }
}

// 点赞返回数据
function dealGolikeData(data){
    console.log(data)
}

// 取消点赞返回数据
function dealNolikeData(data){
    console.log(data)
}

// 我的动态
function dealMyTrendsData(data){
    if(data.success){
        finalFoodArr(data.data,"myTrends");
    }else{
        $(".alertTitle2").html(data.msg);
    }
}

// 我的喜欢
function dealMyLikeData(data){
    if(data.success){
        console.log(data)
        finalFoodArr(data.data,"myLike");
    }else{
        $(".alertTitle1").html(data.msg);
    }
}

////
$(function() {
    chatroomFlag = false;
    // 记住密码，持续登录
    if(getCookie("user") != ""){
        var cookieData = dealCookieData(getCookie("user"));
        username = cookieData.username;
        avatar_url = cookieData.avatar_url;
        loginSuc();
    }

    // 切换登录
    $(".goRegister").click(function() {
       $(".loginBox").hide();
       $(".RegisterBox").show(); 
    });

    // 切换注册
    $(".goLogin").click(function() {
        $(".loginBox").show();
        $(".RegisterBox").hide(); 
    });

    // 登录界面
    $(".btnLogin").click(function(){
        $(".loginBg").show();
    });

    // 关闭登录界面
    $(".loginClose").click(function(){
        $(".loginBg").hide();
    });

    // 注册
    $(".rigesterBtn").click(function(){
        var url = myhost + "/auth/reg";
        var username = $(".regUsername").val();
        var password = $(".regPassword").val();
        var data = {
            username: username,
            password: password
        };
        console.log(data);
        ajaxSend(url,"POST",data,"register");
    });

    // 登录
    $(".loginBtn").click(function(){
        var url = myhost + "/auth/log";
        var username = $(".loginUsername").val();
        var password = $(".loginPassword").val();
        var data = {
            username: username,
            password: password
        };
        ajaxSend(url,"POST",data,"login");
    });

    // 退出登录
    $(".logout").click(function(){
        setCookie("user","",-1);
        initLogin();
        console.log(chatroomFlag)
        if(chatroomFlag){
            logoutSocket();
            window.location.href = "./index.html";
        }
    });

    // 预览图片
    $("#fileupload").change(function(){
        preImg($(this));
    });

    // 发表
    $(".uploadBtn").click(function(e){
        e.preventDefault();
        if(username !=""){
            var url = myhost + "/api/uploadimg";
            var formData = new FormData();
            for(var c = 0; c < fileLastArr.length; c++){
                var file = "file"+ c;
                formData.append(file,fileLastArr[c]);
            }
            formData.append("text",$(".uploadTextArea").val());
            formData.append("title",$(".title").val());
            formData.append("username",username);
            formData.append("avatar_url",avatar_url);
            var data = formData;
            ajaxSend(url,"POST",data,"uploadimg");
        }else{
            alert("请先登录")
        }
    })
});