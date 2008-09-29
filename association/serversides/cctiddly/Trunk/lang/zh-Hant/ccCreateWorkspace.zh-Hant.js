/***
|''Name''|ccCreateWorkspace.zh-Hant|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{	
merge(config.macros.ccCreateWorkspace, {
	wizardTitle:"新增工作區",
	buttonCreateText:"建立",
	buttonCreateWorkspaceText:"建立新工作區",
	buttonCreateTooltip:'建立新工作區',
	errorPermissions:"沒有建立工區的權限， 登入後再試。",
	msgPleaseWait:"工作區建立中，請稍後",
	msgWorkspaceAvailable:"工作區有效",
	errorWorkspaceNameInUse:"工作區已存在",
	stepTitle:"請輸入工作區名稱",
	stepCreateHtml:"<input class='input' id='workspace_name' name='workspace_name' value='"+workspace+"' tabindex='1' /><span></span><input type='hidden' name='workspace_error'></input><h2></h2><input type='hidden' name='workspace_url'></input>"
});
if (isLoggedIn()) {
	merge(config.tasks,{create: {text: config.macros.ccCreateWorkspace.buttonCreateText, tooltip: config.macros.ccCreateWorkspace.buttonCreateTooltip, content:'<<ccCreateWorkspace>>'}});
}
//}}}