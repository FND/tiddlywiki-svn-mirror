config.macros.ccLoginStatus={};
config.macros.ccLoginStatus.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var loginDiv=createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(loginDiv);
};
	
config.macros.ccLoginStatus.refresh=function(place,errorMsg){
	var loginDivRef=document.getElementById ("LoginDiv");
	removeChildren(loginDivRef);
	var wrapper=createTiddlyElement(place,"div");
	if (isLoggedIn()){
		createTiddlyElement(wrapper,"br");
		name = cookieString(document.cookie).txtUserName;
		var str=wikify("You are viewing the workspace "+workspace +" and  are logged in as: "+decodeURIComponent(name),wrapper);
		var btn=createTiddlyElement(null,"input",null,"button");
		btn.setAttribute("type", "button");
		btn.onclick=function() {
		window.location = window.location+"?&logout=1"
		};
		
		
	//	btn.setAttribute("type","submit");
		btn.value="Logout";   
		wrapper.appendChild(btn);	
	}else{
		wikify("[[Login]]",wrapper);
	}
};