/***
|''Name''|ccAdaptor.zh-Hans|
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
merge(ccTiddlyAdaptor, { 
	errorTitleNotSaved:"<h1>所作的更动 *未完成* 保存</h1>", 
	errorTextSessionExpired:"工作阶段逾时，你必须于新窗口中登入系统，<br />并从本窗口中剪贴更动的资料再复制到新窗口", 
	errorTextConfig:"保存时，发生版本冲突。<br />请于新窗口开启页面后，检视相关更动",
	errorTextUnknown:"发生不明原因的错误",
	errorClose:"关闭",
	buttonOpenNewWindow:"开启新窗口即可重新保存	.... ",
	buttonHideThisMessage:"隐藏此讯息", 
	msgErrorCode:"错误码 : "
	
});
ccTiddlyAdaptor.serverParsingErrorMessage = "自服务器解析资料时发生错误";
ccTiddlyAdaptor.errorInFunctionMessage = "ccTiddlyAdaptor 发生错误：%0";
//}}}