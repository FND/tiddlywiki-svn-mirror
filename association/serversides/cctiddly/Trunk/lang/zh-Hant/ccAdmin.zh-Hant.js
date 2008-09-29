/***
|''Name''|ccAdmin.zh-Hant|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 29, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{
	merge(config.macros.ccAdmin,{
	stepAddTitle:"新增工作區管理者",
	WizardTitleText:"工作區管理",
	buttonDeleteText:"刪除",
	buttonDeleteTooltip:"刪除管理者",
	buttonAddText:"新增",
	buttonAddTooltip:"新增管理者",
	buttonCancelText:"取消",
	buttonCalcelTooltip:"取消新增管理者",
	buttonCreateText:"新增",
	buttonCreateTooltip:"新增工作區管理者",
	labelWorkspace:"工作區：",
	labelUsername:"用戶：",
	stepErrorTitle:"您您必須是此工作區管理者",
	stepErrorText:"無權限修改工作區：",
	stepNoAdminTitle:"此工作區尚無管理者",
	stepManageWorkspaceTitle:"",
	listAdminTemplate: {
	columns: [	
		{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
		{name: 'Name', field: 'name', title: "用戶", type: 'String'},
		{name: 'Last Visit', field: 'lastVisit', title: "最近登入時間", type: 'String'}
	],
	rowClasses: [
		{className: 'lowlight', field: 'lowlight'}
	]}
});
//}}}