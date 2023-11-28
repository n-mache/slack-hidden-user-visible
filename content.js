window.addEventListener("load",function(){
    var cache_users = {};
    function getteamid(){
        return JSON.parse(localStorage.getItem("localConfig_v2"))["lastActiveTeamId"];
    }
    function getuserdata(userid,callback){
        if (cache_users[userid]!=null){callback(cache_users[userid]);return;}
        var ajax = new XMLHttpRequest();
        var teamid = getteamid();
        ajax.open("POST","https://edgeapi.slack.com/cache/"+teamid+"/users/info?fp=ce");
        ajax.withCredentials = true;
        upids = {};
        upids[userid] = 0;
        ajax.send(JSON.stringify({"token":JSON.parse(localStorage.localConfig_v2).teams[teamid]["token"],"check_interaction":true,"include_profile_only_users":true,"updated_ids":upids}));
        ajax.onload = function(){
            console.log(ajax.responseText);
            var user = JSON.parse(ajax.responseText)["results"][0];
            cache_users[userid] = user;
            console.log(user);
            callback(user);
        };
    }
    var update_names = function(){
        var teamid = getteamid();
        document.querySelectorAll('[data-message-sender][data-qa="message_sender_name"]:not([data-changed])').forEach(e=>{
            var userid = e.dataset.messageSender;
            if(e.parentNode.parentNode.parentNode.classList.contains("c-message_kit__hidden__message__contents--unhidden")){
                e.dataset.changed = true;
                getuserdata(userid,function(user){
                    e.innerText = user.profile.display_name;
                });
            }
            if(e.parentNode.parentNode.parentNode.parentNode.className == "c-message_kit__gutter__right"){
                e.dataset.changed = true;
                getuserdata(userid,function(user){
                    e.innerText = user.profile.display_name;
                    var ind=e.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0];
                    if (ind.childNodes[0].classList.contains("c-hidden_user_avatar")){
                        ind.childNodes[0].remove();
                        var nins=document.createElement("span");
                        nins.className="c-base_icon__width_only_container";
                        nins.style.height="36px";
                        nins.style.width="36px";
                        var nini=document.createElement("img");
                        nini.className="c-base_icon c-base_icon--image";
                        nini.areaHidden=true;
                        nini.setAttribute("aria","img");
                        nini.alt="";
                        nini.style.width="36px";
                        nini.src="https://ca.slack-edge.com/"+teamid+"-"+userid+"-"+user.profile.avatar_hash+"-48";
                        nini.srcset="https://ca.slack-edge.com/"+teamid+"-"+userid+"-"+user.profile.avatar_hash+"-72 2x";
                        nins.append(nini);
                        ind.append(nins);
                    }
                });
            }
        });
    };
    const target = document.body;
    const observer = new MutationObserver(function (mutations) {
        update_names();
    });

    observer.observe(target, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true
    });
});