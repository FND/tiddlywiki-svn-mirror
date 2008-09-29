/***
|''Name''|ccEditWorkspace.zh-Hans|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 19, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{	
merge(config.macros.ccEditWorkspace,{
	WizardTitleText:"修改工作区权限",
	stepEditTitle:null,
	stepLabelCreate:'创建',
	stepLabelRead:'读取',
	stepLabelUpdate:'修改',
	stepLabelDelete:'删除',
	stepLabelPermission:'',
	stepLabelAnon:'  访客   ',
	stepLabelUser:' 一般用户   ',
	stepLabelAdmin:' 管理者  ',
	buttonSubmitCaption:"更新",
	buttonSubmitToolTip:"更新工作区权限",
	button1SubmitCaption:"完成",
	button1SubmitToolTip:"重新检视工作区权限",
	step2Error:"发生错误", 
	errorTextPermissionDenied:"您没有修改工区的权限，请登入后再试"
	});

//}}}