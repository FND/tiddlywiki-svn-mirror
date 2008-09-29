/***
|''Name''|ccCreateWorkspace.zh-Hans|
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
	wizardTitle:"添加工作区",
	buttonCreateText:"创建",
	buttonCreateWorkspaceText:"创建新工作区",
	buttonCreateTooltip:'创建新工作区',
	errorPermissions:"没有创建工区的权限， 登入后再试。",
	msgPleaseWait:"工作区创建中，请稍后",
	msgWorkspaceAvailable:"工作区有效",
	errorWorkspaceNameInUse:"工作区已存在",
	stepTitle:"请输入工作区名称",
	stepCreateHtml:"<input class='input' id='workspace_name' name='workspace_name' value='"+workspace+"' tabindex='1' /><span></span><input type='hidden' name='workspace_error'></input><h2></h2><input type='hidden' name='workspace_url'></input>"
});
if (isLoggedIn()) {
	merge(config.tasks,{create: {text: config.macros.ccCreateWorkspace.buttonCreateText, tooltip: config.macros.ccCreateWorkspace.buttonCreateTooltip, content:'<<ccCreateWorkspace>>'}});
}
//}}}