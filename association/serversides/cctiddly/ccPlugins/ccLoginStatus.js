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
//		var name=decodeURIComponent(decodeURIComponent(cookieValues.txtUserName));

		var frm=createTiddlyElement(n,"form",null);
		frm.action="";
		frm.method="get";
		//frm.onsubmit=config.macros.ccLogin.logoutOnSubmit;
		wrapper.appendChild(frm);	
		var str=wikify("You are viewing the workspace "+workspace +" and  are logged in as: "+decodeURIComponent(name),frm);
		var logout=createTiddlyElement(null,"input",logout,logout);
		logout.setAttribute("type","hidden");
		logout.value="1";   
		logout.name="logout";   
		frm.appendChild(logout);	
		var btn=createTiddlyElement(null,"input",null,"button");
		btn.setAttribute("type","submit");
		btn.value="Logout";   
		frm.appendChild(btn);	
	}else{
		wikify("[[Login]]",wrapper);
	}
};