/***
|''Name:''|ccFile.zh-Hant.js|
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
merge(config.macros.ccFile,{
	wizardTitleText:"檔案管理",
	wizardStepText:"管理工作區所屬檔案",
	buttonDeleteText:"刪除",
	buttonDeleteTooltip:"刪除檔案",
	buttonUploadText:"上傳",
	buttonUploadTooltip:"上傳檔案",
	labelFiles:"檔案列表 ",
	errorPermissionDenied:"您沒有權限於此主機上建立檔案 ",
	listAdminTemplate: {
	columns: [	
	{name: 'wiki text', field: 'wikiText', title: "", type: 'WikiText'},
	{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
	{name: 'Name', field: 'name', title: "檔名", type: 'WikiText'},
	{name: 'Size', field: 'fileSize', title: "大小", type: 'String'}
	],
	rowClasses: [
	{className: 'lowlight', field: 'lowlight'}
	]}
});
//}}}