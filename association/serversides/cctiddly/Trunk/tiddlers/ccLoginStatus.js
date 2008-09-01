/***
|''Name''|ccLoginStatus|
|''Description''|Allows users to see their login status and displays the options to login or logout. This Macro will later be added to ccLogin|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccLoginStatus.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccLoginStatus.js|
|''License''|BSD|
|''Requires''|ccRegister, ccLogin|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccLoginStatus|

!Description

Show the current user their login status. 

!Usage
{{{
<<ccLoginStatus>>
}}}

!Code

***/
//{{{
	
	
config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){
		wikify("<<ccLoginStatus>>", place);
};


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
		if(workspace == "")
			var str = wikify("You are viewing the default workspace and  are logged in as "+decodeURIComponent(name)+"\r\n\r\n",wrapper);
		else
			var str = wikify("You are viewing the workspace "+workspace+" and  are logged in as "+decodeURIComponent(name)+"\r\n\r\n",wrapper);
		var btn = createTiddlyElement(wrapper,"input",null,"button", null, {
			type: "button",
			value: "Logout" });
		btn.setAttribute("type", "button");
		btn.onclick=function() {
			
			// append url function required 
			if (window.fullUrl.indexOf("?") >0)
				window.location = window.fullUrl+"&logout=1";
			else
				window.location = window.fullUrl+"?logout=1";
		};
		wrapper.appendChild(btn);
		if (workspacePermission.owner==1){
			createTiddlyElement(wrapper, "br");
			createTiddlyElement(wrapper, "br");
			createTiddlyText(wrapper,"You are an admin of this workspace");
		}
	}else{
		wikify("Hi Guest\r\n\r\n Please [[login|Login]] ",wrapper);
	}
};

//}}}