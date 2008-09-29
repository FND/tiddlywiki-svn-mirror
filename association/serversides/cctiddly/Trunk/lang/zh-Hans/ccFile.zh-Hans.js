/***
|''Name:''|ccFile.zh-Hans.js|
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
	wizardTitleText:"文件管理",
	wizardStepText:"管理工作区所属文件",
	buttonDeleteText:"删除",
	buttonDeleteTooltip:"删除文件",
	buttonUploadText:"上传",
	buttonUploadTooltip:"上传文件案",
	labelFiles:"文件列表 ",
	errorPermissionDenied:"您没有权限于此主机上创建文件 ",
	listAdminTemplate: {
	columns: [	
	{name: 'wiki text', field: 'wikiText', title: "", type: 'WikiText'},
	{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
	{name: 'Name', field: 'name', title: "文件", type: 'WikiText'},
	{name: 'Size', field: 'fileSize', title: "大小", type: 'String'}
	],
	rowClasses: [
	{className: 'lowlight', field: 'lowlight'}
	]}
});
//}}}