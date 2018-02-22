$(function(){
    chatroomFlag = true;
    var sendBtnFlag = false;
    if(!sendBtnFlag){
        $(".sendBtn").css({
            "background": "#eee",
            "border": "1px solid #eee"
        });
    }
    if(username == "" && uid == ""){
        alert("请先登录");
        $(".loginBg").show();
    }else{
        sendBtnFlag = true;
        $(".sendBtn").css({
            "background": "#2e6da4",
            "border": "1px solid #2e6da4"
        });
        socketInit(username,avatar_url);
    }
    $(".sendBtn").click(function(){
        if(!sendBtnFlag){
            alert("请先登录");
            $(".loginBg").show();
            return;
        }
        sendMsg(username,avatar_url);
    });
    window.onbeforeunload = function(){
        logoutSocket();
    };
});