//{{{
	
config.macros.ccOptions={};	

merge(config.macros.ccOptions, {
	linkManageUsers:"users",
	linkPermissions:"permissions",
	linkFiles:"files",
	linkCreate:"create",
	linkOffline:"offline",
	linkStats:"statistics"
	
});
config.macros.ccOptions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var me = config.macros.ccOptions;
	if(workspacePermission.owner==1)
		wikify("[["+me.linkManageUsers+"|Manage Users]]<br />[["+me.linkPermissions+"|Permissions]]<br />[["+me.linkStats+"|Statistics]]<br />", place);
	if (isLoggedIn())
		wikify("[["+me.linkFiles+"|files]]<br />", place);
	if (workspacePermission.canCreateWorkspace==1)
		wikify("[["+me.linkCreate+"|CreateWorkspace]]<br />", place);
		if (isLoggedIn()){
			// append url function required 
			if (window.fullUrl.indexOf("?") >0)
				wikify("[["+me.linkOffline+"|"+fullUrl+"&standalone=1]]<br />", place);
			else 
				wikify("[["+me.linkOffline+"|"+fullUrl+"?standalone=1]]<br />", place);
			
		}
};

//}}}