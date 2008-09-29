/***
|''Name''|ccEditWorkspace.zh-Hant|
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
	WizardTitleText:"修改工作區權限",
	stepEditTitle:null,
	stepLabelCreate:'建立',
	stepLabelRead:'讀取',
	stepLabelUpdate:'修改',
	stepLabelDelete:'刪除',
	stepLabelPermission:'',
	stepLabelAnon:'  訪客   ',
	stepLabelUser:' 一般用戶   ',
	stepLabelAdmin:' 管理者  ',
	buttonSubmitCaption:"更新",
	buttonSubmitToolTip:"更新工作區權限",
	button1SubmitCaption:"完成",
	button1SubmitToolTip:"重新檢視工作區權限",
	step2Error:"發生錯誤", 
	errorTextPermissionDenied:"您沒有修改工區的權限，請登入後再試"
	});

//}}}