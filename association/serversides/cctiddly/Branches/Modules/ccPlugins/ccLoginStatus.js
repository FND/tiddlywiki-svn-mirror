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
		
	//	btn.setAttribute("type","submit");d
		btn.value="Logout";   
		wrapper.appendChild(btn);	
	}else{
		wikify("[[Login]]",wrapper);
	}
};

//}}}