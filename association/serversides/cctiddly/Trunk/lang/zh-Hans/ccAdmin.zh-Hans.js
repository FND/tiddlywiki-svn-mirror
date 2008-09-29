/***
|''Name''|ccAdmin.zh-Hans|
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
	stepAddTitle:"添加工作区管理者",
	WizardTitleText:"工作区管理",
	buttonDeleteText:"删除",
	buttonDeleteTooltip:"删除管理者",
	buttonAddText:"添加",
	buttonAddTooltip:"添加管理者",
	buttonCancelText:"取消",
	buttonCalcelTooltip:"取消添加管理者",
	buttonCreateText:"添加",
	buttonCreateTooltip:"添加工作区管理者",
	labelWorkspace:"工作区：",
	labelUsername:"用户：",
	stepErrorTitle:"您您必须是此工作区管理者",
	stepErrorText:"无权限修改工作区：",
	stepNoAdminTitle:"此工作区尚无管理者",
	stepManageWorkspaceTitle:"",
	listAdminTemplate: {
	columns: [	
		{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
		{name: 'Name', field: 'name', title: "用户", type: 'String'},
		{name: 'Last Visit', field: 'lastVisit', title: "最近登入时间", type: 'String'}
	],
	rowClasses: [
		{className: 'lowlight', field: 'lowlight'}
	]}
});
//}}}