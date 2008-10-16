/***
|''Name''|ccLoginStatus|
|''Description''|Allows users to see their login status and displays the options to login or logout. This Macro will later be added to ccLogin|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccLoginStatus.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccLoginStatus.js|
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

merge(config.macros.ccLoginStatus,{
	textDefaultWorkspaceLoggedIn:"Viewing default workspace",
	textViewingWorkspace:"Viewing Workspace : ",
	textLoggedInAs:"Logged in as ",
	textNotLoggedIn:"You are not logged in.",
	textAdmin:"You are an Administrator."
});

config.macros.ccLoginStatus.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var loginDiv=createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(loginDiv);
};
	
config.macros.ccLoginStatus.refresh=function(place,errorMsg){
       var me = config.macros.ccLoginStatus;
       var loginDivRef=document.getElementById ("LoginDiv");
       removeChildren(loginDivRef);
       var wrapper=createTiddlyElement(place,"div");
       var str = (workspace == "" ? me.textDefaultWorkspaceLoggedIn :(me.textViewingWorkspace+workspace))+"\r\n\r\n";
       if (isLoggedIn()){
			name = cookieString(document.cookie).txtUserName;
			str += me.textLoggedInAs+decodeURIComponent(name)+".\r\n\r\n";
			if (workspacePermission.owner==1){
				str += me.textAdmin;
			}
       }else{
               str += me.textNotLoggedIn;
       }
       wikify(str,wrapper);
};
//}}}